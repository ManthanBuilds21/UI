import { AnimatePresence } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import SiteLayout from './components/layout/SiteLayout'
import ProtectedRoute from './components/routing/ProtectedRoute'
import AdminPreviewPage from './pages/Admin/AdminPreviewPage'
import AboutPage from './pages/About/AboutPage'
import CartPage from './pages/Cart/CartPage'
import CollectionsPage from './pages/Collections/CollectionsPage'
import FrontPage from './pages/FrontPage/FrontPage'
import HomePage from './pages/Home/HomePage'
import ProductPage from './pages/Product/ProductPage'

export default function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<FrontPage />} />
        <Route element={<SiteLayout />}>
          <Route path="/website" element={<HomePage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin" element={<AdminPreviewPage />} />
          </Route>
        </Route>
      </Routes>
    </AnimatePresence>
  )
}
