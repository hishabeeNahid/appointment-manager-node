import request from "supertest";

import app from "../app";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Appointment Routes", () => {
  let doctorToken: string;
  let patientToken: string;
  let doctorId: string;
  let patientId: string;
  let appointmentId: string;

  const testDoctor = {
    name: "Dr. Appointment Test Doctor",
    email: "appointment.test.doctor@example.com",
    password: "password123",
    specialization: "Cardiology",
    photo_url: "https://example.com/doctor.jpg",
  };

  const testPatient = {
    name: "Appointment Test Patient",
    email: "appointment.test.patient@example.com",
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

    // Create test users
    const doctorResponse = await request(app)
      .post("/api/v1/auth/register/doctor")
      .send(testDoctor);

    const patientResponse = await request(app)
      .post("/api/v1/auth/register/patient")
      .send(testPatient);

    // Login to get tokens
    const doctorLoginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: testDoctor.email,
        password: testDoctor.password,
      });

    const patientLoginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: testPatient.email,
        password: testPatient.password,
      });

    doctorToken = doctorLoginResponse.body.data.token;
    patientToken = patientLoginResponse.body.data.token;
    doctorId = doctorLoginResponse.body.data.user.id;
    patientId = patientLoginResponse.body.data.user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

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
      expect(response.body.data.doctor).toBeDefined();
      expect(response.body.data.patient).toBeDefined();

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

    it("should return error for missing doctor ID", async () => {
      const appointmentData = {
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await request(app)
        .post("/api/v1/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send(appointmentData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should return error for missing date", async () => {
      const appointmentData = {
        doctorId: doctorId,
      };

      const response = await request(app)
        .post("/api/v1/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send(appointmentData)
        .expect(400);

      expect(response.body.success).toBe(false);
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
      expect(response.body.meta.total).toBeGreaterThan(0);
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

    it("should support pagination", async () => {
      const response = await request(app)
        .get("/api/v1/appointments/patient?page=1&limit=5")
        .set("Authorization", `Bearer ${patientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(5);
    });

    it("should deny access to doctors", async () => {
      const response = await request(app)
        .get("/api/v1/appointments/patient")
        .set("Authorization", `Bearer ${doctorToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Access denied");
    });

    it("should require authentication", async () => {
      const response = await request(app)
        .get("/api/v1/appointments/patient")
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Please Login First");
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
      expect(response.body.meta.total).toBeGreaterThan(0);
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

    it("should support pagination", async () => {
      const response = await request(app)
        .get("/api/v1/appointments/doctor?page=1&limit=5")
        .set("Authorization", `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(5);
    });

    it("should deny access to patients", async () => {
      const response = await request(app)
        .get("/api/v1/appointments/doctor")
        .set("Authorization", `Bearer ${patientToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Access denied");
    });

    it("should require authentication", async () => {
      const response = await request(app)
        .get("/api/v1/appointments/doctor")
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Please Login First");
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
      expect(response.body.data.doctor).toBeDefined();
      expect(response.body.data.patient).toBeDefined();
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

    it("should return error for missing status", async () => {
      const response = await request(app)
        .patch(`/api/v1/appointments/${appointmentId}`)
        .set("Authorization", `Bearer ${doctorToken}`)
        .send({})
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

    it("should validate appointment ownership", async () => {
      // Create another appointment with different doctor
      const otherDoctor = {
        name: "Dr. Other Doctor",
        email: "other.doctor@example.com",
        password: "password123",
        specialization: "Dermatology",
      };

      const otherDoctorResponse = await request(app)
        .post("/api/v1/auth/register/doctor")
        .send(otherDoctor);

      const otherDoctorLoginResponse = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: otherDoctor.email,
          password: otherDoctor.password,
        });

      const otherDoctorToken = otherDoctorLoginResponse.body.data.token;

      // Try to update appointment with different doctor
      const response = await request(app)
        .patch(`/api/v1/appointments/${appointmentId}`)
        .set("Authorization", `Bearer ${otherDoctorToken}`)
        .send({ status: "COMPLETED" })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(
        "You can only update your own appointments"
      );
    });
  });

  describe("Appointment Business Logic", () => {
    it("should prevent double booking", async () => {
      const appointmentData = {
        doctorId: doctorId,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      // First appointment should succeed
      await request(app)
        .post("/api/v1/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send(appointmentData)
        .expect(201);

      // Second appointment at same time should fail
      const response = await request(app)
        .post("/api/v1/appointments")
        .set("Authorization", `Bearer ${patientToken}`)
        .send(appointmentData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Doctor is not available at this time"
      );
    });
  });
});
