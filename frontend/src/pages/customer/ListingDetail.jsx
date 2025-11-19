// frontend/src/pages/customer/ListingDetail.jsx
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getListingById } from '../../utils/listingService';
import { createOrder } from '../../utils/orderService';
import { AuthContext } from '../../context/AuthContext';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [ordering, setOrdering] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const data = await getListingById(id);
      setListing(data.listing);
    } catch (error) {
      console.error('Failed to fetch listing:', error);
      setError('Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'customer') {
      alert('Only customers can place orders');
      return;
    }

    setError('');
    setOrdering(true);

    try {
      await createOrder({
        listingId: listing._id,
        quantity,
        paymentMethod: 'mpesa', // Will implement payment later
      });

      alert('Order placed successfully! Check "My Orders"');
      navigate('/my-orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setOrdering(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-KE', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing not found</h2>
          <button
            onClick={() => navigate('/browse')}
            className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-600"
          >
            Browse Listings
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = listing.discountedPrice * quantity;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/browse')}
            className="text-primary hover:text-green-600 font-medium"
          >
            ← Back to Browse
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images Section */}
          <div>
            {/* Main Image */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
              {listing.images && listing.images.length > 0 ? (
                <img
                  src={listing.images[selectedImage].url}
                  alt={listing.title}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 flex items-center justify-center bg-gray-200 text-gray-400 text-6xl">
                  🍽️
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {listing.images && listing.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${listing.title} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              {/* Restaurant Info */}
              <div className="mb-4">
                <p className="text-sm text-gray-600">From</p>
                <h2 className="text-xl font-bold text-gray-900">
                  {listing.restaurantId?.businessName}
                </h2>
                {listing.restaurantId?.rating > 0 && (
                  <div className="flex items-center mt-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm text-gray-600 ml-1">
                      {listing.restaurantId.rating.toFixed(1)} ({listing.restaurantId.totalRatings} reviews)
                    </span>
                  </div>
                )}
              </div>

              <hr className="my-4" />

              {/* Title & Description */}
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {listing.title}
              </h1>

              <p className="text-gray-700 mb-4">
                {listing.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                  {listing.cuisine}
                </span>
                {listing.dietaryTags?.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <hr className="my-4" />

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl font-bold text-primary">
                    KES {listing.discountedPrice}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    KES {listing.originalPrice}
                  </span>
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                    {listing.discountPercentage}% OFF
                  </span>
                </div>
                <p className="text-sm text-gray-600">per item</p>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 bg-gray-200 rounded-lg font-bold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(listing.quantityRemaining, parseInt(e.target.value) || 1)))}
                    min="1"
                    max={listing.quantityRemaining}
                    className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2 font-medium"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(listing.quantityRemaining, quantity + 1))}
                    disabled={quantity >= listing.quantityRemaining}
                    className="w-10 h-10 bg-gray-200 rounded-lg font-bold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-600 ml-2">
                    ({listing.quantityRemaining} available)
                  </span>
                </div>
              </div>

              {/* Total Price */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-medium">KES {totalPrice}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Platform Fee (15%):</span>
                  <span className="font-medium">KES {Math.round(totalPrice * 0.15)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total:</span>
                  <span className="font-bold text-xl text-primary">KES {totalPrice}</span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {/* Reserve Button */}
              <button
                onClick={handleOrder}
                disabled={ordering || listing.status !== 'active'}
                className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {ordering ? 'Processing...' : listing.status !== 'active' ? 'Sold Out' : 'Reserve Now'}
              </button>

              <hr className="my-6" />

              {/* Pickup Info */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900">Pickup Information</h3>
                
                <div className="flex items-start">
                  <span className="text-xl mr-3">📍</span>
                  <div>
                    <p className="font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">
                      {listing.restaurantId?.address?.street}, {listing.restaurantId?.address?.city}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="text-xl mr-3">⏰</span>
                  <div>
                    <p className="font-medium text-gray-900">Pickup Window</p>
                    <p className="text-sm text-gray-600">
                      From: {formatDate(listing.pickupWindow.start)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Until: {formatDate(listing.pickupWindow.end)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="text-xl mr-3">📞</span>
                  <div>
                    <p className="font-medium text-gray-900">Contact</p>
                    <p className="text-sm text-gray-600">
                      {listing.restaurantId?.phone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> You'll receive a pickup code after payment. Show this code to the restaurant when collecting your order.
                </p>
              </div>

              {/* Reviews Section */}
              <div className="mt-8">
                <hr className="my-6" />
                
                <h3 className="font-bold text-gray-900 text-xl mb-4">Customer Reviews</h3>

                {listing.restaurantId?.rating > 0 ? (
                  <div className="space-y-4">
                    {/* Overall Rating Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900">
                          {listing.restaurantId.rating.toFixed(1)}
                        </div>
                        <div className="flex items-center justify-center mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className="text-xl">
                              {star <= Math.round(listing.restaurantId.rating) ? '⭐' : '☆'}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {listing.restaurantId.totalRatings} review{listing.restaurantId.totalRatings !== 1 ? 's' : ''}
                        </p>
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">
                          Based on customer ratings for all orders from {listing.restaurantId.businessName}
                        </p>
                      </div>
                    </div>

                    {/* Note about reviews */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        💡 Reviews are shown after customers complete their pickup. Order now to see what others think!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-3">⭐</div>
                    <p className="text-gray-600">No reviews yet</p>
                    <p className="text-sm text-gray-500 mt-1">Be the first to order and review!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
