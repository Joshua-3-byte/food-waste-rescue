// frontend/src/pages/customer/CustomerDashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getMyOrders, cancelOrder } from '../../utils/orderService';

const CustomerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const statusFilter = filter === 'all' ? undefined : filter;
      const data = await getMyOrders(statusFilter);
      setOrders(data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      await cancelOrder(orderId);
      fetchOrders();
      alert('Order cancelled successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-KE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reserved':
        return 'bg-yellow-100 text-yellow-700';
      case 'paid':
        return 'bg-blue-100 text-blue-700';
      case 'picked_up':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🍕</div>
              <div>
                <h1 className="text-xl font-bold text-primary">Food Waste Rescue</h1>
                <p className="text-xs text-gray-500">Customer Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/browse')}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-green-600 text-sm font-medium"
              >
                Browse Food
              </button>
              <span className="text-sm text-gray-700">Hi, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
          <p className="text-gray-600 mt-1">View and manage your food reservations</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['all', 'reserved', 'paid', 'picked_up', 'cancelled'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                    filter === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'picked_up' ? 'Picked Up' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Review Reminder */}
        {orders.filter(order => order.status === 'picked_up' && !order.rating).length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⭐</span>
              <div className="flex-1">
                <p className="font-medium text-yellow-800 mb-1">
                  Help others by sharing your experience!
                </p>
                <p className="text-sm text-yellow-700 mb-3">
                  You have {orders.filter(order => order.status === 'picked_up' && !order.rating).length} completed order{orders.filter(order => order.status === 'picked_up' && !order.rating).length !== 1 ? 's' : ''} waiting for your review.
                </p>
                <div className="flex flex-wrap gap-2">
                  {orders
                    .filter(order => order.status === 'picked_up' && !order.rating)
                    .slice(0, 3)
                    .map(order => (
                      <button
                        key={order._id}
                        onClick={() => navigate(`/orders/${order._id}/review`)}
                        className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                      >
                        Review {order.listingId?.title}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">Start browsing to find great deals on delicious food!</p>
            <button
              onClick={() => navigate('/browse')}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-600"
            >
              Browse Food
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {order.listingId?.images?.[0] ? (
                        <img
                          src={order.listingId.images[0].url}
                          alt={order.listingId.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                          🍽️
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1">
                        {order.listingId?.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {order.restaurantId?.businessName}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">Quantity: {order.quantity}</span>
                        <span>•</span>
                        <span className="font-medium text-primary">KES {order.totalPrice}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status === 'picked_up' ? 'Picked Up' : order.status}
                  </span>
                </div>

                {/* Pickup Code (for reserved/paid orders) */}
                {(order.status === 'reserved' || order.status === 'paid') && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-yellow-800 mb-1">Pickup Code:</p>
                        <p className="text-2xl font-bold text-yellow-900">{order.pickupCode}</p>
                      </div>
                      <div className="text-sm text-yellow-700">
                        <p>Show this code</p>
                        <p>at pickup</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pickup Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-600">Pickup Time:</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(order.listingId?.pickupWindow?.start)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Location:</p>
                    <p className="font-medium text-gray-900">
                      {order.restaurantId?.address?.street}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Contact:</p>
                    <p className="font-medium text-gray-900">
                      {order.restaurantId?.phone}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/listings/${order.listingId?._id}`)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
                  >
                    View Details
                  </button>

                  {order.status === 'reserved' && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium"
                    >
                      Cancel Order
                    </button>
                  )}

                  {order.status === 'picked_up' && !order.rating && (
                    <button
                      onClick={() => navigate(`/orders/${order._id}/review`)}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-green-600 text-sm font-medium"
                    >
                      Leave Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
