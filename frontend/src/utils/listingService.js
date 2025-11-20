// frontend/src/utils/listingService.js
import API from './api';

// Create listing
export const createListing = async (formData) => {
  const { data } = await API.post('/listings', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

// Get all listings
export const getAllListings = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.cuisine) params.append('cuisine', filters.cuisine);
  if (filters.dietaryTags) params.append('dietaryTags', filters.dietaryTags.join(','));
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
  if (filters.search) params.append('search', filters.search);

  const { data } = await API.get(`/listings?${params.toString()}`);
  return data;
};

// Get single listing
export const getListingById = async (id) => {
  const { data } = await API.get(`/listings/${id}`);
  return data;
};

// Get restaurant's own listings
export const getMyListings = async (status) => {
  const params = status ? `?status=${status}` : '';
  const { data } = await API.get(`/listings/my/listings${params}`);
  return data;
};

// Update listing
export const updateListing = async (id, formData) => {
  const { data } = await API.put(`/listings/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

// Delete listing
export const deleteListing = async (id) => {
  const { data } = await API.delete(`/listings/${id}`);
  return data;
};

// Mark as sold out
export const markAsSoldOut = async (id) => {
  const { data } = await API.patch(`/listings/${id}/sold-out`);
  return data;
};

// Delete image
export const deleteImage = async (listingId, publicId) => {
  const { data } = await API.delete(`/listings/${listingId}/images/${publicId}`);
  return data;
};