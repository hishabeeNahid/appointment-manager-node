import request from "supertest";
import app from "../app";

describe("Health Check Endpoint", () => {
  describe("GET /api/v1/health", () => {
    it("should return health status successfully", async () => {
      const response = await request(app).get("/api/v1/health").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Health check successful");
      expect(response.body.data).toBeDefined();
      expect(response.body.data.status).toBe("healthy");
      expect(response.body.data.timestamp).toBeDefined();
      expect(response.body.data.uptime).toBeDefined();
      expect(response.body.data.environment).toBeDefined();
      expect(response.body.data.version).toBeDefined();
      expect(response.body.data.services).toBeDefined();
      expect(response.body.data.services.database).toBeDefined();
      expect(response.body.data.services.server).toBe("healthy");
    });

    it("should not require authentication", async () => {
      const response = await request(app).get("/api/v1/health").expect(200);

      // If authentication was required, this would return 401
      expect(response.status).toBe(200);
    });

    it("should return proper response structure", async () => {
      const response = await request(app).get("/api/v1/health").expect(200);

      const expectedStructure = {
        success: true,
        statusCode: 200,
        message: "Health check successful",
        data: {
          status: "healthy",
          timestamp: expect.any(String),
          uptime: expect.any(Number),
          environment: expect.any(String),
          version: expect.any(String),
          services: {
            database: expect.stringMatching(/^(healthy|unhealthy)$/),
            server: "healthy",
          },
        },
      };

      expect(response.body).toMatchObject(expectedStructure);
    });
  });
});
