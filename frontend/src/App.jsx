import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import VendorStore from './pages/VendorStore';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import NotFound from './pages/NotFound';

// Protected Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import OrderDetail from './pages/OrderDetail';

// Vendor Pages
import VendorDashboard from './pages/vendor/VendorDashboard';
import ManageProducts from './pages/vendor/ManageProducts';
import VendorOrders from './pages/vendor/VendorOrders';
import VendorProfile from './pages/vendor/VendorProfile';
import VendorAnalytics from './pages/vendor/VendorAnalytics';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageVendors from './pages/admin/ManageVendors';
import ManageAllOrders from './pages/admin/ManageAllOrders';
import ManageReviews from './pages/admin/ManageReviews';

// Route Guards
import ProtectedRoute from './components/common/ProtectedRoute';
import VendorRoute from './components/common/VendorRoute';
import AdminRoute from './components/common/AdminRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/vendor/:id" element={<VendorStore />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Customer Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <MyOrders />
                  </ProtectedRoute>
                } />
                <Route path="/orders/:id" element={
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />

                {/* Vendor Routes */}
                <Route path="/vendor/dashboard" element={
                  <VendorRoute>
                    <VendorDashboard />
                  </VendorRoute>
                } />
                <Route path="/vendor/products" element={
                  <VendorRoute>
                    <ManageProducts />
                  </VendorRoute>
                } />
                <Route path="/vendor/orders" element={
                  <VendorRoute>
                    <VendorOrders />
                  </VendorRoute>
                } />
                <Route path="/vendor/profile" element={
                  <VendorRoute>
                    <VendorProfile />
                  </VendorRoute>
                } />
                <Route path="/vendor/analytics" element={
                  <VendorRoute>
                    <VendorAnalytics />
                  </VendorRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="/admin/vendors" element={
                  <AdminRoute>
                    <ManageVendors />
                  </AdminRoute>
                } />
                <Route path="/admin/orders" element={
                  <AdminRoute>
                    <ManageAllOrders />
                  </AdminRoute>
                } />
                <Route path="/admin/reviews" element={
                  <AdminRoute>
                    <ManageReviews />
                  </AdminRoute>
                } />

                {/* 404 Not Found Route */}
                <Route path="*" element={<NotFound />} />
import NotFound from './pages/NotFound';
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;