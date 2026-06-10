# HR Training Request Portal - API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Authorization & Roles](#authorization--roles)
5. [Common Headers](#common-headers)
6. [Error Responses](#error-responses)
7. [Endpoints](#endpoints)
   - [Auth](#auth)
   - [Training Requests](#training-requests)
   - [Notifications](#notifications)
   - [Dashboard](#dashboard)
   - [Admin / Users](#admin--users)
8. [Data Models](#data-models)
9. [Enums](#enums)

---

## Overview

This document describes the REST API for the **HR Training Request Portal**. The backend is a Spring Boot 3 application (Java 17) secured with JWT-based authentication. It supports employee training request submissions, multi-level approvals (Supervisor → HR), file uploads, notifications, audit logging, and dashboard analytics.

---

## Base URL

```
http://localhost:8083/api
```

All endpoints below are relative to this base URL.

---

## Authentication

The API uses **Bearer Token (JWT)** authentication.

1. Obtain a token via `POST /auth/login` or `POST /auth/register`.
2. Include the token in the `Authorization` header for all protected endpoints:

```http
Authorization: Bearer <jwt_token>
```

Token expiration is configured to **24 hours** (`86400000 ms`).

---

## Authorization & Roles

| Role        | Description                                      |
|-------------|--------------------------------------------------|
| `EMPLOYEE`  | Can submit training requests and view own history |
| `SUPERVISOR`| Can approve/reject requests assigned to them      |
| `HR`        | Can approve/reject/reschedule supervisor-approved requests; view dashboard |
| `ADMIN`     | Full user management access (`/admin/**`)         |

### Access Rules
- `/auth/**` → Public
- `/public/**` → Public
- `/uploads/**` → Public
- `/admin/**` → `ADMIN` only
- `GET /dashboard/**` → `HR` or `ADMIN`
- All other endpoints → Authenticated

---

## Common Headers

| Header            | Value                              | Required |
|-------------------|------------------------------------|----------|
| `Content-Type`    | `application/json`                 | Yes*     |
| `Authorization`   | `Bearer <token>`                   | Yes**    |

\* For `POST /requests` (create), use `multipart/form-data` instead.  
\*\* Not required for `/auth/**`, `/public/**`, `/uploads/**`.

---

## Error Responses

The API returns standard HTTP status codes:

| Status | Meaning                                      |
|--------|----------------------------------------------|
| `400`  | Bad Request — validation or business error   |
| `401`  | Unauthorized — missing or invalid JWT        |
| `403`  | Forbidden — insufficient role/permissions    |
| `404`  | Not Found — resource does not exist          |
| `500`  | Internal Server Error                        |

### Example Error Body

```json
{
  "timestamp": "2025-01-01T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Rejection reason is mandatory"
}
```

---

## Endpoints

### Auth

#### `POST /auth/login`
Authenticate a user and receive a JWT token.

**Request Body (`LoginRequest`)**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (`AuthResponse`)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "EMPLOYEE",
  "id": 1
}
```

**Example cURL**
```bash
curl -X POST http://localhost:8083/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

---

#### `POST /auth/register`
Register a new user.

**Request Body (`RegisterRequest`)**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "securePassword",
  "role": "EMPLOYEE",
  "departmentId": 1,
  "supervisorId": 2,
  "phone": "+255712345678",
  "active": true
}
```

**Response (`AuthResponse`)**
Same shape as login response.

**Example cURL**
```bash
curl -X POST http://localhost:8083/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "securePassword",
    "role": "EMPLOYEE",
    "departmentId": 1,
    "supervisorId": 2,
    "phone": "+255712345678",
    "active": true
  }'
```

---

#### `GET /auth/me`
Retrieve the currently authenticated user's profile.

**Headers**
```http
Authorization: Bearer <token>
```

**Response (`UserDto`)**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "EMPLOYEE",
  "phone": "+255712345678",
  "departmentName": "IT",
  "departmentId": 1,
  "supervisorName": "Jane Smith",
  "supervisorId": 2,
  "active": true
}
```

**Example cURL**
```bash
curl -X GET http://localhost:8083/api/auth/me \
  -H "Authorization: Bearer <jwt_token>"
```

---

### Training Requests

#### `POST /requests`
Create a new training request with optional file attachments.

**Content-Type:** `multipart/form-data`

**Headers**
```http
Authorization: Bearer <token>
```

**Form Data**
| Field   | Type   | Required | Description                        |
|---------|--------|----------|------------------------------------|
| `data`  | JSON   | Yes      | `CreateTrainingRequest` object     |
| `files` | File[] | No       | Supporting documents (max 5MB each)|

**`data` JSON Example**
```json
{
  "title": "Advanced Java Training",
  "description": "Spring Boot advanced concepts",
  "objectives": "Microservices, security, cloud deployment",
  "trainingType": "IN_COUNTRY",
  "proposedStartDate": "2025-03-01",
  "proposedEndDate": "2025-03-05",
  "provider": "Tech Academy",
  "institution": "Dar es Salaam Institute",
  "estimatedCost": 1500.00,
  "currency": "USD",
  "justification": "Upskilling for new project requirements",
  "expectedBenefits": "Improved system architecture skills"
}
```

**Response (`TrainingRequestDto`)**
Returns the created request with generated `id`, timestamps, and `PENDING_SUPERVISOR` status.

**Example cURL**
```bash
curl -X POST http://localhost:8083/api/requests \
  -H "Authorization: Bearer <jwt_token>" \
  -F 'data={
    "title": "Advanced Java Training",
    "description": "Spring Boot advanced concepts",
    "objectives": "Microservices, security, cloud deployment",
    "trainingType": "IN_COUNTRY",
    "proposedStartDate": "2025-03-01",
    "proposedEndDate": "2025-03-05",
    "provider": "Tech Academy",
    "institution": "Dar es Salaam Institute",
    "estimatedCost": 1500.00,
    "currency": "USD",
    "justification": "Upskilling for new project requirements",
    "expectedBenefits": "Improved system architecture skills"
  };type=application/json' \
  -F 'files=@/path/to/document.pdf'
```

---

#### `GET /requests/my`
Retrieve all training requests submitted by the authenticated employee.

**Headers**
```http
Authorization: Bearer <token>
```

**Response**
Array of `TrainingRequestDto`.

**Example cURL**
```bash
curl -X GET http://localhost:8083/api/requests/my \
  -H "Authorization: Bearer <jwt_token>"
```

---

#### `GET /requests/supervisor/pending`
Retrieve pending training requests awaiting the authenticated supervisor's approval.

**Headers**
```http
Authorization: Bearer <token>
```

**Response**
Array of `TrainingRequestDto` with `status = PENDING_SUPERVISOR`.

**Example cURL**
```bash
curl -X GET http://localhost:8083/api/requests/supervisor/pending \
  -H "Authorization: Bearer <jwt_token>"
```

---

#### `GET /requests`
Retrieve all training requests (HR/Admin view) with optional filters.

**Query Parameters**
| Parameter      | Type   | Required | Description                          |
|----------------|--------|----------|--------------------------------------|
| `status`       | string | No       | Filter by `RequestStatus` enum value |
| `departmentId` | long   | No       | Filter by employee department ID     |
| `keyword`      | string | No       | Search in title, employee first/last name |

**Response**
Array of `TrainingRequestDto`.

**Example cURL**
```bash
# All requests
curl -X GET http://localhost:8083/api/requests \
  -H "Authorization: Bearer <jwt_token>"

# Filtered by status and department
curl -X GET "http://localhost:8083/api/requests?status=PENDING_HR&departmentId=1&keyword=java" \
  -H "Authorization: Bearer <jwt_token>"
```

---

#### `GET /requests/{id}`
Retrieve a single training request by ID.

**Path Parameters**
| Parameter | Type | Description          |
|-----------|------|----------------------|
| `id`      | long | Training request ID  |

**Response (`TrainingRequestDto`)**

**Example cURL**
```bash
curl -X GET http://localhost:8083/api/requests/42 \
  -H "Authorization: Bearer <jwt_token>"
```

---

#### `POST /requests/{id}/supervisor-action`
Perform an approval action as the assigned supervisor.

**Allowed Actions:** `APPROVE`, `REJECT`

**Headers**
```http
Authorization: Bearer <token>
```

**Request Body (`ApprovalAction`)**
```json
{
  "action": "APPROVE",
  "reason": "",
  "comments": "Looks good, approved."
}
```

For `REJECT`, `reason` is **mandatory**:
```json
{
  "action": "REJECT",
  "reason": "Budget constraints",
  "comments": "Please reapply next quarter."
}
```

**Response (`TrainingRequestDto`)**

**Example cURL**
```bash
curl -X POST http://localhost:8083/api/requests/42/supervisor-action \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "APPROVE",
    "comments": "Looks good, approved."
  }'
```

---

#### `POST /requests/{id}/hr-action`
Perform an approval action as an HR officer.

**Allowed Actions:** `APPROVE`, `REJECT`, `RESCHEDULE`

**Headers**
```http
Authorization: Bearer <token>
```

**Request Body (`ApprovalAction`)**

- **Approve**
```json
{
  "action": "APPROVE",
  "comments": "Approved by HR."
}
```

- **Reject**
```json
{
  "action": "REJECT",
  "reason": "Does not align with training plan",
  "comments": "Consider alternative courses."
}
```

- **Reschedule**
```json
{
  "action": "RESCHEDULE",
  "newStartDate": "2025-04-01",
  "newEndDate": "2025-04-05",
  "comments": "Rescheduled to next quarter."
}
```

**Response (`TrainingRequestDto`)**

**Example cURL**
```bash
curl -X POST http://localhost:8083/api/requests/42/hr-action \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "APPROVE",
    "comments": "Approved by HR."
  }'
```

---

#### `GET /requests/{id}/documents`
Retrieve uploaded documents for a training request.

**Response**
Array of `TrainingDocumentDto`.

**Example cURL**
```bash
curl -X GET http://localhost:8083/api/requests/42/documents \
  -H "Authorization: Bearer <jwt_token>"
```

---

#### `GET /requests/{id}/audit-logs`
Retrieve the audit trail for a training request.

**Response**
Array of `AuditLogDto`.

**Example cURL**
```bash
curl -X GET http://localhost:8083/api/requests/42/audit-logs \
  -H "Authorization: Bearer <jwt_token>"
```

---

### Notifications

#### `GET /notifications/my?userId={userId}`
Retrieve all notifications for a user.

**Response**
Array of `NotificationDto`.

**Example cURL**
```bash
curl -X GET "http://localhost:8083/api/notifications/my?userId=1" \
  -H "Authorization: Bearer <jwt_token>"
```

---

#### `GET /notifications/unread?userId={userId}`
Retrieve unread notifications for a user.

**Response**
Array of `NotificationDto`.

**Example cURL**
```bash
curl -X GET "http://localhost:8083/api/notifications/unread?userId=1" \
  -H "Authorization: Bearer <jwt_token>"
```

---

#### `GET /notifications/unread-count?userId={userId}`
Retrieve the count of unread notifications.

**Response**
```json
3
```

**Example cURL**
```bash
curl -X GET "http://localhost:8083/api/notifications/unread-count?userId=1" \
  -H "Authorization: Bearer <jwt_token>"
```

---

#### `PUT /notifications/{id}/read`
Mark a single notification as read.

**Response**
`204 No Content`

**Example cURL**
```bash
curl -X PUT http://localhost:8083/api/notifications/10/read \
  -H "Authorization: Bearer <jwt_token>"
```

---

#### `PUT /notifications/read-all?userId={userId}`
Mark all notifications as read for a user.

**Response**
`204 No Content`

**Example cURL**
```bash
curl -X PUT "http://localhost:8083/api/notifications/read-all?userId=1" \
  -H "Authorization: Bearer <jwt_token>"
```

---

### Dashboard

> **Access:** `HR` or `ADMIN` roles only.

#### `GET /dashboard/metrics`
Retrieve high-level dashboard metrics.

**Response (`DashboardMetricsDto`)**
```json
{
  "totalRequestsThisMonth": 12,
  "totalRequestsThisYear": 145,
  "pendingSupervisor": 5,
  "pendingHr": 3,
  "approvedInCountry": 80,
  "approvedOutOfCountry": 25,
  "rejected": 10,
  "upcoming30Days": 8,
  "upcoming60Days": 15,
  "totalEstimatedCostThisMonth": 24000.00,
  "currency": "USD"
}
```

**Example cURL**
```bash
curl -X GET http://localhost:8083/api/dashboard/metrics \
  -H "Authorization: Bearer <jwt_token>"
```

---

#### `GET /dashboard/by-department`
Training request counts grouped by department.

**Response**
```json
[
  { "department": "IT", "count": 45 },
  { "department": "HR", "count": 20 }
]
```

**Example cURL**
```bash
curl -X GET http://localhost:8083/api/dashboard/by-department \
  -H "Authorization: Bearer <jwt_token>"
```

---

#### `GET /dashboard/monthly-trend`
Request submission counts for the last 6 months.

**Response**
```json
[
  { "month": "2024-08", "count": 10 },
  { "month": "2024-09", "count": 15 }
]
```

**Example cURL**
```bash
curl -X GET http://localhost:8083/api/dashboard/monthly-trend \
  -H "Authorization: Bearer <jwt_token>"
```

---

#### `GET /dashboard/type-distribution`
Distribution of in-country vs out-of-country training requests.

**Response**
```json
[
  { "type": "In-Country", "count": 120 },
  { "type": "Out-of-Country", "count": 30 }
]
```

**Example cURL**
```bash
curl -X GET http://localhost:8083/api/dashboard/type-distribution \
  -H "Authorization: Bearer <jwt_token>"
```

---

#### `GET /dashboard/approval-rates`
Overall approval, rejection, and pending counts.

**Response**
```json
[
  { "status": "Approved", "count": 105 },
  { "status": "Rejected", "count": 15 },
  { "status": "Pending", "count": 30 }
]
```

**Example cURL**
```bash
curl -X GET http://localhost:8083/api/dashboard/approval-rates \
  -H "Authorization: Bearer <jwt_token>"
```

---

### Admin / Users

> **Access:** `ADMIN` role only.

#### `GET /admin/users`
Retrieve all users.

**Response**
Array of `UserDto`.

**Example cURL**
```bash
curl -X GET http://localhost:8083/api/admin/users \
  -H "Authorization: Bearer <jwt_token>"
```

---

#### `GET /admin/users/{id}`
Retrieve a user by ID.

**Response (`UserDto`)**

**Example cURL**
```bash
curl -X GET http://localhost:8083/api/admin/users/5 \
  -H "Authorization: Bearer <jwt_token>"
```

---

#### `POST /admin/users`
Create a new user.

**Request Body (`RegisterRequest`)**
Same as `/auth/register`.

**Response (`UserDto`)**

**Example cURL**
```bash
curl -X POST http://localhost:8083/api/admin/users \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alice",
    "lastName": "Wonder",
    "email": "alice@example.com",
    "password": "password123",
    "role": "HR",
    "departmentId": 1,
    "supervisorId": 2,
    "phone": "+255712345678",
    "active": true
  }'
```

---

#### `PUT /admin/users/{id}`
Update an existing user.

**Request Body (`RegisterRequest`)**
Partial updates supported — only provided fields are changed.

**Response (`UserDto`)**

**Example cURL**
```bash
curl -X PUT http://localhost:8083/api/admin/users/5 \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alice",
    "lastName": "Wonderland",
    "phone": "+255799999999"
  }'
```

---

#### `DELETE /admin/users/{id}`
Soft-delete a user (sets `active = false`).

**Response**
`204 No Content`

**Example cURL**
```bash
curl -X DELETE http://localhost:8083/api/admin/users/5 \
  -H "Authorization: Bearer <jwt_token>"
```

---

#### `PATCH /admin/users/{id}/active?active={boolean}`
Toggle a user's active status.

**Response**
`204 No Content`

**Example cURL**
```bash
curl -X PATCH "http://localhost:8083/api/admin/users/5/active?active=false" \
  -H "Authorization: Bearer <jwt_token>"
```

---

#### `GET /admin/users/departments`
Retrieve all departments.

**Response**
Array of `DepartmentDto`.

**Example cURL**
```bash
curl -X GET http://localhost:8083/api/admin/users/departments \
  -H "Authorization: Bearer <jwt_token>"
```

---

#### `POST /admin/users/departments`
Create a new department.

**Request Body (`DepartmentDto`)**
```json
{
  "name": "Finance",
  "description": "Finance and Accounting Department"
}
```

**Response (`DepartmentDto`)**

**Example cURL**
```bash
curl -X POST http://localhost:8083/api/admin/users/departments \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Finance",
    "description": "Finance and Accounting Department"
  }'
```

---

## Data Models

### LoginRequest
| Field      | Type   | Required | Description          |
|------------|--------|----------|----------------------|
| `email`    | string | Yes      | User email address   |
| `password` | string | Yes      | User password        |

### RegisterRequest
| Field          | Type    | Required | Description                  |
|----------------|---------|----------|------------------------------|
| `firstName`    | string  | Yes      | First name                   |
| `lastName`     | string  | Yes      | Last name                    |
| `email`        | string  | Yes      | Unique email address         |
| `password`     | string  | Yes      | Password (min 6 chars)       |
| `role`         | `Role`  | No       | Defaults to `EMPLOYEE`       |
| `departmentId` | long    | No       | Department ID                |
| `supervisorId` | long    | No       | Supervisor user ID           |
| `phone`        | string  | No       | Contact phone number         |
| `active`       | boolean | No       | Defaults to `true`           |

### AuthResponse
| Field       | Type   | Description              |
|-------------|--------|--------------------------|
| `token`     | string | JWT access token         |
| `email`     | string | User email               |
| `firstName` | string | First name               |
| `lastName`  | string | Last name                |
| `role`      | `Role` | User role                |
| `id`        | long   | User ID                  |

### UserDto
| Field            | Type    | Description                  |
|------------------|---------|------------------------------|
| `id`             | long    | User ID                      |
| `firstName`      | string  | First name                   |
| `lastName`       | string  | Last name                    |
| `email`          | string  | Email address                |
| `role`           | `Role`  | Assigned role                |
| `phone`          | string  | Phone number                 |
| `departmentName` | string  | Department name              |
| `departmentId`   | long    | Department ID                |
| `supervisorName` | string  | Supervisor's full name       |
| `supervisorId`   | long    | Supervisor user ID           |
| `active`         | boolean | Account active status        |

### CreateTrainingRequest
| Field                | Type       | Required | Description                        |
|----------------------|------------|----------|------------------------------------|
| `title`              | string     | Yes      | Training title                     |
| `description`        | string     | No       | Detailed description               |
| `objectives`         | string     | No       | Learning objectives                |
| `trainingType`       | string     | Yes      | `IN_COUNTRY` or `OUT_OF_COUNTRY`   |
| `proposedStartDate`  | date       | Yes      | ISO date (`YYYY-MM-DD`)            |
| `proposedEndDate`    | date       | Yes      | ISO date (`YYYY-MM-DD`)            |
| `provider`           | string     | No       | Training provider name             |
| `institution`        | string     | No       | Institution name                   |
| `estimatedCost`      | decimal    | No       | Estimated cost                     |
| `currency`           | string     | No       | Currency code (e.g., `USD`, `TZS`) |
| `justification`      | string     | No       | Business justification             |
| `expectedBenefits`   | string     | No       | Expected outcomes                  |

### TrainingRequestDto
Extends `CreateTrainingRequest` with the following additional fields:

| Field                | Type                  | Description                        |
|----------------------|-----------------------|------------------------------------|
| `id`                 | long                  | Request ID                         |
| `employeeId`         | long                  | Submitter's user ID                |
| `employeeName`       | string                | Submitter's full name              |
| `departmentName`     | string                | Employee's department              |
| `supervisorName`     | string                | Assigned supervisor's name         |
| `status`             | `RequestStatus`       | Current approval status            |
| `supervisorId`       | long                  | Supervisor user ID                 |
| `hrApproverId`       | long                  | HR approver user ID                |
| `hrApproverName`     | string                | HR approver name                   |
| `createdAt`          | datetime              | Submission timestamp               |
| `updatedAt`          | datetime              | Last update timestamp              |
| `documents`          | `TrainingDocumentDto[]`| Attached files                     |
| `rejectionReason`    | string                | Reason if rejected                 |
| `rescheduleComment`  | string                | Comment if rescheduled             |
| `rescheduledStartDate`| date                 | New start date if rescheduled      |
| `rescheduledEndDate` | date                  | New end date if rescheduled        |

### TrainingDocumentDto
| Field        | Type     | Description                  |
|--------------|----------|------------------------------|
| `id`         | long     | Document ID                  |
| `fileName`   | string   | Original file name           |
| `fileType`   | string   | MIME type                    |
| `fileSize`   | long     | Size in bytes                |
| `downloadUrl`| string   | Relative download URL        |
| `uploadedAt` | datetime | Upload timestamp             |

### ApprovalAction
| Field          | Type   | Required | Description                        |
|----------------|--------|----------|------------------------------------|
| `action`       | string | Yes      | `APPROVE`, `REJECT`, `RESCHEDULE`  |
| `reason`       | string | No*      | Required for `REJECT`              |
| `comments`     | string | No       | Optional comment                   |
| `newStartDate` | date   | No**     | Required for `RESCHEDULE`          |
| `newEndDate`   | date   | No**     | Required for `RESCHEDULE`          |
| `newProvider`  | string | No       | Optional new provider              |

### NotificationDto
| Field       | Type     | Description                  |
|-------------|----------|------------------------------|
| `id`        | long     | Notification ID              |
| `title`     | string   | Notification title           |
| `message`   | string   | Notification body            |
| `read`      | boolean  | Read status                  |
| `link`      | string   | Relative link to resource    |
| `createdAt` | datetime | Creation timestamp           |

### AuditLogDto
| Field       | Type     | Description                  |
|-------------|----------|------------------------------|
| `id`        | long     | Log entry ID                 |
| `requestId` | long     | Related request ID           |
| `userId`    | long     | Actor user ID                |
| `userName`  | string   | Actor full name              |
| `action`    | string   | Action performed             |
| `details`   | string   | Detailed description         |
| `oldStatus` | string   | Previous status (if any)     |
| `newStatus` | string   | New status (if any)          |
| `timestamp` | datetime | Action timestamp             |

### DashboardMetricsDto
| Field                        | Type    | Description                  |
|------------------------------|---------|------------------------------|
| `totalRequestsThisMonth`     | long    | Requests created this month  |
| `totalRequestsThisYear`      | long    | Requests created this year   |
| `pendingSupervisor`          | long    | Awaiting supervisor action   |
| `pendingHr`                  | long    | Awaiting HR action           |
| `approvedInCountry`          | long    | Approved in-country trainings|
| `approvedOutOfCountry`       | long    | Approved out-of-country      |
| `rejected`                   | long    | Total rejected requests      |
| `upcoming30Days`             | long    | Starting within 30 days      |
| `upcoming60Days`             | long    | Starting within 60 days      |
| `totalEstimatedCostThisMonth`| decimal | Sum of estimated costs       |
| `currency`                   | string  | Dominant currency code       |

### DepartmentDto
| Field         | Type   | Description                  |
|---------------|--------|------------------------------|
| `id`          | long   | Department ID                |
| `name`        | string | Department name              |
| `description` | string | Department description       |

---

## Enums

### Role
```
EMPLOYEE
SUPERVISOR
HR
ADMIN
```

### RequestStatus
```
PENDING_SUPERVISOR
SUPERVISOR_APPROVED
PENDING_HR
HR_APPROVED
REJECTED
RESCHEDULED
```

### TrainingType
```
IN_COUNTRY
OUT_OF_COUNTRY
```

---

## File Uploads

- **Max file size:** 5 MB per file
- **Max request size:** 10 MB total
- **Upload directory:** `uploads/` (relative to working directory)
- Files are stored with a UUID prefix: `{uuid}_{originalFilename}`
- Download URLs follow the pattern: `/requests/documents/download/{storedFilename}`

---

## Audit & Notifications

- Every status-changing action (submit, approve, reject, reschedule) creates an `AuditLog` entry.
- Notifications are automatically generated for:
  - Supervisor when a new request is submitted
  - Employee when a supervisor approves or rejects
  - All HR users when a request reaches `SUPERVISOR_APPROVED`
  - Employee when HR approves, rejects, or reschedules

---

*Document generated for HR Training Request Portal v1.0.0*
