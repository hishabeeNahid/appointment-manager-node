import dotenv from 'dotenv';
import path from 'path';

// Load environment variables for testing
dotenv.config({
  path: path.join(process.cwd(), '.env.test'),
});

// Set test environment
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(30000);

// Suppress console logs during tests (optional)
if (process.env.SUPPRESS_LOGS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

// Global test utilities
global.testUtils = {
  // Helper to create test tokens
  createTestToken: (payload: any) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
  },

  // Helper to generate test data
  generateTestData: {
    doctor: (overrides = {}) => ({
      name: 'Dr. Test Doctor',
      email: `test.doctor.${Date.now()}@example.com`,
      password: 'password123',
      specialization: 'Cardiology',
      photo_url: 'https://example.com/doctor.jpg',
      ...overrides,
    }),

    patient: (overrides = {}) => ({
      name: 'Test Patient',
      email: `test.patient.${Date.now()}@example.com`,
      password: 'password123',
      photo_url: 'https://example.com/patient.jpg',
      ...overrides,
    }),

    appointment: (overrides = {}) => ({
      doctorId: 'test-doctor-id',
      patientId: 'test-patient-id',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'PENDING',
      ...overrides,
    }),
  },
};
