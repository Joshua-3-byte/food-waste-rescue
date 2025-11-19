// backend/controllers/listingController.js
const Listing = require('../models/Listing');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// @desc    Create new listing
// @route   POST /api/listings
// @access  Private (Restaurant only)
exports.createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      cuisine,
      dietaryTags,
      originalPrice,
      discountedPrice,
      quantity,
      pickupWindow,
    } = req.body;

    // Validate restaurant
    const restaurant = await User.findById(req.user.id);
    if (!restaurant || restaurant.role !== 'restaurant') {
      return res.status(403).json({ message: 'Only restaurants can create listings' });
    }

    // Check if restaurant is verified (optional - remove if not needed)
    // if (!restaurant.verified) {
    //   return res.status(403).json({ message: 'Please verify your restaurant account first' });
    // }

    // Validate prices
    if (parseFloat(discountedPrice) >= parseFloat(originalPrice)) {
      return res.status(400).json({ message: 'Discounted price must be less than original price' });
    }

    // Validate pickup window
    const pickupStart = new Date(pickupWindow.start);
    const pickupEnd = new Date(pickupWindow.end);
    
    if (pickupStart >= pickupEnd) {
      return res.status(400).json({ message: 'Pickup end time must be after start time' });
    }

    if (pickupStart < new Date()) {
      return res.status(400).json({ message: 'Pickup start time cannot be in the past' });
    }

    // Process uploaded images
    const images = req.files ? req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
    })) : [];

    // Create listing
    const listing = await Listing.create({
      restaurantId: req.user.id,
      title,
      description,
      cuisine,
      dietaryTags: dietaryTags ? JSON.parse(dietaryTags) : [],
      originalPrice,
      discountedPrice,
      quantity,
      quantityRemaining: quantity,
      pickupWindow: {
        start: pickupStart,
        end: pickupEnd,
      },
      images,
      expiresAt: pickupEnd,
    });

    // Populate restaurant details
    await listing.populate('restaurantId', 'businessName address rating');

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      listing,
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all active listings (for customers)
// @route   GET /api/listings
// @access  Public
exports.getAllListings = async (req, res) => {
  try {
    const { cuisine, dietaryTags, maxPrice, search } = req.query;

    // Build filter query
    const filter = { status: 'active', expiresAt: { $gt: new Date() } };

    if (cuisine) {
      filter.cuisine = cuisine;
    }

    if (dietaryTags) {
      filter.dietaryTags = { $in: dietaryTags.split(',') };
    }

    if (maxPrice) {
      filter.discountedPrice = { $lte: parseFloat(maxPrice) };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const listings = await Listing.find(filter)
      .populate('restaurantId', 'businessName address rating profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single listing by ID
// @route   GET /api/listings/:id
// @access  Public
exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('restaurantId', 'businessName address rating phone operatingHours');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.status(200).json({
      success: true,
      listing,
    });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get restaurant's own listings
// @route   GET /api/listings/my-listings
// @access  Private (Restaurant only)
exports.getMyListings = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = { restaurantId: req.user.id };
    
    if (status) {
      filter.status = status;
    }

    const listings = await Listing.find(filter).sort({ createdAt: -1 });

    // Calculate stats
    const stats = {
      total: listings.length,
      active: listings.filter(l => l.status === 'active').length,
      soldOut: listings.filter(l => l.status === 'sold_out').length,
      expired: listings.filter(l => l.status === 'expired').length,
    };

    res.status(200).json({
      success: true,
      stats,
      listings,
    });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private (Restaurant only - own listings)
exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check ownership
    if (listing.restaurantId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    // Prevent updating sold out or expired listings
    if (listing.status !== 'active') {
      return res.status(400).json({ message: 'Cannot update non-active listings' });
    }

    const {
      title,
      description,
      cuisine,
      dietaryTags,
      originalPrice,
      discountedPrice,
      quantity,
      pickupWindow,
    } = req.body;

    // Update fields
    if (title) listing.title = title;
    if (description) listing.description = description;
    if (cuisine) listing.cuisine = cuisine;
    if (dietaryTags) listing.dietaryTags = JSON.parse(dietaryTags);
    if (originalPrice) listing.originalPrice = originalPrice;
    if (discountedPrice) listing.discountedPrice = discountedPrice;
    if (quantity) {
      listing.quantity = quantity;
      listing.quantityRemaining = quantity;
    }
    if (pickupWindow) {
      listing.pickupWindow = {
        start: new Date(pickupWindow.start),
        end: new Date(pickupWindow.end),
      };
      listing.expiresAt = new Date(pickupWindow.end);
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: file.path,
        publicId: file.filename,
      }));
      listing.images.push(...newImages);
    }

    await listing.save();

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      listing,
    });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private (Restaurant only - own listings)
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check ownership
    if (listing.restaurantId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    // Delete images from Cloudinary
    if (listing.images && listing.images.length > 0) {
      for (const image of listing.images) {
        if (image.publicId) {
          await cloudinary.uploader.destroy(image.publicId);
        }
      }
    }

    await listing.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully',
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark listing as sold out
// @route   PATCH /api/listings/:id/sold-out
// @access  Private (Restaurant only - own listings)
exports.markAsSoldOut = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check ownership
    if (listing.restaurantId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    listing.status = 'sold_out';
    listing.quantityRemaining = 0;
    await listing.save();

    res.status(200).json({
      success: true,
      message: 'Listing marked as sold out',
      listing,
    });
  } catch (error) {
    console.error('Mark sold out error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete single image from listing
// @route   DELETE /api/listings/:id/images/:publicId
// @access  Private (Restaurant only - own listings)
exports.deleteImage = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check ownership
    if (listing.restaurantId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { publicId } = req.params;

    // Find and remove image
    const imageIndex = listing.images.findIndex(img => img.publicId === publicId);

    if (imageIndex === -1) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Remove from array
    listing.images.splice(imageIndex, 1);
    await listing.save();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      listing,
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};