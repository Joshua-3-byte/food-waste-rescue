// frontend/src/utils/orderService.js
import API from './api';

// Create order
export const createOrder = async (orderData) => {
  const { data } = await API.post('/orders', orderData);
  return data;
};

// Get customer's orders
export const getMyOrders = async (status) => {
  const params = status ? `?status=${status}` : '';
  const { data } = await API.get(`/orders/my-orders${params}`);
  return data;
};

// Get restaurant's orders
export const getRestaurantOrders = async (status) => {
  const params = status ? `?status=${status}` : '';
  const { data } = await API.get(`/orders/restaurant-orders${params}`);
  return data;
};

// Get single order
export const getOrderById = async (id) => {
  const { data } = await API.get(`/orders/${id}`);
  return data;
};

// Cancel order
export const cancelOrder = async (id) => {
  const { data } = await API.patch(`/orders/${id}/cancel`);
  return data;
};

// Mark as picked up
export const markAsPickedUp = async (id, pickupCode) => {
  const { data } = await API.patch(`/orders/${id}/pickup`, { pickupCode });
  return data;
};

// Add review
export const addReview = async (id, rating, review) => {
  const { data } = await API.patch(`/orders/${id}/review`, { rating, review });
  return data;
};