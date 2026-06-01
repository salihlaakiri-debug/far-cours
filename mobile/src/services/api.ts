import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, clearAuth } from './auth';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await clearAuth();
    }
    return Promise.reject(error);
  }
);

export default api;

export const loginApi = (name: string, academicYear: string, matricule: string) =>
  api.post('/auth/login', { name, academicYear, matricule });

export const getSpecialties = () => api.get('/lessons/specialties');

export const getBranches = (specialtyId: string) =>
  api.get('/lessons/branches', { params: { specialtyId } });

export const getLessons = (specialtyId: string, branchId: string) =>
  api.get('/lessons', { params: { specialtyId, branchId } });

export const saveProgress = (
  lessonId: string,
  data: { lastPage: number; totalPages: number; completed?: boolean }
) => api.post('/lessons/progress', { lessonId, ...data });

export const getLessonFileUrl = (lessonId: string) =>
  api.get('/lessons/presign', { params: { id: lessonId } });
