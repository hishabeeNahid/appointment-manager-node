import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import app from "../app";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Doctor Appointment Management System API Tests", () => {
  let doctorToken: string;
  let patientToken: string;
  let doctorId: string;
  let patientId: string;
  let appointmentId: string;

  // Test data
  const testDoctor = {
    name: "Dr. Test Doctor",
    email: "test.doctor@example.com",
    password: "password123",
    specialization: "Cardiology",
    photo_url: "https://example.com/doctor.jpg",
  };

  const testPatient = {
    name: "Test Patient",
    email: "test.patient@example.com",
    password: "password123",
    photo_url: "https://example.com/patient.jpg",
  };

  beforeAll(async () => {
    // Clean up test data
    await prisma.appointment.deleteMany({
      where: {
        OR: [
          { doctor: { email: testDoctor.email } },
          { patient: { email: testPatient.email } },
        ],
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: { in: [testDoctor.email, testPatient.email] },
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("Authentication Routes", () => {
    describe("POST /api/v1/auth/register/patient", () => {
      it("should register a new patient successfully", async () => {
        const response = await request(app)
          .post("/api/v1/auth/register/patient")
          .send(testPatient)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(testPatient.name);
        expect(response.body.data.email).toBe(testPatient.email);
        expect(response.body.data.role).toBe("PATIENT");
        expect(response.body.data.password).toBeUndefined();
      });

      it("should return error for duplicate email", async () => {
        const response = await request(app)
          .post("/api/v1/auth/register/patient")
          .send(testPatient)
          .expect(409);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("User already exists");
      });

      it("should return error for invalid email format", async () => {
        const response = await request(app)
          .post("/api/v1/auth/register/patient")
          .send({
            ...testPatient,
            email: "invalid-email",
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      it("should return error for short password", async () => {
        const response = await request(app)
          .post("/api/v1/auth/register/patient")
          .send({
            ...testPatient,
            password: "123",
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe("POST /api/v1/auth/register/doctor", () => {
      it("should register a new doctor successfully", async () => {
        const response = await request(app)
          .post("/api/v1/auth/register/doctor")
          .send(testDoctor)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(testDoctor.name);
        expect(response.body.data.email).toBe(testDoctor.email);
        expect(response.body.data.role).toBe("DOCTOR");
        expect(response.body.data.specialization).toBe(
          testDoctor.specialization
        );
        expect(response.body.data.password).toBeUndefined();
      });

      it("should return error when specialization is missing", async () => {
        const response = await request(app)
          .post("/api/v1/auth/register/doctor")
          .send({
            name: "Dr. No Specialization",
            email: "no.spec@example.com",
            password: "password123",
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
          "Specialization is required for doctors"
        );
      });
    });

    describe("POST /api/v1/auth/login", () => {
      it("should login patient successfully", async () => {
        const response = await request(app)
          .post("/api/v1/auth/login")
          .send({
            email: testPatient.email,
            password: testPatient.password,
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.email).toBe(testPatient.email);
        expect(response.body.data.user.role).toBe("PATIENT");
        expect(response.body.data.token).toBeDefined();

        patientToken = response.body.data.token;
        patientId = response.body.data.user.id;
      });

      it("should login doctor successfully", async () => {
        const response = await request(app)
          .post("/api/v1/auth/login")
          .send({
            email: testDoctor.email,
            password: testDoctor.password,
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.email).toBe(testDoctor.email);
        expect(response.body.data.user.role).toBe("DOCTOR");
        expect(response.body.data.token).toBeDefined();

        doctorToken = response.body.data.token;
        doctorId = response.body.data.user.id;
      });

      it("should return error for invalid credentials", async () => {
        const response = await request(app)
          .post("/api/v1/auth/login")
          .send({
            email: testPatient.email,
            password: "wrongpassword",
          })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Invalid credentials");
      });

      it("should return error for non-existent user", async () => {
        const response = await request(app)
          .post("/api/v1/auth/login")
          .send({
            email: "nonexistent@example.com",
            password: "password123",
          })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Invalid credentials");
      });
    });
  });

  describe("User Routes", () => {
    describe("GET /api/v1/doctors", () => {
      it("should get all doctors without authentication", async () => {
        const response = await request(app).get("/api/v1/doctors").expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.meta).toBeDefined();
      });

      it("should filter doctors by specialization", async () => {
        const response = await request(app)
          .get("/api/v1/doctors?specialization=Cardiology")
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        response.body.data.forEach((doctor: any) => {
          expect(doctor.specialization).toBe("Cardiology");
        });
      });

      it("should search doctors by name", async () => {
        const response = await request(app)
          .get("/api/v1/doctors?search=Test")
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it("should support pagination", async () => {
        const response = await request(app)
          .get("/api/v1/doctors?page=1&limit=5")
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.meta.page).toBe(1);
        expect(response.body.meta.limit).toBe(5);
      });
    });

    describe("GET /api/v1/patients", () => {
      it("should get all patients with doctor authentication", async () => {
        const response = await request(app)
          .get("/api/v1/patients")
          .set("Authorization", `Bearer ${doctorToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.meta).toBeDefined();
      });

      it("should deny access to patients", async () => {
        const response = await request(app)
          .get("/api/v1/patients")
          .set("Authorization", `Bearer ${patientToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain("Access denied");
      });

      it("should require authentication", async () => {
        const response = await request(app).get("/api/v1/patients").expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Please Login First");
      });
    });

    describe("GET /api/v1/specializations", () => {
      it("should get all specializations without authentication", async () => {
        const response = await request(app)
          .get("/api/v1/specializations")
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(10);
      });
    });
  });

  describe("Appointment Routes", () => {
    describe("POST /api/v1/appointments", () => {
      it("should create appointment successfully", async () => {
        const appointmentData = {
          doctorId: doctorId,
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        };

        const response = await request(app)
          .post("/api/v1/appointments")
          .set("Authorization", `Bearer ${patientToken}`)
          .send(appointmentData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.doctorId).toBe(doctorId);
        expect(response.body.data.patientId).toBe(patientId);
        expect(response.body.data.status).toBe("PENDING");

        appointmentId = response.body.data.id;
      });

      it("should deny access to doctors", async () => {
        const appointmentData = {
          doctorId: doctorId,
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };

        const response = await request(app)
          .post("/api/v1/appointments")
          .set("Authorization", `Bearer ${doctorToken}`)
          .send(appointmentData)
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain("Access denied");
      });

      it("should return error for invalid doctor ID", async () => {
        const appointmentData = {
          doctorId: "invalid-id",
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };

        const response = await request(app)
          .post("/api/v1/appointments")
          .set("Authorization", `Bearer ${patientToken}`)
          .send(appointmentData)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Doctor not found");
      });

      it("should return error for past date", async () => {
        const appointmentData = {
          doctorId: doctorId,
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        };

        const response = await request(app)
          .post("/api/v1/appointments")
          .set("Authorization", `Bearer ${patientToken}`)
          .send(appointmentData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
          "Appointment date must be in the future"
        );
      });

      it("should require authentication", async () => {
        const appointmentData = {
          doctorId: doctorId,
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };

        const response = await request(app)
          .post("/api/v1/appointments")
          .send(appointmentData)
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Please Login First");
      });
    });

    describe("GET /api/v1/appointments/patient", () => {
      it("should get patient appointments", async () => {
        const response = await request(app)
          .get("/api/v1/appointments/patient")
          .set("Authorization", `Bearer ${patientToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.meta).toBeDefined();
      });

      it("should filter by status", async () => {
        const response = await request(app)
          .get("/api/v1/appointments/patient?status=PENDING")
          .set("Authorization", `Bearer ${patientToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        response.body.data.forEach((appointment: any) => {
          expect(appointment.status).toBe("PENDING");
        });
      });

      it("should deny access to doctors", async () => {
        const response = await request(app)
          .get("/api/v1/appointments/patient")
          .set("Authorization", `Bearer ${doctorToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain("Access denied");
      });
    });

    describe("GET /api/v1/appointments/doctor", () => {
      it("should get doctor appointments", async () => {
        const response = await request(app)
          .get("/api/v1/appointments/doctor")
          .set("Authorization", `Bearer ${doctorToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.meta).toBeDefined();
      });

      it("should filter by status", async () => {
        const response = await request(app)
          .get("/api/v1/appointments/doctor?status=PENDING")
          .set("Authorization", `Bearer ${doctorToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        response.body.data.forEach((appointment: any) => {
          expect(appointment.status).toBe("PENDING");
        });
      });

      it("should filter by date", async () => {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const response = await request(app)
          .get(`/api/v1/appointments/doctor?date=${tomorrow.toISOString()}`)
          .set("Authorization", `Bearer ${doctorToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it("should deny access to patients", async () => {
        const response = await request(app)
          .get("/api/v1/appointments/doctor")
          .set("Authorization", `Bearer ${patientToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain("Access denied");
      });
    });

    describe("PATCH /api/v1/appointments/:id", () => {
      it("should update appointment status by doctor", async () => {
        const response = await request(app)
          .patch(`/api/v1/appointments/${appointmentId}`)
          .set("Authorization", `Bearer ${doctorToken}`)
          .send({ status: "COMPLETED" })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe("COMPLETED");
      });

      it("should update appointment status by patient", async () => {
        const response = await request(app)
          .patch(`/api/v1/appointments/${appointmentId}`)
          .set("Authorization", `Bearer ${patientToken}`)
          .send({ status: "CANCELLED" })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe("CANCELLED");
      });

      it("should return error for invalid appointment ID", async () => {
        const response = await request(app)
          .patch("/api/v1/appointments/invalid-id")
          .set("Authorization", `Bearer ${doctorToken}`)
          .send({ status: "COMPLETED" })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Appointment not found");
      });

      it("should return error for invalid status", async () => {
        const response = await request(app)
          .patch(`/api/v1/appointments/${appointmentId}`)
          .set("Authorization", `Bearer ${doctorToken}`)
          .send({ status: "INVALID_STATUS" })
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      it("should require authentication", async () => {
        const response = await request(app)
          .patch(`/api/v1/appointments/${appointmentId}`)
          .send({ status: "COMPLETED" })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Please Login First");
      });
    });
  });

  describe("Error Handling", () => {
    it("should return 404 for non-existent routes", async () => {
      const response = await request(app)
        .get("/api/v1/non-existent-route")
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Not Found");
    });

    it("should handle rate limiting", async () => {
      // Make multiple requests to trigger rate limiting
      const promises = Array.from({ length: 150 }, () =>
        request(app).get("/api/v1/doctors")
      );

      const responses = await Promise.all(promises);
      const rateLimitedResponse = responses.find((res) => res.status === 429);

      if (rateLimitedResponse) {
        expect(rateLimitedResponse.body.success).toBe(false);
        expect(rateLimitedResponse.body.message).toContain("Too many requests");
      }
    });
  });

  describe("Token Validation", () => {
    it("should reject invalid tokens", async () => {
      const response = await request(app)
        .get("/api/v1/patients")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid token");
    });

    it("should reject expired tokens", async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { userId: "test", email: "test@example.com", role: "DOCTOR" },
        process.env.JWT_SECRET || "default-secret",
        { expiresIn: "-1h" }
      );

      const response = await request(app)
        .get("/api/v1/patients")
        .set("Authorization", `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token has expired");
    });

    it("should reject requests without Authorization header", async () => {
      const response = await request(app).get("/api/v1/patients").expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Please Login First");
    });
  });
});
