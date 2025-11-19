// backend/controllers/orderController.js
const Order = require('../models/Order');
const Listing = require('../models/Listing');
const User = require('../models/User');

// @desc    Create order (reserve listing)
// @route   POST /api/orders
// @access  Private (Customer only)
exports.createOrder = async (req, res) => {
  try {
    const { listingId, quantity, paymentMethod } = req.body;

    // Validate customer
    const customer = await User.findById(req.user.id);
    if (!customer || customer.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can create orders' });
    }

    // Get listing
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if listing is active
    if (listing.status !== 'active') {
      return res.status(400).json({ message: 'This listing is no longer available' });
    }

    // Check if listing has expired
    if (new Date() > new Date(listing.expiresAt)) {
      listing.status = 'expired';
      await listing.save();
      return res.status(400).json({ message: 'This listing has expired' });
    }

    // Check quantity available
    if (quantity > listing.quantityRemaining) {
      return res.status(400).json({ 
        message: `Only ${listing.quantityRemaining} items remaining` 
      });
    }

    // Calculate prices (15% platform fee)
    const totalPrice = listing.discountedPrice * quantity;
    const platformFee = Math.round(totalPrice * 0.15);
    const restaurantEarnings = totalPrice - platformFee;

    // Create order
    const order = await Order.create({
      customerId: req.user.id,
      restaurantId: listing.restaurantId,
      listingId,
      quantity,
      totalPrice,
      platformFee,
      restaurantEarnings,
      paymentMethod,
      status: 'reserved', // Will change to 'paid' after payment
    });

    // Update listing quantity
    listing.quantityRemaining -= quantity;
    if (listing.quantityRemaining === 0) {
      listing.status = 'sold_out';
    }
    await listing.save();

    // Populate details
    await order.populate([
      { path: 'listingId', select: 'title images pickupWindow' },
      { path: 'restaurantId', select: 'businessName address phone' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get customer's orders
// @route   GET /api/orders/my-orders
// @access  Private (Customer only)
exports.getMyOrders = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = { customerId: req.user.id };
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('listingId', 'title images cuisine')
      .populate('restaurantId', 'businessName address phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get restaurant's orders
// @route   GET /api/orders/restaurant-orders
// @access  Private (Restaurant only)
exports.getRestaurantOrders = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = { restaurantId: req.user.id };
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('customerId', 'name phone email')
      .populate('listingId', 'title images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Get restaurant orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private (Order owner only)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name phone email')
      .populate('restaurantId', 'businessName address phone')
      .populate('listingId', 'title images pickupWindow cuisine');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    if (
      order.customerId._id.toString() !== req.user.id &&
      order.restaurantId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark order as picked up (verify pickup code)
// @route   PATCH /api/orders/:id/pickup
// @access  Private (Restaurant only)
exports.markAsPickedUp = async (req, res) => {
  try {
    const { pickupCode } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if restaurant owns this order
    if (order.restaurantId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Verify pickup code
    if (order.pickupCode !== pickupCode) {
      return res.status(400).json({ message: 'Invalid pickup code' });
    }

    // Check if already picked up
    if (order.status === 'picked_up') {
      return res.status(400).json({ message: 'Order already picked up' });
    }

    order.status = 'picked_up';
    order.pickedUpAt = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order marked as picked up',
      order,
    });
  } catch (error) {
    console.error('Mark pickup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Cancel order
// @route   PATCH /api/orders/:id/cancel
// @access  Private (Customer only - own orders)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if customer owns this order
    if (order.customerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Can't cancel if already picked up
    if (order.status === 'picked_up') {
      return res.status(400).json({ message: 'Cannot cancel completed order' });
    }

    // Restore listing quantity
    const listing = await Listing.findById(order.listingId);
    if (listing) {
      listing.quantityRemaining += order.quantity;
      if (listing.status === 'sold_out') {
        listing.status = 'active';
      }
      await listing.save();
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add rating and review
// @route   PATCH /api/orders/:id/review
// @access  Private (Customer only - own orders)
exports.addReview = async (req, res) => {
  try {
    const { rating, review } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if customer owns this order
    if (order.customerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Can only review picked up orders
    if (order.status !== 'picked_up') {
      return res.status(400).json({ message: 'Can only review completed orders' });
    }

    order.rating = rating;
    order.review = review;
    await order.save();

    // Update restaurant rating
    const restaurant = await User.findById(order.restaurantId);
    if (restaurant) {
      const totalRating = restaurant.rating * restaurant.totalRatings + rating;
      restaurant.totalRatings += 1;
      restaurant.rating = totalRating / restaurant.totalRatings;
      await restaurant.save();
    }

    res.status(200).json({
      success: true,
      message: 'Review added successfully',
      order,
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};