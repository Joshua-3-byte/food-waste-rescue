// frontend/src/pages/customer/BrowseListings.jsx
import { useState, useEffect } from 'react';
import { getAllListings } from '../../utils/listingService';
import { useNavigate } from 'react-router-dom';
import ListingsMap from '../../components/customer/ListingsMap';

const CUISINE_OPTIONS = [
  'All', 'Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese',
  'American', 'Thai', 'Mediterranean', 'African', 'Other'
];

const DIETARY_TAGS = [
  'vegetarian', 'vegan', 'gluten-free', 'halal', 'kosher', 'dairy-free', 'nut-free'
];

const BrowseListings = () => {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    cuisine: '',
    dietaryTags: [],
    maxPrice: '',
    search: '',
  });

  // Added for view mode toggle
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await getAllListings(filters);
      setListings(data.listings);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDietaryTagToggle = (tag) => {
    setFilters(prev => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(tag)
        ? prev.dietaryTags.filter(t => t !== tag)
        : [...prev.dietaryTags, tag]
    }));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-KE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const clearFilters = () => {
    setFilters({
      cuisine: '',
      dietaryTags: [],
      maxPrice: '',
      search: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">🍕 Food Waste Rescue</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              My Orders →
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search for food..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                viewMode === 'grid'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📋 List View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                viewMode === 'map'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🗺️ Map View
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-xs text-primary hover:text-green-600"
                >
                  Clear All
                </button>
              </div>

              {/* Cuisine Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine
                </label>
                <select
                  value={filters.cuisine}
                  onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  {CUISINE_OPTIONS.map(cuisine => (
                    <option key={cuisine} value={cuisine === 'All' ? '' : cuisine}>
                      {cuisine}
                    </option>
                  ))}
                </select>
              </div>

              {/* Max Price Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price (KES)
                </label>
                <input
                  type="number"
                  placeholder="Any price"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              {/* Dietary Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Preferences
                </label>
                <div className="space-y-2">
                  {DIETARY_TAGS.map(tag => (
                    <label key={tag} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.dietaryTags.includes(tag)}
                        onChange={() => handleDietaryTagToggle(tag)}
                        className="mr-2 rounded text-primary focus:ring-primary"
                      />
                      <span className="text-sm capitalize">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Listings - Grid or Map View */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading delicious deals...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or check back later</p>
                <button
                  onClick={clearFilters}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-600"
                >
                  Clear Filters
                </button>
              </div>
            ) : viewMode === 'map' ? (
              <div className="h-[600px]">
                <ListingsMap listings={listings} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <div
                    key={listing._id}
                    onClick={() => navigate(`/listings/${listing._id}`)}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gray-200">
                      {listing.images && listing.images.length > 0 ? (
                        <img
                          src={listing.images[0].url}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                          🍽️
                        </div>
                      )}

                      {/* Discount Badge */}
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        {listing.discountPercentage}% OFF
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
                        {listing.title}
                      </h3>

                      {/* Restaurant Name + Rating */}
                      <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                        {listing.restaurantId?.businessName}
                        {listing.restaurantId?.rating > 0 && (
                          <span className="flex items-center text-yellow-600">
                            <span className="text-xs">⭐</span>
                            <span className="text-xs font-medium ml-1">
                              {listing.restaurantId.rating.toFixed(1)}
                            </span>
                          </span>
                        )}
                      </p>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {listing.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {listing.cuisine}
                        </span>
                        {listing.dietaryTags?.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-2xl font-bold text-primary">
                            KES {listing.discountedPrice}
                          </span>
                          <span className="text-sm text-gray-500 line-through ml-2">
                            KES {listing.originalPrice}
                          </span>
                        </div>
                      </div>

                      {/* Quantity & Time */}
                      <div className="text-xs text-gray-500 space-y-1">
                        <p className="font-medium text-gray-700">
                          {listing.quantityRemaining} left
                        </p>
                        <p>Pickup: {formatDate(listing.pickupWindow.start)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseListings;
