# Testing Documentation

## Overview

This document provides comprehensive testing information for the Doctor Appointment Management System API. The testing suite uses Jest as the testing framework and Supertest for HTTP assertions.

## Test Structure

```
src/tests/
├── setup.ts                 # Jest setup and global configuration
├── api.test.ts             # Comprehensive API tests (all routes)
├── auth.test.ts            # Authentication-specific tests
├── appointments.test.ts    # Appointment-specific tests
└── users.test.ts          # User-specific tests
```

## Test Categories

### 1. Authentication Tests (`auth.test.ts`)
- User registration (patient and doctor)
- User login
- Password security validation
- JWT token generation and validation
- Input validation for authentication endpoints

### 2. User Management Tests (`users.test.ts`)
- Doctor listing with filtering and search
- Patient listing (doctor access only)
- Specializations listing
- Pagination functionality
- Data integrity and security

### 3. Appointment Tests (`appointments.test.ts`)
- Appointment creation
- Appointment retrieval (patient and doctor views)
- Appointment status updates
- Business logic validation
- Authorization and ownership validation

### 4. Comprehensive API Tests (`api.test.ts`)
- End-to-end workflow testing
- Error handling scenarios
- Rate limiting tests
- Token validation tests
- Cross-route integration tests

## Running Tests

### Prerequisites
1. Install dependencies: `yarn install`
2. Set up test database
3. Configure test environment variables

### Test Commands

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage

# Run tests with verbose output
yarn test:verbose

# Run specific test suites
yarn test:auth
yarn test:appointments
yarn test:users
```

### Test Environment Setup

Create a `.env.test` file with the following configuration:

```env
NODE_ENV=test
PORT=5051
DATABASE_URL="postgresql://username:password@localhost:5432/doctor_appointment_test_db"
DIRECT_URL="postgresql://username:password@localhost:5432/doctor_appointment_test_db"
JWT_SECRET=test-jwt-secret-key-for-testing-only
SUPPRESS_LOGS=true
TEST_TIMEOUT=30000
```

## Test Coverage

### Authentication Coverage
- ✅ Patient registration
- ✅ Doctor registration
- ✅ User login
- ✅ Password hashing validation
- ✅ JWT token generation
- ✅ Input validation
- ✅ Duplicate email handling
- ✅ Invalid credentials handling

### User Management Coverage
- ✅ Doctor listing (public)
- ✅ Patient listing (doctor access only)
- ✅ Specializations listing
- ✅ Search and filtering
- ✅ Pagination
- ✅ Data security (no sensitive data exposure)
- ✅ Authorization checks

### Appointment Coverage
- ✅ Appointment creation (patient only)
- ✅ Appointment retrieval (role-based)
- ✅ Appointment status updates
- ✅ Business logic validation
- ✅ Double booking prevention
- ✅ Date validation
- ✅ Ownership validation

### Security Coverage
- ✅ JWT token validation
- ✅ Role-based access control
- ✅ Resource ownership validation
- ✅ Rate limiting
- ✅ Input sanitization
- ✅ Error handling

## Test Data Management

### Test Data Setup
Each test file includes:
- Test user creation (doctors and patients)
- Test data cleanup
- Token generation for authenticated requests

### Test Data Cleanup
- Automatic cleanup in `beforeAll` and `afterAll` hooks
- Isolation between test suites
- Database state reset between tests

## Test Scenarios

### Happy Path Scenarios
1. **Complete Patient Workflow**
   - Register patient
   - Login patient
   - Browse doctors
   - Create appointment
   - View appointments
   - Update appointment status

2. **Complete Doctor Workflow**
   - Register doctor
   - Login doctor
   - View patient list
   - View appointments
   - Update appointment status

### Error Scenarios
1. **Authentication Errors**
   - Invalid credentials
   - Missing required fields
   - Duplicate email registration
   - Invalid email format
   - Short passwords

2. **Authorization Errors**
   - Accessing protected routes without token
   - Accessing routes with wrong role
   - Accessing other users' resources
   - Invalid/expired tokens

3. **Business Logic Errors**
   - Creating appointments in the past
   - Double booking appointments
   - Invalid appointment status updates
   - Non-existent resource access

4. **Validation Errors**
   - Missing required fields
   - Invalid data formats
   - Invalid query parameters
   - Malformed request bodies

## Performance Testing

### Response Time Tests
- API endpoints should respond within 5 seconds
- Pagination should work efficiently
- Large result sets should be handled properly

### Load Testing
- Rate limiting functionality
- Concurrent request handling
- Database connection management

## Security Testing

### Authentication Security
- Password hashing validation
- JWT token security
- Token expiration handling
- Secure password requirements

### Authorization Security
- Role-based access control
- Resource ownership validation
- Cross-user access prevention
- Sensitive data protection

### Input Validation
- SQL injection prevention
- XSS protection
- Input sanitization
- Malformed request handling

## Test Utilities

### Global Test Utilities
```typescript
// Available in all test files
global.testUtils = {
  createTestToken: (payload) => { /* ... */ },
  generateTestData: {
    doctor: (overrides) => { /* ... */ },
    patient: (overrides) => { /* ... */ },
    appointment: (overrides) => { /* ... */ }
  }
};
```

### Common Test Patterns
```typescript
// Authentication setup
const response = await request(app)
  .post('/api/v1/auth/login')
  .send({ email, password });

const token = response.body.data.token;

// Authenticated request
const authResponse = await request(app)
  .get('/api/v1/protected-route')
  .set('Authorization', `Bearer ${token}`);
```

## Continuous Integration

### GitHub Actions (Recommended)
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: yarn install
      - run: yarn test:coverage
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "yarn test",
      "pre-push": "yarn test:coverage"
    }
  }
}
```

## Debugging Tests

### Common Issues
1. **Database Connection**: Ensure test database is running
2. **Environment Variables**: Check `.env.test` configuration
3. **Test Isolation**: Verify cleanup is working properly
4. **Async Operations**: Ensure proper async/await usage

### Debug Commands
```bash
# Run specific test with verbose output
yarn test --verbose --testNamePattern="should create appointment"

# Run tests with debugging
NODE_ENV=test DEBUG=* yarn test

# Run tests with coverage and watch
yarn test:coverage --watch
```

## Best Practices

### Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names
- Keep tests independent and isolated
- Clean up test data properly

### Test Data
- Use unique test data for each test
- Avoid hardcoded values
- Use test utilities for data generation
- Clean up after tests

### Assertions
- Test both success and failure scenarios
- Validate response structure and content
- Check error messages and status codes
- Verify business logic constraints

### Performance
- Keep tests fast and efficient
- Use proper async/await patterns
- Avoid unnecessary database operations
- Mock external dependencies when appropriate

## Coverage Goals

### Minimum Coverage Targets
- **Lines**: 90%
- **Functions**: 95%
- **Branches**: 85%
- **Statements**: 90%

### Critical Paths (100% Coverage Required)
- Authentication flows
- Authorization middleware
- Business logic validation
- Error handling
- Security features

## Monitoring and Maintenance

### Regular Tasks
- Update test data as API evolves
- Review and update test scenarios
- Monitor test performance
- Update dependencies

### Test Maintenance
- Remove obsolete tests
- Update test utilities
- Refactor test structure
- Improve test documentation

## Troubleshooting

### Common Test Failures
1. **Database Connection Issues**
   - Check database URL
   - Verify database is running
   - Check network connectivity

2. **Environment Issues**
   - Verify `.env.test` configuration
   - Check NODE_ENV setting
   - Validate JWT secret

3. **Test Data Issues**
   - Check test data cleanup
   - Verify unique test data
   - Check database state

4. **Async Issues**
   - Ensure proper async/await usage
   - Check test timeouts
   - Verify promise handling

### Getting Help
- Check test logs for detailed error messages
- Review test documentation
- Consult API documentation
- Check GitHub issues for known problems
