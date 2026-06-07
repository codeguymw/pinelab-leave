export type Role = 'EMPLOYEE' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  department: string;
}

export type LeaveType = 'Sick' | 'Casual' | 'Annual';
export type LeaveStatus = 'Pending' | 'Pending HR' | 'Approved' | 'Rejected';

export interface LeaveBalances {
  Sick: number;
  Casual: number;
  Annual: number;
}

export interface LeaveRequest {
  id: number;
  userId: number;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
}