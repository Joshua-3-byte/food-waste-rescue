// frontend/src/utils/listingService.js
import API from './api';

// Create listing
export const createListing = async (formData) => {
  try {
    console.log('Sending create listing request...');
    
    // Log FormData contents for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`FormData - ${key}:`, value);
    }

    const { data } = await API.post('/listings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 second timeout
    });
    
    console.log('Create listing success:', data);
    return data;
  } catch (error) {
    console.error('Create listing error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    
    // Re-throw the error so the form can handle it
    throw error;
  }
};

// Get all listings
export const getAllListings = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.cuisine) params.append('cuisine', filters.cuisine);
    if (filters.dietaryTags) params.append('dietaryTags', filters.dietaryTags.join(','));
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.search) params.append('search', filters.search);

    const { data } = await API.get(`/listings?${params.toString()}`);
    return data;
  } catch (error) {
    console.error('Get all listings error:', error);
    throw error;
  }
};

// Get single listing
export const getListingById = async (id) => {
  try {
    const { data } = await API.get(`/listings/${id}`);
    return data;
  } catch (error) {
    console.error('Get listing by ID error:', error);
    throw error;
  }
};

// Get restaurant's own listings
export const getMyListings = async (status) => {
  try {
    const params = status ? `?status=${status}` : '';
    const { data } = await API.get(`/listings/my/listings${params}`);
    return data;
  } catch (error) {
    console.error('Get my listings error:', error);
    throw error;
  }
};

// Update listing
export const updateListing = async (id, formData) => {
  try {
    const { data } = await API.put(`/listings/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    console.error('Update listing error:', error);
    throw error;
  }
};

// Delete listing
export const deleteListing = async (id) => {
  try {
    const { data } = await API.delete(`/listings/${id}`);
    return data;
  } catch (error) {
    console.error('Delete listing error:', error);
    throw error;
  }
};

// Mark as sold out
export const markAsSoldOut = async (id) => {
  try {
    const { data } = await API.patch(`/listings/${id}/sold-out`);
    return data;
  } catch (error) {
    console.error('Mark as sold out error:', error);
    throw error;
  }
};

// Delete image
export const deleteImage = async (listingId, publicId) => {
  try {
    const { data } = await API.delete(`/listings/${listingId}/images/${publicId}`);
    return data;
  } catch (error) {
    console.error('Delete image error:', error);
    throw error;
  }
};