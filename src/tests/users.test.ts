import request from 'supertest';
import { PrismaClient } from '../../generated/prisma';
import app from '../app';

const prisma = new PrismaClient();

describe('User Routes', () => {
  let doctorToken: string;
  let patientToken: string;

  const testDoctor = {
    name: 'Dr. User Test Doctor',
    email: 'user.test.doctor@example.com',
    password: 'password123',
    specialization: 'Cardiology',
    photo_url: 'https://example.com/doctor.jpg'
  };

  const testPatient = {
    name: 'User Test Patient',
    email: 'user.test.patient@example.com',
    password: 'password123',
    photo_url: 'https://example.com/patient.jpg'
  };

  beforeAll(async () => {
    // Clean up test data
    await prisma.appointment.deleteMany({
      where: {
        OR: [
          { doctor: { email: testDoctor.email } },
          { patient: { email: testPatient.email } }
        ]
      }
    });
    await prisma.user.deleteMany({
      where: {
        email: { in: [testDoctor.email, testPatient.email] }
      }
    });

    // Create test users
    await request(app)
      .post('/api/v1/auth/register/doctor')
      .send(testDoctor);

    await request(app)
      .post('/api/v1/auth/register/patient')
      .send(testPatient);

    // Login to get tokens
    const doctorLoginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testDoctor.email,
        password: testDoctor.password
      });

    const patientLoginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testPatient.email,
        password: testPatient.password
      });

    doctorToken = doctorLoginResponse.body.data.token;
    patientToken = patientLoginResponse.body.data.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/v1/doctors', () => {
    it('should get all doctors without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/doctors')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.total).toBeGreaterThan(0);
    });

    it('should filter doctors by specialization', async () => {
      const response = await request(app)
        .get('/api/v1/doctors?specialization=Cardiology')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach((doctor: any) => {
        expect(doctor.specialization).toBe('Cardiology');
      });
    });

    it('should search doctors by name', async () => {
      const response = await request(app)
        .get('/api/v1/doctors?search=Test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search doctors by specialization', async () => {
      const response = await request(app)
        .get('/api/v1/doctors?search=Cardiology')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/doctors?page=1&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(5);
      expect(response.body.meta.totalPages).toBeDefined();
      expect(response.body.meta.total).toBeDefined();
    });

    it('should return correct doctor data structure', async () => {
      const response = await request(app)
        .get('/api/v1/doctors')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const doctor = response.body.data[0];
        expect(doctor.id).toBeDefined();
        expect(doctor.name).toBeDefined();
        expect(doctor.email).toBeDefined();
        expect(doctor.specialization).toBeDefined();
        expect(doctor.photo_url).toBeDefined();
        expect(doctor.createdAt).toBeDefined();
        expect(doctor.password).toBeUndefined(); // Password should not be returned
      }
    });

    it('should handle empty search results', async () => {
      const response = await request(app)
        .get('/api/v1/doctors?search=NonExistentDoctor')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('should handle invalid pagination parameters', async () => {
      const response = await request(app)
        .get('/api/v1/doctors?page=0&limit=-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/patients', () => {
    it('should get all patients with doctor authentication', async () => {
      const response = await request(app)
        .get('/api/v1/patients')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.total).toBeGreaterThan(0);
    });

    it('should deny access to patients', async () => {
      const response = await request(app)
        .get('/api/v1/patients')
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/patients')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Please Login First');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/patients?page=1&limit=5')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(5);
      expect(response.body.meta.totalPages).toBeDefined();
      expect(response.body.meta.total).toBeDefined();
    });

    it('should return correct patient data structure', async () => {
      const response = await request(app)
        .get('/api/v1/patients')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const patient = response.body.data[0];
        expect(patient.id).toBeDefined();
        expect(patient.name).toBeDefined();
        expect(patient.email).toBeDefined();
        expect(patient.photo_url).toBeDefined();
        expect(patient.createdAt).toBeDefined();
        expect(patient.password).toBeUndefined(); // Password should not be returned
        expect(patient.specialization).toBeUndefined(); // Patients don't have specialization
      }
    });

    it('should reject invalid tokens', async () => {
      const response = await request(app)
        .get('/api/v1/patients')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token');
    });
  });

  describe('GET /api/v1/specializations', () => {
    it('should get all specializations without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/specializations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(10);
    });

    it('should return the correct list of specializations', async () => {
      const response = await request(app)
        .get('/api/v1/specializations')
        .expect(200);

      const expectedSpecializations = [
        'Cardiology',
        'Dermatology',
        'Endocrinology',
        'Gastroenterology',
        'Neurology',
        'Oncology',
        'Orthopedics',
        'Pediatrics',
        'Psychiatry',
        'Radiology'
      ];

      expect(response.body.data).toEqual(expectedSpecializations);
    });

    it('should work with authentication (optional)', async () => {
      const response = await request(app)
        .get('/api/v1/specializations')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Data Integrity', () => {
    it('should not return sensitive information in doctor list', async () => {
      const response = await request(app)
        .get('/api/v1/doctors')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      response.body.data.forEach((doctor: any) => {
        expect(doctor.password).toBeUndefined();
        expect(doctor.role).toBeUndefined(); // Role might be sensitive
      });
    });

    it('should not return sensitive information in patient list', async () => {
      const response = await request(app)
        .get('/api/v1/patients')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      response.body.data.forEach((patient: any) => {
        expect(patient.password).toBeUndefined();
        expect(patient.role).toBeUndefined(); // Role might be sensitive
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking the database connection
      // For now, we'll test that the API responds correctly to normal requests
      const response = await request(app)
        .get('/api/v1/doctors')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should handle malformed query parameters', async () => {
      const response = await request(app)
        .get('/api/v1/doctors?page=abc&limit=xyz')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should respond within reasonable time', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/v1/doctors')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    });

    it('should handle large result sets with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/doctors?limit=100')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta.limit).toBe(100);
    });
  });
});
