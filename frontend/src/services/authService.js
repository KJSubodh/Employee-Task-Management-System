import api from './api';

class AuthService {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }

  async login(email, password, rememberMe = false) {
    const response = await api.post('/auth/login', { email, password, rememberMe });
    return response.data;
  }

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  }

  async changePassword(oldPassword, newPassword) {
    const response = await api.put('/auth/change-password', { oldPassword, newPassword });
    return response.data;
  }

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { message: 'Logged out successfully' };
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }
}

export default new AuthService();