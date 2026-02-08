import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) => 
    api.post('/auth/login', { username, password }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
};

// Student API
export const studentAPI = {
  getAllCourses: () => 
    api.get('/student/courses'),
  
  getCourseDetails: (courseId) => 
    api.get(`/student/courses/${courseId}`),
  
  getMyCourses: () => 
    api.get('/student/my-courses'),
  
  getPrograms: () => 
    api.get('/student/programs'),
  
  enrollCourse: (courseId) => 
    api.post(`/student/enroll/${courseId}`),
  
  unenrollCourse: (courseId) => 
    api.delete(`/student/unenroll/${courseId}`),
};

// Instructor API
export const instructorAPI = {
  getAllCourses: () => 
    api.get('/instructor/courses'),
  
  getMyCourses: () => 
    api.get('/instructor/my-courses'),
  
  getCourseDetails: (courseId) => 
    api.get(`/instructor/course/${courseId}`),
  
  updateCourse: (courseId, data) => 
    api.put(`/instructor/course/${courseId}`, data),
  
  createCourse: (data) => 
    api.post('/instructor/course', data),
  
  addContent: (courseId, data) => 
    api.post(`/instructor/course/${courseId}/content`, data),
  
  getAllInstructors: () => 
    api.get('/instructor/list'),
};

// Data Analyst API
export const analystAPI = {
  getStatistics: () => 
    api.get('/analyst/statistics'),
};

// Admin API
export const adminAPI = {
  getAllUsers: () => 
    api.get('/admin/users'),
  
  deleteUser: (userId) => 
    api.delete(`/admin/users/${userId}`),
  
  changePassword: (userId, password) => 
    api.put(`/admin/users/${userId}/password`, { password }),
  
  getAllCourses: () => 
    api.get('/admin/courses'),
  
  deleteCourse: (courseId) => 
    api.delete(`/admin/courses/${courseId}`),
  
  createCourse: (data) => 
    api.post('/admin/courses', data),
  
  createUser: (data) => 
    api.post('/admin/users', data),
  
  getAllInstructors: () => 
    api.get('/admin/instructors'),
};

export default api;