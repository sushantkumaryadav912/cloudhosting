import Cookies from 'js-cookie';

export function isAuthenticated() {
  return !!Cookies.get('auth_token');
}

export function logout() {
  Cookies.remove('auth_token');
}