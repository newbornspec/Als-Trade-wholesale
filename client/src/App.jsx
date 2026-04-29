import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar    from './components/Navbar';
import Footer    from './components/Footer';
import HomePage        from './pages/HomePage';
import StockPage       from './pages/StockPage';
import BatchDetailPage from './pages/BatchDetailPage';
import ContactPage     from './pages/ContactPage';
import SoldStockPage   from './pages/SoldStockPage';
import HowItWorksPage  from './pages/HowItWorksPage';
import AboutPage       from './pages/AboutPage';
import SignInPage      from './pages/SignInPage';
import SignUpPage      from './pages/SignUpPage';
import AdminRoute        from './admin/AdminRoute';
import AdminLayout       from './admin/AdminLayout';
import AdminDashboard    from './admin/AdminDashboard';
import AdminHomePage     from './admin/AdminHomePage';
import AddBatchPage      from './admin/AddBatchPage';
import ManageBatchesPage from './admin/ManageBatchesPage';
import EnquiriesPage     from './admin/EnquiriesPage';

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/"                      element={<HomePage />} />
        <Route path="/available-stock"       element={<StockPage />} />
        <Route path="/available-stock/:slug" element={<BatchDetailPage />} />
        <Route path="/sold-stock"            element={<SoldStockPage />} />
        <Route path="/sign-in"               element={<SignInPage />} />
        <Route path="/sign-up"               element={<SignUpPage />} />
        <Route path="/how-it-works"          element={<HowItWorksPage />} />
        <Route path="/about-us"              element={<AboutPage />} />
        <Route path="/contact"               element={<ContactPage />} />

        {/* ── Admin panel ── */}
        <Route path="/admin" element={
          <AdminRoute><AdminLayout><AdminHomePage /></AdminLayout></AdminRoute>
        } />
        <Route path="/admin/dashboard" element={
          <AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>
        } />
        <Route path="/admin/add-batch" element={
          <AdminRoute><AdminLayout><AddBatchPage /></AdminLayout></AdminRoute>
        } />
        <Route path="/admin/batches" element={
          <AdminRoute><AdminLayout><ManageBatchesPage /></AdminLayout></AdminRoute>
        } />
        <Route path="/admin/enquiries" element={
          <AdminRoute><AdminLayout><EnquiriesPage /></AdminLayout></AdminRoute>
        } />
      </Routes>
      <Footer />
    </AuthProvider>
  );
}
