import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { User } from '../types/User';
import { api } from './api';

// Token key for localStorage
const TOKEN_KEY = 'auth_token';

// Function to authenticate user and store JWT token
export const login = async (username: string, password: string): Promise<User> => {
  try {
    // Make POST request to '/auth/login' endpoint with username and password
    const response = await api.post('/auth/login', { username, password });
    
    // Extract JWT token from response
    const token = response.data.token;
    
    // Store token in localStorage
    localStorage.setItem(TOKEN_KEY, token);
    
    // Decode token to get user information
    const user = jwtDecode(token) as User;
    
    // Set auth header for future requests
    setAuthHeader();
    
    // Return user object
    return user;
  } catch (error) {
    throw new Error('Authentication failed');
  }
};

// Function to log out user and remove stored JWT token
export const logout = (): void => {
  // Remove token from localStorage
  localStorage.removeItem(TOKEN_KEY);
  
  // Remove auth header
  setAuthHeader();
};

// Function to retrieve stored JWT token
export const getToken = (): string | null => {
  // Retrieve token from localStorage
  return localStorage.getItem(TOKEN_KEY);
};

// Function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  // Get token using getToken function
  const token = getToken();
  
  if (token) {
    try {
      // If token exists, decode and check expiration
      const decodedToken: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      // Return true if token is valid and not expired, false otherwise
      return decodedToken.exp > currentTime;
    } catch {
      return false;
    }
  }
  
  return false;
};

// Function to get current authenticated user
export const getCurrentUser = (): User | null => {
  // Get token using getToken function
  const token = getToken();
  
  if (token) {
    try {
      // If token exists, decode to get user information
      const user = jwtDecode(token) as User;
      
      // Return user object if token is valid
      return user;
    } catch {
      return null;
    }
  }
  
  return null;
};

// Function to set authentication header for API requests
export const setAuthHeader = (): void => {
  // Get token using getToken function
  const token = getToken();
  
  if (token) {
    // If token exists, set Authorization header on api.axiosInstance
    api.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // If no token, remove Authorization header from api.axiosInstance
    delete api.axiosInstance.defaults.headers.common['Authorization'];
  }
};