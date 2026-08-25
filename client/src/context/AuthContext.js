import { createContext, useContext } from 'react';

// The context and its hook live here, apart from the provider component, so
// the provider's file exports only a component. Mixing the two breaks React
// Fast Refresh, which then does a full reload on every edit to this file.
//
// Kept at this path (as .js) so the 15 existing
// `import { useAuth } from '../context/AuthContext'` specifiers still resolve.
export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);
