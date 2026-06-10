export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  departmentId?: number;
  supervisorId?: number;
  phone?: string;
  active?: boolean;
}

export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  id: number;
}

export interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  departmentName?: string;
  departmentId?: number;
  supervisorName?: string;
  supervisorId?: number;
  active: boolean;
}

export interface TrainingRequestDto {
  id: number;
  employeeId: number;
  employeeName?: string;
  departmentName?: string;
  supervisorName?: string;
  title: string;
  description?: string;
  objectives?: string;
  trainingType: string;
  proposedStartDate: string;
  proposedEndDate: string;
  provider?: string;
  institution?: string;
  estimatedCost?: number;
  currency?: string;
  justification?: string;
  expectedBenefits?: string;
  status: string;
  supervisorId?: number;
  hrApproverId?: number;
  hrApproverName?: string;
  createdAt?: string;
  updatedAt?: string;
  documents?: TrainingDocumentDto[];
  rejectionReason?: string;
  rescheduleComment?: string;
  rescheduledStartDate?: string;
  rescheduledEndDate?: string;
}

export interface TrainingDocumentDto {
  id: number;
  fileName: string;
  fileType?: string;
  fileSize: number;
  downloadUrl?: string;
  uploadedAt?: string;
}

export interface ApprovalAction {
  action: string;
  reason?: string;
  comments?: string;
  newStartDate?: string;
  newEndDate?: string;
  newProvider?: string;
}

export interface NotificationDto {
  id: number;
  title: string;
  message?: string;
  read: boolean;
  link?: string;
  createdAt?: string;
}

export interface AuditLogDto {
  id: number;
  requestId?: number;
  userId?: number;
  userName?: string;
  action: string;
  details?: string;
  oldStatus?: string;
  newStatus?: string;
  timestamp?: string;
}

export interface DashboardMetricsDto {
  totalRequestsThisMonth: number;
  totalRequestsThisYear: number;
  pendingSupervisor: number;
  pendingHr: number;
  approvedInCountry: number;
  approvedOutOfCountry: number;
  rejected: number;
  upcoming30Days: number;
  upcoming60Days: number;
  totalEstimatedCostThisMonth: number;
  currency?: string;
}

export interface DepartmentDto {
  id: number;
  name: string;
  description?: string;
}
