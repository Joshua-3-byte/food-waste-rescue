// frontend/src/components/restaurant/CreateListingForm.jsx
import { useState } from 'react';
import { createListing } from '../../utils/listingService';

const CUISINE_OPTIONS = [
  'Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese',
  'American', 'Thai', 'Mediterranean', 'African', 'Other'
];

const DIETARY_TAGS = [
  'vegetarian', 'vegan', 'gluten-free', 'halal', 'kosher', 'dairy-free', 'nut-free'
];

const CreateListingForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cuisine: '',
    dietaryTags: [],
    originalPrice: '',
    discountedPrice: '',
    quantity: '',
    pickupStart: '',
    pickupEnd: '',
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-calculate discounted price (50% off by default)
    if (name === 'originalPrice' && value && !formData.discountedPrice) {
      setFormData(prev => ({
        ...prev,
        discountedPrice: Math.round(value * 0.5)
      }));
    }
  };

  const handleDietaryTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(tag)
        ? prev.dietaryTags.filter(t => t !== tag)
        : [...prev.dietaryTags, tag]
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    setImages(prev => [...prev, ...files]);

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (parseFloat(formData.discountedPrice) >= parseFloat(formData.originalPrice)) {
        setError('Discounted price must be less than original price');
        setLoading(false);
        return;
      }

      if (new Date(formData.pickupStart) >= new Date(formData.pickupEnd)) {
        setError('Pickup end time must be after start time');
        setLoading(false);
        return;
      }

      if (images.length === 0) {
        setError('Please upload at least one image');
        setLoading(false);
        return;
      }

      // Create FormData
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('cuisine', formData.cuisine);
      data.append('dietaryTags', JSON.stringify(formData.dietaryTags));
      data.append('originalPrice', formData.originalPrice);
      data.append('discountedPrice', formData.discountedPrice);
      data.append('quantity', formData.quantity);
      data.append('pickupWindow[start]', new Date(formData.pickupStart).toISOString());
      data.append('pickupWindow[end]', new Date(formData.pickupEnd).toISOString());

      // Append images
      images.forEach(image => {
        data.append('images', image);
      });

      await createListing(data);
      
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900">Create New Listing</h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          name="title"
          required
          maxLength="100"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Fresh Pizza Slices"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          name="description"
          required
          maxLength="500"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your food item..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.description.length}/500 characters
        </p>
      </div>

      {/* Cuisine */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cuisine Type *
        </label>
        <select
          name="cuisine"
          required
          value={formData.cuisine}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select cuisine</option>
          {CUISINE_OPTIONS.map(cuisine => (
            <option key={cuisine} value={cuisine}>{cuisine}</option>
          ))}
        </select>
      </div>

      {/* Dietary Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dietary Tags (Optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {DIETARY_TAGS.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => handleDietaryTagToggle(tag)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                formData.dietaryTags.includes(tag)
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Prices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Original Price (KES) *
          </label>
          <input
            type="number"
            name="originalPrice"
            required
            min="1"
            value={formData.originalPrice}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discounted Price (KES) *
          </label>
          <input
            type="number"
            name="discountedPrice"
            required
            min="1"
            value={formData.discountedPrice}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount
          </label>
          <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-md text-green-700 font-medium">
            {formData.originalPrice && formData.discountedPrice
              ? `${Math.round(((formData.originalPrice - formData.discountedPrice) / formData.originalPrice) * 100)}% OFF`
              : '0% OFF'}
          </div>
        </div>
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quantity Available *
        </label>
        <input
          type="number"
          name="quantity"
          required
          min="1"
          value={formData.quantity}
          onChange={handleChange}
          placeholder="How many portions/items?"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Pickup Window */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pickup Start Time *
          </label>
          <input
            type="datetime-local"
            name="pickupStart"
            required
            value={formData.pickupStart}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pickup End Time *
          </label>
          <input
            type="datetime-local"
            name="pickupEnd"
            required
            value={formData.pickupEnd}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Images * (Max 5)
        </label>
        
        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {images.length < 5 && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition">
            <input
              type="file"
              id="images"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
            <label
              htmlFor="images"
              className="cursor-pointer text-primary hover:text-green-600"
            >
              <div className="text-4xl mb-2">📷</div>
              <p className="text-sm font-medium">Click to upload images</p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP (Max 5MB each)</p>
            </label>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Creating...' : 'Create Listing'}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default CreateListingForm;