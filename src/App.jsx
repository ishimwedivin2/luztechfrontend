import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProductListPage from './pages/store/ProductListPage';
import ProductDetailPage from './pages/store/ProductDetailPage';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import ProfilePage from './pages/profile/ProfilePage';
import OrdersPage from './pages/orders/OrdersPage';
import AcademyPage from './pages/academy/AcademyPage';
import CareersPage from './pages/careers/CareersPage';
import SupportPage from './pages/support/SupportPage';
import WishlistPage from './pages/wishlist/WishlistPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import './styles/global.css';

const AUTH_ROUTES = ['/login', '/register'];

function AppLayout() {
  const { pathname } = useLocation();
  const isAuthPage = AUTH_ROUTES.includes(pathname);

  return (
    <div className="app">
      {!isAuthPage && <Navbar />}
      <main className={`main-content${isAuthPage ? ' main-content--auth' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/store" element={<ProductListPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/academy" element={<AcademyPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/support/*" element={<SupportPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppLayout />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
