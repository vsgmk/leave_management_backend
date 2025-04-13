import axios from "axios";

const BASE_URL = "https://leave-management-backend-8.onrender.com"; // Change if needed

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 🔹 Student Registration
export const registerStudent = async (formData) => {
  return axios.post(`${BASE_URL}/api/register/student/`, formData);
};

// 🔹 Teacher Registration
export const registerTeacher = async (formData) => {
  return axios.post(`${BASE_URL}/api/register/teacher/`, formData);
};

// 🔹 Verify OTP (Common for both students & teachers)
export const verifyOTP = async (otpData) => {
  return axios.post(`${BASE_URL}/api/verify-otp/`, otpData);
};

// 🔹 Student Login
export const loginStudent = async (credentials) => {
  return axios.post("http://127.0.0.1:8000/api/login/student/", credentials);
};

// 🔹 Teacher Login
export const loginTeacher = async (credentials) => {
  return axios.post(`${BASE_URL}/api/login/teacher/`, credentials);
};

export const applyLeave = async (leaveData) => {
  return axios.post(`${BASE_URL}/api/apply_leave/`, leaveData, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
};

export const getStudents = async () => {
  const response = await axios.get(`${BASE_URL}/api/students/`);
  return response.data;
};

export const markAttendance = async (data) => {
  await axios.post(`${BASE_URL}/api/mark-attendance/`, data);
};

export const getAttendance = async (date, slot) => {
  const response = await axios.get(`${BASE_URL}/api/attendance/view/`, { params: { date, slot } });
  return response.data;
};

export const editAttendance = async (date, slot, attendance) => {
  await axios.put(`${BASE_URL}/api/attendance/edit/`, { date, slot, attendance });
};

export const getStudentAttendance = async (studentId) => {
  const response = await axios.get(`${BASE_URL}/api/attendance/view/${studentId}/`);
  return response.data;
};

export const getAttendancePercentage = async (studentId) => {
  const response = await axios.get(`${BASE_URL}/api/attendance/percentage/${studentId}/`);
  return response.data;
};