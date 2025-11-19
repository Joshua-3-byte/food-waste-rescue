// backend/routes/orderRoutes.js
const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  createOrder,
  getMyOrders,
  getRestaurantOrders,
  getOrderById,
  markAsPickedUp,
  cancelOrder,
  addReview,
} = require('../controllers/orderController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Customer routes
router.post('/', restrictTo('customer'), createOrder);
router.get('/my-orders', restrictTo('customer'), getMyOrders);
router.patch('/:id/cancel', restrictTo('customer'), cancelOrder);
router.patch('/:id/review', restrictTo('customer'), addReview);

// Restaurant routes
router.get('/restaurant-orders', restrictTo('restaurant'), getRestaurantOrders);
router.patch('/:id/pickup', restrictTo('restaurant'), markAsPickedUp);

// Shared routes
router.get('/:id', getOrderById);

module.exports = router;