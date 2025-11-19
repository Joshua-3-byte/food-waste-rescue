// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import BrowseListings from './pages/customer/BrowseListings';
import ListingDetail from './pages/customer/ListingDetail';
import OrderReview from './pages/customer/OrderReview';
import ProtectedRoute from './components/layout/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Browse is accessible to all authenticated users */}
          <Route
            path="/browse"
            element={
              <ProtectedRoute>
                <BrowseListings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/listings/:id"
            element={
              <ProtectedRoute>
                <ListingDetail />
              </ProtectedRoute>
            }
          />

          {/* Dashboard (role-based) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* My Orders (customer only) */}
          <Route
            path="/my-orders"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Order Review (customer only) */}
          <Route
            path="/orders/:id/review"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <OrderReview />
              </ProtectedRoute>
            }
          />

          {/* Redirect root to browse */}
          <Route path="/" element={<Navigate to="/browse" replace />} />

          {/* 404 Page */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl">404 - Page Not Found</h1>
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
