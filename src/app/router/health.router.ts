import { Router } from "express";
import { HealthController } from "../controller/health.controller";

const router = Router();

// Health check endpoint - no authentication required
router.get("/health", HealthController.getHealth);

export default router;
