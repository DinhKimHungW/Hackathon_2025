/**
 * Debug Auth Component
 * Shows current authentication state in the browser console
 * Use this in browser DevTools Console to debug auth issues
 */

// Run this in browser console (F12) to check auth state:
console.log('=== AUTH DEBUG INFO ===');
console.log('1. localStorage access_token:', localStorage.getItem('access_token') ? 'EXISTS ✓' : 'MISSING ✗');
console.log('2. localStorage refresh_token:', localStorage.getItem('refresh_token') ? 'EXISTS ✓' : 'MISSING ✗');
console.log('3. localStorage user:', localStorage.getItem('user') ? 'EXISTS ✓' : 'MISSING ✗');

// Parse user info
try {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  console.log('4. User info:', user);
} catch (e) {
  console.log('4. User info: Invalid JSON');
}

// Check if token is expired (JWT decode)
const token = localStorage.getItem('access_token');
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const isExpired = now > exp;
    console.log('5. Token expiry:', new Date(exp).toLocaleString());
    console.log('6. Token expired:', isExpired ? 'YES ✗' : 'NO ✓');
    console.log('7. Time until expiry:', Math.floor((exp - now) / 1000 / 60), 'minutes');
  } catch (e) {
    console.log('5. Token decode failed:', e);
  }
} else {
  console.log('5. No token to decode');
}

console.log('=== END DEBUG INFO ===');
console.log('\nIf token is MISSING or EXPIRED, please login again at: http://localhost:5173/login');
