import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps any admin page — redirects to sign-in if not logged in,
// redirects to home if logged in but not an admin.
export default function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
