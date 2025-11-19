// frontend/src/pages/restaurant/RestaurantReviews.jsx
import { useState, useEffect } from 'react';
import { getRestaurantOrders } from '../../utils/orderService';

const RestaurantReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getRestaurantOrders('picked_up');
      
      // Filter orders that have reviews
      const reviewedOrders = data.orders.filter(order => order.rating);
      setReviews(reviewedOrders);

      // Calculate stats
      if (reviewedOrders.length > 0) {
        const totalRating = reviewedOrders.reduce((sum, order) => sum + order.rating, 0);
        const avgRating = totalRating / reviewedOrders.length;
        
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviewedOrders.forEach(order => {
          breakdown[order.rating]++;
        });

        setStats({
          totalReviews: reviewedOrders.length,
          averageRating: avgRating,
          ratingBreakdown: breakdown
        });
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-KE', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-xl">
            {star <= rating ? '⭐' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600">Reviews will appear here after customers complete their pickups</p>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Rating Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Overall Rating</h3>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary">
                    {stats.averageRating.toFixed(1)}
                  </div>
                  <div className="flex justify-center mt-2">
                    {renderStars(Math.round(stats.averageRating))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Rating Breakdown</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-12">{rating} star{rating !== 1 ? 's' : ''}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{
                          width: `${stats.totalReviews > 0 ? (stats.ratingBreakdown[rating] / stats.totalReviews) * 100 : 0}%`
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">
                      {stats.ratingBreakdown[rating]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Individual Reviews */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="font-semibold text-gray-900">All Reviews</h3>
            </div>
            <div className="divide-y">
              {reviews.map((order) => (
                <div key={order._id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                          {order.customerId?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.customerId?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(order.pickedUpAt)}
                          </p>
                        </div>
                      </div>
                      {renderStars(order.rating)}
                    </div>
                  </div>

                  {/* Review Text */}
                  {order.review && (
                    <p className="text-gray-700 mt-3 bg-gray-50 p-4 rounded-lg">
                      "{order.review}"
                    </p>
                  )}

                  {/* Order Details */}
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                    <span>📦 {order.listingId?.title}</span>
                    <span>•</span>
                    <span>Qty: {order.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RestaurantReviews;