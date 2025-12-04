import api from './axios';

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/users/register', userData),
  bulkRegister: (studentsData) => api.post('/users/bulk-register', { students: studentsData }),
  login: (credentials) => api.post('/users/login', credentials),
  logout: () => api.post('/users/logout'),
  getCurrentUser: () => api.get('/users/current-user'),
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Class APIs
export const classAPI = {
  createClass: (classData) => api.post('/classes', classData),
  getAllClasses: () => api.get('/classes'),
  getClassById: (id) => api.get(`/classes/${id}`),
  updateClass: (id, classData) => api.put(`/classes/${id}`, classData),
  deleteClass: (id) => api.delete(`/classes/${id}`),
  addStudentToClass: (id, studentId) => api.post(`/classes/${id}/add-student`, { studentId }),
  getClassAssignments: () => api.get('/classes/assignments'),
  assignTeachersToClass: (className, teacherIds) => api.post('/classes/assignments/assign', { className, teacherIds }),
  getAssignmentByClassName: (className) => api.get(`/classes/assignments/${className}`),
  // Simple class name management
  getAllClassNames: () => api.get('/classes/names'),
  createClassName: (className) => api.post('/classes/names', { className }),
  deleteClassName: (className) => api.delete(`/classes/names/${className}`),
};

// Attendance APIs
export const attendanceAPI = {
  createAttendance: (attendanceData) => api.post('/attendance', attendanceData),
  getAllAttendance: (params) => api.get('/attendance', { params }),
  getAttendanceByClass: (classId, params) => api.get(`/attendance/class/${classId}`, { params }),
  getAttendanceByStudent: (studentId) => api.get(`/attendance/student/${studentId}`),
  updateAttendance: (id, attendanceData) => api.put(`/attendance/${id}`, attendanceData),
  deleteAttendance: (id) => api.delete(`/attendance/${id}`),
};

// Examination APIs
export const examinationAPI = {
  createExamination: (examData) => api.post('/examinations', examData),
  getAllExaminations: (params) => api.get('/examinations', { params }),
  getExaminationsByClass: (classId) => api.get(`/examinations/class/${classId}`),
  getExaminationsByStudent: (studentId) => api.get(`/examinations/student/${studentId}`),
  updateExamination: (id, examData) => api.put(`/examinations/${id}`, examData),
  deleteExamination: (id) => api.delete(`/examinations/${id}`),
};

// Fee APIs
export const feeAPI = {
  createFee: (feeData) => api.post('/fees', feeData),
  getAllFees: (params) => api.get('/fees', { params }),
  getFeesByStudent: (studentId) => api.get(`/fees/student/${studentId}`),
  getFeeById: (id) => api.get(`/fees/${id}`),
  updateFee: (id, feeData) => api.put(`/fees/${id}`, feeData),
  deleteFee: (id) => api.delete(`/fees/${id}`),
  recordPayment: (id, paymentData) => api.post(`/fees/${id}/payment`, paymentData),
};

// Health check
export const healthCheck = () => api.get('/health');
