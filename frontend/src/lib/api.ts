/**
 * API Service
 * 
 * Centralizes all API calls to the Express backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper function to handle API responses
async function handleResponse(response: Response) {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }
  
  return data;
}

// Add auth token to requests
function getAuthHeaders(token?: string) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// Auth API functions
export const AuthAPI = {
  signup: async (userData: any) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  },
  
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    return handleResponse(response);
  },
  
  logout: async (token: string) => {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    });
    
    return handleResponse(response);
  },
  
  requestPasswordReset: async (email: string, redirectUrl: string) => {
    const response = await fetch(`${API_URL}/auth/request-password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, redirectUrl }),
    });
    
    return handleResponse(response);
  },
  
  verifyResetToken: async (token: string) => {
    const response = await fetch(`${API_URL}/auth/verify-reset-token`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    
    return handleResponse(response);
  },
  
  updatePassword: async (password: string, confirmPassword: string, token: string) => {
    const response = await fetch(`${API_URL}/auth/update-password`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ password, confirmPassword }),
    });
    
    return handleResponse(response);
  },
  
  processAuthCode: async (code: string) => {
    const response = await fetch(`${API_URL}/auth/process-auth-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    
    return handleResponse(response);
  },
  
  updateUserProfile: async (userData: any, token: string) => {
    const response = await fetch(`${API_URL}/auth/update-profile`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  },
};

// User Management API functions
export const UserManagementAPI = {
  inviteUser: async (email: string, role: string, token: string) => {
    const response = await fetch(`${API_URL}/user-management/invite`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ email, role }),
    });
    
    return handleResponse(response);
  },
  
  getAllUsers: async (token: string) => {
    const response = await fetch(`${API_URL}/user-management/users`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    
    return handleResponse(response);
  },
  
  getUserProfile: async (userId: string | null, token: string) => {
    const url = userId 
      ? `${API_URL}/user-management/profile/${userId}` 
      : `${API_URL}/user-management/profile`;
      
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    
    return handleResponse(response);
  },
  
  updateProfile: async (userId: string | null, profileData: any, token: string) => {
    const url = userId 
      ? `${API_URL}/user-management/profile/${userId}` 
      : `${API_URL}/user-management/profile`;
      
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(profileData),
    });
    
    return handleResponse(response);
  },
};
