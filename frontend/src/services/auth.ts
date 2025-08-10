import api from './api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
}

const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Need to use form data format for FastAPI's OAuth2 login
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await api.post<AuthResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    // Save auth token for later requests
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    
    return response.data;
  },
  
  register: async (userData: RegisterData): Promise<User> => {
    const response = await api.post<User>('/auth/register', userData);
    return response.data;
  },
  
  logout: (): void => {
    localStorage.removeItem('token');
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
};

export default authService;