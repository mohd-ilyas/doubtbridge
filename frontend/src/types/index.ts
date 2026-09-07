export type Role = 'STUDENT' | 'FACULTY' | 'ADMIN';
export type DoubtStatus = 'DRAFT' | 'SUBMITTED' | 'QUEUED' | 'ASSIGNED' | 'ACCEPTED' | 'IN_PROGRESS' | 'ANSWERED' | 'RESOLVED' | 'CLOSED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  departmentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: string;
  name: string;
  subjectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FacultyProfile {
  id: string;
  userId: string;
  departmentId: string;
  maxWorkload: number;
  availableFrom: string | null;
  availableUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Doubt {
  id: string;
  title: string;
  description: string;
  studentId: string;
  departmentId: string;
  subjectId: string;
  topicId: string | null;
  status: DoubtStatus;
  createdAt: string;
  updatedAt: string;
  student?: User;
  department?: Department;
  subject?: Subject;
  topic?: Topic;
  responses?: DoubtResponse[];
}

export interface DoubtAssignment {
  id: string;
  doubtId: string;
  facultyId: string;
  assignedAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'TRANSFERRED' | 'COMPLETED';
}

export interface DoubtResponse {
  id: string;
  doubtId: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: Pick<User, 'id' | 'name' | 'role'>;
}

// API standard response structures
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ApiError {
  success: boolean;
  message: string;
  errors?: any[];
}
