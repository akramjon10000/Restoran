import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CartAnimationProvider } from './context/CartAnimationContext';
import { LanguageProvider } from './context/LanguageContext';
import { MenuProvider } from './context/MenuContext';
import { OrderProvider } from './context/OrderContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { LoyaltyProvider } from './context/LoyaltyContext';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import LiveAgent from './components/LiveAgent';
import AddToCartAnimation from './components/AddToCartAnimation';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import FloatingCartBar from './components/FloatingCartBar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import ProductDetail from './pages/ProductDetail';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMenu from './pages/admin/AdminMenu';
import AdminOrders from './pages/admin/AdminOrders';
import AdminKnowledgeBase from './pages/admin/AdminKnowledgeBase';
import AdminFeed from './pages/admin/AdminFeed';
import AdminCategories from './pages/admin/AdminCategories';
import AdminPromoCodes from './pages/admin/AdminPromoCodes';
import AdminReviews from './pages/admin/AdminReviews';
import CourierLayout from './pages/courier/CourierLayout';
import CourierOrders from './pages/courier/CourierOrders';
import CourierActive from './pages/courier/CourierActive';
import CourierHistory from './pages/courier/CourierHistory';

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50 lg:flex text-slate-900">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 relative" role="main">
        <div className="flex-1 pb-20 lg:pb-0 overflow-x-hidden">
             <Outlet />
        </div>
        <BottomNav />
        <FloatingCartBar />
        <LiveAgent />
        <AddToCartAnimation />
        <PWAInstallPrompt />
      </main>
    </div>
  );
};

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg && tg.initData) {
      tg.ready();
      tg.expand();
      
      const handleBack = () => {
        navigate(-1);
      };

      if (location.pathname !== '/' && location.pathname !== '/admin' && location.pathname !== '/admin/dashboard') {
        tg.BackButton.show();
        tg.BackButton.onClick(handleBack);
      } else {
        tg.BackButton.hide();
      }

      return () => {
        tg.BackButton.offClick(handleBack);
      };
    }
  }, [location.pathname, navigate]);

  return (
    <Routes>
      {/* Public App */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="menu" element={<Menu />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      
      {/* Admin Panel */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="menu" element={<AdminMenu />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="promocodes" element={<AdminPromoCodes />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="knowledge-base" element={<AdminKnowledgeBase />} />
        <Route path="feed" element={<AdminFeed />} />
      </Route>
      {/* Courier Panel */}
      <Route path="/courier" element={<CourierLayout />}>
        <Route index element={<CourierOrders />} />
        <Route path="orders" element={<CourierOrders />} />
        <Route path="active" element={<CourierActive />} />
        <Route path="history" element={<CourierHistory />} />
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <LanguageProvider>
      <Toaster position="top-center" richColors />
      <AuthProvider>
        <MenuProvider>
          <OrderProvider>
            <LoyaltyProvider>
              <FavoritesProvider>
                <CartProvider>
                  <CartAnimationProvider>
                    <HashRouter>
                      <AppContent />
                    </HashRouter>
                  </CartAnimationProvider>
                </CartProvider>
              </FavoritesProvider>
            </LoyaltyProvider>
          </OrderProvider>
        </MenuProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;