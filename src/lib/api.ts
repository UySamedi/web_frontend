import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401) {
      // Unauthorized — clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (status === 400 && data?.message) {
      // Bad request — show server message (e.g. max enrollment)
      alert(data.message || "Bad request error.");
    } else if (status === 500) {
      // Internal server error
      console.error('Server error (500):', data);
      alert('Internal Server Error occurred. Please try again later.');
    } else {
      // Other errors — log and show generic alert
      console.error('API Error:', status, data);
      alert(`An error occurred (status ${status}). Please try again.`);
    }

    return Promise.reject(error);
  }
);

// ... your types and APIs unchanged ...

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'student';
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  schedule: string;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  course?: Course;
  user?: User;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface CourseData {
  title: string;
  description: string;
  schedule: string;
}

export const authAPI = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/login', data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/register', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const coursesAPI = {
  getAll: async (): Promise<Course[]> => {
    const response = await api.get('/courses');
    return response.data;
  },

  create: async (data: CourseData): Promise<Course> => {
    const response = await api.post('/courses', data);
    return response.data;
  },

  update: async (id: number, data: CourseData): Promise<Course> => {
    const response = await api.put(`/courses/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/courses/${id}`);
  },
};

export const enrollmentsAPI = {
  getAll: async (): Promise<Enrollment[]> => {
    const response = await api.get('/enrollments');
    return response.data;
  },

  enroll: async (courseId: number): Promise<Enrollment> => {
    const response = await api.post('/enrollments', { course_id: courseId });
    return response.data;
  },

  approve: async (enrollmentId: number): Promise<Enrollment> => {
    const response = await api.post(`/enrollments/${enrollmentId}/approve`);
    return response.data;
  },

  reject: async (enrollmentId: number): Promise<Enrollment> => {
    const response = await api.post(`/enrollments/${enrollmentId}/reject`);
    return response.data;
  },

  myEnrollments: async (): Promise<Enrollment[]> => {
    const response = await api.get('/my-enrollments');
    return response.data;
  },
};

export default api;
