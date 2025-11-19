// backend/routes/listingRoutes.js
const express = require('express');
const { upload } = require('../config/cloudinary');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  createListing,
  getAllListings,
  getListingById,
  getMyListings,
  updateListing,
  deleteListing,
  markAsSoldOut,
  deleteImage,
} = require('../controllers/listingController');

const router = express.Router();

// Public routes
router.get('/', getAllListings);
router.get('/:id', getListingById);

// Protected routes (Restaurant only)
router.use(protect); // All routes below require authentication

router.post(
  '/',
  restrictTo('restaurant'),
  upload.array('images', 5), // Max 5 images
  createListing
);

router.get('/my/listings', restrictTo('restaurant'), getMyListings);

router.put(
  '/:id',
  restrictTo('restaurant'),
  upload.array('images', 5),
  updateListing
);

router.delete('/:id', restrictTo('restaurant'), deleteListing);

router.patch('/:id/sold-out', restrictTo('restaurant'), markAsSoldOut);

router.delete('/:id/images/:publicId', restrictTo('restaurant'), deleteImage);

module.exports = router;