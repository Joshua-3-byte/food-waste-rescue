// backend/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    platformFee: {
      type: Number,
      required: true,
      default: 0,
    },
    restaurantEarnings: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['reserved', 'paid', 'picked_up', 'cancelled'],
      default: 'reserved',
    },
    pickupCode: {
      type: String,
      required: true,
      unique: true,
      default: function() {
        // Generate 6-digit code immediately when schema is created
        return Math.floor(100000 + Math.random() * 900000).toString();
      }
    },
    paymentMethod: {
      type: String,
      enum: ['mpesa', 'card', 'cash'],
      default: 'mpesa',
    },
    paymentId: String,
    mpesaReceiptNumber: String,
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: String,
    pickedUpAt: Date,
  },
  {
    timestamps: true,
  }
);

// Alternative: Generate pickup code in pre-save hook (backup method)
orderSchema.pre('save', function (next) {
  if (this.isNew && !this.pickupCode) {
    this.pickupCode = Math.floor(100000 + Math.random() * 900000).toString();
  }
  next();
});

// Create index for faster queries
orderSchema.index({ customerId: 1, status: 1 });
orderSchema.index({ restaurantId: 1, status: 1 });
orderSchema.index({ pickupCode: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;