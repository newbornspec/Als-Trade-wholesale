import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://als-trade-wholesale-production.up.railway.app/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('als_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// A rejected token used to leave the app in a broken half-logged-in state:
// als_user stayed in localStorage so the UI still rendered as signed in while
// every request failed. Clear the session and send the user to sign in.
//
// Only for 401 (the token is bad, expired, or has been revoked). A 403 means
// the token is valid but the account is not approved for that action, which
// is a message to show rather than a reason to log anyone out.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const wasLoggedIn = localStorage.getItem('als_token');
      localStorage.removeItem('als_token');
      localStorage.removeItem('als_user');

      // Only redirect someone who thought they were logged in, and never from
      // the auth pages themselves — a failed login is a 401 too, and bouncing
      // there would wipe the error the form is trying to show.
      const onAuthPage = /^\/(sign-in|sign-up|verify-email)/.test(window.location.pathname);
      if (wasLoggedIn && !onAuthPage) {
        window.location.assign('/sign-in');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
