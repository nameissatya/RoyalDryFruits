import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import MobileNav from './components/layout/MobileNav'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import GiftingPage from './pages/GiftingPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CollectionPage from './pages/CollectionPage'
import MyOrdersPage from './pages/MyOrdersPage'
import StoreLocationPage from './pages/StoreLocationPage'
import ContactUsPage from './pages/ContactUsPage'
import DeliveryPolicyPage from './pages/DeliveryPolicyPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import { AuthProvider } from './context/AuthContext'
import AuthModal from './components/auth/AuthModal'
import FloatingWhatsApp from './components/common/FloatingWhatsApp'
import ScrollToTop from './components/common/ScrollToTop'

function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 w-full pb-32 md:pb-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<HomePage />} />
            <Route path="/collections" element={<CollectionPage />} />
            <Route path="/product" element={<ProductDetailPage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/gifting" element={<GiftingPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/my-orders" element={<MyOrdersPage />} />
            <Route path="/my orders" element={<MyOrdersPage />} />
            <Route path="/myorders" element={<MyOrdersPage />} />
            <Route path="/orders" element={<MyOrdersPage />} />
            <Route path="/account" element={<MyOrdersPage />} />
            <Route path="/store-location" element={<StoreLocationPage />} />
            <Route path="/store" element={<StoreLocationPage />} />
            <Route path="/contact" element={<ContactUsPage />} />
            <Route path="/contact-us" element={<ContactUsPage />} />
            <Route path="/delivery-policy" element={<DeliveryPolicyPage />} />
            <Route path="/delivery" element={<DeliveryPolicyPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        <Footer />
        <MobileNav />
        <FloatingWhatsApp />
        <AuthModal />
      </div>
    </AuthProvider>
  )
}

export default App
