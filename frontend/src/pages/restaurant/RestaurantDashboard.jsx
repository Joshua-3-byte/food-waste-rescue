// frontend/src/pages/restaurant/RestaurantDashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getMyListings, deleteListing, markAsSoldOut } from '../../utils/listingService';
import CreateListingForm from '../../components/restaurant/CreateListingForm';
import { useNavigate } from 'react-router-dom';
import RestaurantOrders from './RestaurantOrders';
import RestaurantReviews from './RestaurantReviews'; // <- added for reviews tab

const RestaurantDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, soldOut: 0, expired: 0 });
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('listings'); // 'listings', 'orders', or 'reviews'

  useEffect(() => {
    if (activeTab === 'listings') {
      fetchListings();
    }
  }, [filter, activeTab]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const statusFilter = filter === 'all' ? undefined : filter;
      const data = await getMyListings(statusFilter);
      setListings(data.listings);
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      await deleteListing(id);
      fetchListings();
    } catch (error) {
      console.log(error);
      alert('Failed to delete listing');
    }
  };

  const handleMarkSoldOut = async (id) => {
    try {
      await markAsSoldOut(id);
      fetchListings();
    } catch (error) {
      console.log(error);
      alert('Failed to mark as sold out');
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
                <p className="text-xs text-gray-500">{user?.businessName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-gray-600 text-sm">Total Listings</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-gray-600 text-sm">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-2">🔴</div>
            <p className="text-gray-600 text-sm">Sold Out</p>
            <p className="text-2xl font-bold text-orange-600">{stats.soldOut}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-2">⏰</div>
            <p className="text-gray-600 text-sm">Expired</p>
            <p className="text-2xl font-bold text-gray-600">{stats.expired}</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('listings')}
                className={`py-4 px-8 text-sm font-medium border-b-2 transition ${
                  activeTab === 'listings'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📋 My Listings
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-8 text-sm font-medium border-b-2 transition ${
                  activeTab === 'orders'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📦 Incoming Orders
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-8 text-sm font-medium border-b-2 transition ${
                  activeTab === 'reviews'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ⭐ Reviews
              </button>
            </nav>
          </div>
        </div>

        {/* Conditional Tabs Rendering */}
        {activeTab === 'listings' ? (
          <>
            {/* Create Listing Button */}
            {!showCreateForm && (
              <div className="mb-6">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-green-600 font-medium shadow-md"
                >
                  + Create New Listing
                </button>
              </div>
            )}

            {/* Create Listing Form */}
            {showCreateForm && (
              <div className="mb-8">
                <CreateListingForm
                  onSuccess={() => {
                    setShowCreateForm(false);
                    fetchListings();
                  }}
                  onCancel={() => setShowCreateForm(false)}
                />
              </div>
            )}

            {/* Filter Tabs */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  {['all', 'active', 'sold_out', 'expired'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setFilter(tab)}
                      className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                        filter === tab
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab === 'sold_out'
                        ? 'Sold Out'
                        : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Listings Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading listings...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No listings yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first listing to start reducing food waste!
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-600"
                >
                  Create Listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <div key={listing._id} className="bg-white rounded-lg shadow overflow-hidden">
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

                      {/* Status Badge */}
                      <div
                        className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium ${
                          listing.status === 'active'
                            ? 'bg-green-500 text-white'
                            : listing.status === 'sold_out'
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-500 text-white'
                        }`}
                      >
                        {listing.status === 'sold_out' ? 'Sold Out' : listing.status}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 truncate">
                        {listing.title}
                      </h3>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {listing.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {listing.cuisine}
                        </span>
                        {listing.dietaryTags?.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl font-bold text-primary">
                          KES {listing.discountedPrice}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          KES {listing.originalPrice}
                        </span>
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          {listing.discountPercentage}% OFF
                        </span>
                      </div>

                      {/* Quantity */}
                      <p className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">{listing.quantityRemaining}</span> / {listing.quantity} remaining
                      </p>

                      {/* Pickup Time */}
                      <div className="text-xs text-gray-500 mb-4">
                        <p>Pickup: {formatDate(listing.pickupWindow.start)}</p>
                        <p>Until: {formatDate(listing.pickupWindow.end)}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {listing.status === 'active' && (
                          <>
                            <button
                              onClick={() => handleMarkSoldOut(listing._id)}
                              className="flex-1 px-3 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600"
                            >
                              Mark Sold Out
                            </button>
                            <button
                              onClick={() => handleDelete(listing._id)}
                              className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </>
                        )}

                        {listing.status !== 'active' && (
                          <button
                            onClick={() => handleDelete(listing._id)}
                            className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : activeTab === 'orders' ? (
          <RestaurantOrders />
        ) : (
          <RestaurantReviews />
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;
