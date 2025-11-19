// backend/models/Listing.js
const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    images: [
      {
        url: String,
        publicId: String, // For Cloudinary deletion
      },
    ],
    cuisine: {
      type: String,
      required: true,
    },
    dietaryTags: [
      {
        type: String,
        enum: ['vegetarian', 'vegan', 'gluten-free', 'halal', 'kosher', 'dairy-free', 'nut-free'],
      },
    ],
    originalPrice: {
      type: Number,
      required: [true, 'Original price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountedPrice: {
      type: Number,
      required: [true, 'Discounted price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    quantityRemaining: {
      type: Number,
      required: true,
    },
    pickupWindow: {
      start: {
        type: Date,
        required: [true, 'Pickup start time is required'],
      },
      end: {
        type: Date,
        required: [true, 'Pickup end time is required'],
      },
    },
    status: {
      type: String,
      enum: ['active', 'sold_out', 'expired'],
      default: 'active',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate discount percentage before saving
listingSchema.pre('save', function (next) {
  if (this.originalPrice && this.discountedPrice) {
    this.discountPercentage = Math.round(
      ((this.originalPrice - this.discountedPrice) / this.originalPrice) * 100
    );
  }
  
  // Set quantityRemaining on creation
  if (this.isNew) {
    this.quantityRemaining = this.quantity;
  }
  
  next();
});

// Create index for faster queries
listingSchema.index({ restaurantId: 1, status: 1 });
listingSchema.index({ expiresAt: 1 });

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;