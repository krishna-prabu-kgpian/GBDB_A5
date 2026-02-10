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
  getAllCourses: (search = '') => 
    api.get('/student/courses', { params: search ? { search } : {} }),
  
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
  
  deleteCourse: (courseId) =>
    api.delete(`/instructor/course/${courseId}`),
  
  createCourse: (data) => 
    api.post('/instructor/course', data),
  
  addContent: (courseId, data) => 
    api.post(`/instructor/course/${courseId}/content`, data),
  
  getAllInstructors: () => 
    api.get('/instructor/list'),

  updateScore: (courseId, studentId, score) =>
    api.put(`/instructor/course/${courseId}/score`, { student_id: studentId, score }),

  // Program management
  getPrograms: () =>
    api.get('/instructor/programs'),

  getCoursePrograms: (courseId) =>
    api.get(`/instructor/course/${courseId}/programs`),

  addCourseToProgram: (courseId, programId) =>
    api.post(`/instructor/course/${courseId}/programs`, { program_id: programId }),

  removeCourseFromProgram: (courseId, programId) =>
    api.delete(`/instructor/course/${courseId}/programs/${programId}`),
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
  
  getCourseDetails: (courseId) =>
    api.get(`/admin/courses/${courseId}`),
  
  deleteCourse: (courseId) => 
    api.delete(`/admin/courses/${courseId}`),
  
  createCourse: (data) => 
    api.post('/admin/courses', data),
  
  createUser: (data) => 
    api.post('/admin/users', data),
  
  getAllInstructors: () => 
    api.get('/admin/instructors'),

  getAllStudents: () =>
    api.get('/admin/students'),

  assignInstructor: (courseId, instructorId) =>
    api.post(`/admin/courses/${courseId}/instructors`, { instructor_id: instructorId }),

  removeInstructor: (courseId, instructorId) =>
    api.delete(`/admin/courses/${courseId}/instructors/${instructorId}`),

  enrollStudent: (courseId, studentId) =>
    api.post(`/admin/courses/${courseId}/students`, { student_id: studentId }),

  unenrollStudent: (courseId, studentId) =>
    api.delete(`/admin/courses/${courseId}/students/${studentId}`),

  // University management
  getAllUniversities: () =>
    api.get('/admin/universities'),

  createUniversity: (data) =>
    api.post('/admin/universities', data),

  deleteUniversity: (universityId) =>
    api.delete(`/admin/universities/${universityId}`),

  assignCourseToUniversity: (universityId, courseId) =>
    api.post(`/admin/universities/${universityId}/courses`, { course_id: courseId }),

  removeCourseFromUniversity: (universityId, courseId) =>
    api.delete(`/admin/universities/${universityId}/courses/${courseId}`),

  // Program management
  getAllPrograms: () =>
    api.get('/admin/programs'),

  createProgram: (data) =>
    api.post('/admin/programs', data),

  deleteProgram: (programId) =>
    api.delete(`/admin/programs/${programId}`),

  addCourseToProgram: (programId, courseId) =>
    api.post(`/admin/programs/${programId}/courses`, { course_id: courseId }),

  removeCourseFromProgram: (programId, courseId) =>
    api.delete(`/admin/programs/${programId}/courses/${courseId}`),
};

export default api;