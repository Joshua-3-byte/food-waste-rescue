// frontend/src/pages/restaurant/RestaurantOrders.jsx
import { useState, useEffect } from 'react';
import { getRestaurantOrders, markAsPickedUp } from '../../utils/orderService';

const RestaurantOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [verifyingOrder, setVerifyingOrder] = useState(null);
  const [pickupCode, setPickupCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const statusFilter = filter === 'all' ? undefined : filter;
      const data = await getRestaurantOrders(statusFilter);
      setOrders(data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPickup = async (orderId) => {
    if (!pickupCode || pickupCode.length !== 6) {
      setError('Please enter a valid 6-digit pickup code');
      return;
    }

    try {
      setError('');
      await markAsPickedUp(orderId, pickupCode);
      alert('Order marked as picked up successfully! ✅');
      setVerifyingOrder(null);
      setPickupCode('');
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid pickup code');
    }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Incoming Orders</h2>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['all', 'reserved', 'paid', 'picked_up'].map((tab) => (
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
          <p className="text-gray-600">Orders will appear here when customers reserve your items</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
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
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Customer:</span> {order.customerId?.name}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span> {order.customerId?.phone}
                      </p>
                      <p>
                        <span className="font-medium">Quantity:</span> {order.quantity} items
                      </p>
                      <p>
                        <span className="font-medium">Total:</span>{' '}
                        <span className="text-primary font-bold">KES {order.totalPrice}</span>
                      </p>
                      <p>
                        <span className="font-medium">Your Earnings:</span>{' '}
                        <span className="text-green-600 font-bold">KES {order.restaurantEarnings}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status === 'picked_up' ? 'Picked Up' : order.status}
                </span>
              </div>

              {/* Pickup Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Pickup Time:</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(order.listingId?.pickupWindow?.start)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Order Placed:</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Verify Pickup Section */}
              {(order.status === 'reserved' || order.status === 'paid') && (
                <div className="border-t pt-4">
                  {verifyingOrder === order._id ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-900">
                        Enter the customer's pickup code:
                      </p>
                      
                      {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">
                          {error}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength="6"
                          placeholder="6-digit code"
                          value={pickupCode}
                          onChange={(e) => {
                            setPickupCode(e.target.value.replace(/\D/g, ''));
                            setError('');
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center text-xl font-bold tracking-widest"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerifyPickup(order._id)}
                          disabled={pickupCode.length !== 6}
                          className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ✓ Verify & Complete
                        </button>
                        <button
                          onClick={() => {
                            setVerifyingOrder(null);
                            setPickupCode('');
                            setError('');
                          }}
                          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setVerifyingOrder(order._id)}
                      className="w-full bg-primary text-white py-2 rounded-lg hover:bg-green-600 font-medium"
                    >
                      🔒 Verify Pickup Code
                    </button>
                  )}
                </div>
              )}

              {/* Picked Up Info */}
              {order.status === 'picked_up' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                  ✅ Picked up on {formatDate(order.pickedUpAt)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantOrders;