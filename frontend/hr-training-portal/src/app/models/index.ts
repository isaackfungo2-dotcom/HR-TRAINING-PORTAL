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

export interface TrainingAssessmentDto {
  id: number;
  requestId: number;
  requestTitle: string;
  employeeId: number;
  employeeName: string;
  level: number;
  status: string; // DRAFT | SUBMITTED | SUPERVISOR_SUBMITTED | REVIEWED
  employeeData?: string; // raw JSON
  supervisorData?: string; // raw JSON
  supervisorName?: string;
  supervisorSubmittedAt?: string;
  hrComments?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  submittedAt?: string;
  createdAt?: string;
}

// Level 1 form data
export interface AssessmentLevel1Data {
  trainingTitle: string;
  dateOfTraining: string;
  trainer: string;
  rating_objectivesClear: number;
  rating_contentRelevant: number;
  rating_trainerKnowledgeable: number;
  rating_materialsUseful: number;
  rating_willApply: number;
  rating_environment: number;
  likedMost: string;
  improvements: string;
  additionalComments: string;
  wouldRecommend: boolean | null;
  recommendComments: string;
}

// Level 2 form data
export interface AssessmentLevel2Data {
  confidence: number;
  understandingBefore: number;
  understandingAfter: number;
  topThingsLearned: string;
  skill1Topic: string; skill1Rating: number;
  skill2Topic: string; skill2Rating: number;
  skill3Topic: string; skill3Rating: number;
  practicalExercisesHelpful: boolean | null;
  practicalExercisesDetails: string;
  attitudeChanged: boolean | null;
  attitudeChangeDescription: string;
  confidenceChange: number;
}

// Level 3 Part A (employee)
export interface AssessmentLevel3EmployeeData {
  applicationFrequency: number;
  specificConceptsApplied: string;
  applicationConfidence: number;
  behaviorChange: number;
  performanceImproved: boolean | null;
  performanceExplanation: string;
  colleagueFeedback: boolean | null;
  colleagueFeedbackDetails: string;
  barriers: string[];
  barriersOther: string;
  supervisorSupport: number;
  helpToApply: string;
  additionalComments: string;
  trainingRelevance: string;
  practicalActivitiesHelp: string;
  managerOpportunity: string;
  workloadAllowed: string;
  followUpTypes: string;
}

// Level 3 Part B (supervisor)
export interface AssessmentLevel3SupervisorData {
  [key: string]: any;
  supervisorName: string;
  behavior1: number; behavior2: number; behavior3: number;
  behavior4: number; behavior5: number; behavior6: number;
  results1: number; results2: number; results3: number;
  support1: number; support2: number; support3: number;
  positiveChanges: string;
  noChangeAreas: string;
  additionalSupport: string;
  recommendTraining: string;
}
