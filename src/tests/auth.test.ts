import request from "supertest";

import bcrypt from "bcryptjs";
import app from "../app";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Authentication Routes", () => {
  const testDoctor = {
    name: "Dr. Auth Test Doctor",
    email: "auth.test.doctor@example.com",
    password: "password123",
    specialization: "Cardiology",
    photo_url: "https://example.com/doctor.jpg",
  };

  const testPatient = {
    name: "Auth Test Patient",
    email: "auth.test.patient@example.com",
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
      expect(response.body.data.photo_url).toBe(testPatient.photo_url);
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
      expect(response.body.errorMessages[0].message).toBe(
        "Invalid email format"
      );
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
      expect(response.body.errorMessages[0].message).toBe(
        "Password must be at least 6 characters"
      );
    });

    it("should return error for missing required fields", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register/patient")
        .send({
          name: "Test User",
          // Missing email and password
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
      expect(response.body.data.specialization).toBe(testDoctor.specialization);
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

    it("should return error for duplicate email", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register/doctor")
        .send(testDoctor)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("User already exists");
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
      expect(typeof response.body.data.token).toBe("string");
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
      expect(typeof response.body.data.token).toBe("string");
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

    it("should return error for missing email", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          password: "password123",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should return error for missing password", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testPatient.email,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should return error for invalid email format", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "invalid-email",
          password: "password123",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errorMessages[0].message).toBe(
        "Invalid email format"
      );
    });
  });

  describe("Password Security", () => {
    it("should hash passwords during registration", async () => {
      const user = await prisma.user.findUnique({
        where: { email: testPatient.email },
      });

      expect(user).toBeDefined();
      expect(user?.password).not.toBe(testPatient.password);

      // Verify password was hashed correctly
      const isValidPassword = await bcrypt.compare(
        testPatient.password,
        user!.password
      );
      expect(isValidPassword).toBe(true);
    });
  });

  describe("Token Security", () => {
    it("should generate valid JWT tokens", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testPatient.email,
          password: testPatient.password,
        })
        .expect(200);

      const token = response.body.data.token;
      const jwt = require("jsonwebtoken");

      // Verify token can be decoded
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "default-secret"
      );
      expect(decoded.userId).toBeDefined();
      expect(decoded.email).toBe(testPatient.email);
      expect(decoded.role).toBe("PATIENT");
    });
  });
});
