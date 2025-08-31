# Authorization System Documentation

## Overview

The Doctor Appointment Management System implements a comprehensive authorization system with JWT-based authentication and role-based access control (RBAC).

## Authentication Flow

### 1. Token Generation

- JWT tokens are generated upon successful login
- Tokens contain: `userId`, `email`, `role`, and expiration time
- Default expiration: 7 days

### 2. Token Validation

- Tokens are validated on protected routes
- Bearer token format: `Authorization: Bearer <token>`
- Automatic expiration checking

## Middleware Components

### Core Authentication Middleware (`src/app/middleware/auth.ts`)

#### `verifyToken`

- Validates JWT token from Authorization header
- Extracts user information and attaches to request
- Handles token expiration and malformed tokens

#### `authorize(...roles)`

- Role-based access control middleware
- Accepts multiple allowed roles
- Provides detailed error messages for unauthorized access

#### `requireDoctor`

- Specific middleware for doctor-only routes
- Ensures user has DOCTOR role

#### `requirePatient`

- Specific middleware for patient-only routes
- Ensures user has PATIENT role

### Advanced Authorization Middleware (`src/app/middleware/authorization.ts`)

#### `rateLimit(maxRequests, windowMs)`

- Rate limiting to prevent abuse
- Configurable requests per time window
- IP-based tracking

#### `authorizeOwnAppointment`

- Ensures users can only access their own appointments
- Validates appointment ownership for doctors and patients

#### `authorizeOwnProfile`

- Ensures users can only access their own profile
- Validates user ID in request parameters

#### `optionalAuth`

- Optional authentication for public routes
- Continues without error if no token provided

#### `checkActiveSession`

- Validates active user session
- Placeholder for additional session checks

#### `validateOrigin`

- CORS validation middleware
- Configurable allowed origins

## Route Protection Examples

### Public Routes (No Authentication Required)

```typescript
router.get("/doctors", UserController.getDoctors);
router.get("/specializations", UserController.getSpecializations);
```

### Patient-Only Routes

```typescript
router.post(
  "/appointments",
  verifyToken,
  authorize("PATIENT"),
  validateRequest(AppointmentValidation.createAppointmentZodSchema),
  AppointmentController.createAppointment
);

router.get(
  "/appointments/patient",
  verifyToken,
  authorize("PATIENT"),
  AppointmentController.getPatientAppointments
);
```

### Doctor-Only Routes

```typescript
router.get(
  "/appointments/doctor",
  verifyToken,
  authorize("DOCTOR"),
  AppointmentController.getDoctorAppointments
);

router.get(
  "/patients",
  verifyToken,
  authorize("DOCTOR"),
  UserController.getPatients
);
```

### Multi-Role Routes

```typescript
router.patch(
  "/appointments/:id",
  verifyToken,
  authorize("DOCTOR", "PATIENT"),
  authorizeOwnAppointment,
  validateRequest(AppointmentValidation.updateAppointmentZodSchema),
  AppointmentController.updateAppointmentStatus
);
```

## Security Features

### 1. Token Security

- JWT tokens with expiration
- Secure token validation
- Automatic token refresh handling

### 2. Rate Limiting

- Global rate limiting: 100 requests per 15 minutes
- Appointment-specific rate limiting: 50 requests per 15 minutes
- IP-based tracking

### 3. CORS Protection

- Configurable origin validation
- Secure CORS headers
- Credential support

### 4. Security Headers

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security

### 5. Input Validation

- Request body size limits (10MB)
- Zod schema validation
- Parameter sanitization

## Error Handling

### Authentication Errors

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Please Login First",
  "errorMessages": [
    {
      "message": "Please Login First",
      "path": "authorization"
    }
  ]
}
```

### Authorization Errors

```json
{
  "success": false,
  "statusCode": 403,
  "message": "Access denied. Required roles: DOCTOR. Your role: PATIENT",
  "errorMessages": [
    {
      "message": "Access denied. Required roles: DOCTOR. Your role: PATIENT",
      "path": "authorization"
    }
  ]
}
```

### Rate Limiting Errors

```json
{
  "success": false,
  "statusCode": 429,
  "message": "Too many requests from this IP, please try again later",
  "errorMessages": [
    {
      "message": "Too many requests from this IP, please try again later",
      "path": "rate-limit"
    }
  ]
}
```

## Usage Examples

### Frontend Integration

#### 1. Login and Store Token

```javascript
const login = async (email, password) => {
  const response = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  localStorage.setItem("token", data.data.token);
  return data;
};
```

#### 2. Authenticated Requests

```javascript
const getAppointments = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/v1/appointments/patient", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.json();
};
```

#### 3. Handle Authentication Errors

```javascript
const handleApiError = (error) => {
  if (error.statusCode === 401) {
    // Redirect to login
    localStorage.removeItem("token");
    window.location.href = "/login";
  } else if (error.statusCode === 403) {
    // Show access denied message
    alert("You do not have permission to access this resource");
  }
};
```

## Best Practices

### 1. Token Management

- Store tokens securely (localStorage/sessionStorage)
- Implement token refresh mechanism
- Clear tokens on logout

### 2. Error Handling

- Handle 401 errors by redirecting to login
- Handle 403 errors with user-friendly messages
- Implement retry logic for rate limiting

### 3. Security

- Use HTTPS in production
- Implement proper CORS policies
- Regular security audits

### 4. Performance

- Implement token caching
- Use appropriate rate limiting
- Monitor API usage

## Testing Authorization

### Test Cases

1. **Valid Token Access**

   - Should allow access to authorized routes
   - Should return proper user data

2. **Invalid Token Access**

   - Should return 401 Unauthorized
   - Should provide clear error message

3. **Expired Token Access**

   - Should return 401 Unauthorized
   - Should indicate token expiration

4. **Role-Based Access**

   - Doctor should access doctor routes
   - Patient should access patient routes
   - Cross-role access should be denied

5. **Resource Ownership**
   - Users should only access their own appointments
   - Users should only access their own profiles

### Testing Commands

```bash
# Test authentication
curl -X POST http://localhost:5050/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john.smith@example.com", "password": "password123"}'

# Test protected route
curl -X GET http://localhost:5050/api/v1/appointments/patient \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Test unauthorized access
curl -X GET http://localhost:5050/api/v1/patients \
  -H "Authorization: Bearer PATIENT_TOKEN_HERE"
```
