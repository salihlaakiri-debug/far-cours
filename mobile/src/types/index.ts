export interface User {
  id: string;
  militaryId: string;
  fullName: string;
  role: 'USER' | 'ADMIN';
}

export interface Specialty {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Branch {
  id: string;
  name: string;
  description?: string;
  slug: string;
  specialtyId: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  branchId: string;
  order: number;
  userProgress?: {
    completed: boolean;
    lastPage: number;
    totalPages: number;
  } | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  code?: string;
}
