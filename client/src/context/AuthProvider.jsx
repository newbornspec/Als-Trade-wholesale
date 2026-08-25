import { useState, useCallback, useMemo } from 'react';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('als_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Stable identities. These were rebuilt on every provider render, so any
  // effect listing login in its dependencies would re-run on each render —
  // in VerifyEmailPage that meant repeatedly calling a single-use endpoint.
  // It also stops every useAuth() consumer re-rendering needlessly.
  const login = useCallback((userData, token) => {
    localStorage.setItem('als_token', token);
    localStorage.setItem('als_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('als_token');
    localStorage.removeItem('als_user');
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
