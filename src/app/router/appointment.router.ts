import { Router } from "express";
import AppointmentController from "../controller/appointment.controller";
import { verifyToken, authorize } from "../middleware/auth";
import {
  authorizeOwnAppointment,
  rateLimit,
} from "../middleware/authorization";
import validateRequest from "../middleware/validateRequest";
import { AppointmentValidation } from "../validations/appointment.validation";

const router = Router();

// Apply rate limiting to all appointment routes
router.use(rateLimit(500, 15 * 60 * 1000)); // 50 requests per 15 minutes

router.post(
  "/",
  verifyToken,
  authorize("PATIENT"),
  validateRequest(AppointmentValidation.createAppointmentZodSchema),
  AppointmentController.createAppointment
);

router.get(
  "/patient",
  verifyToken,
  authorize("PATIENT"),
  AppointmentController.getPatientAppointments
);

router.get(
  "/doctor",
  verifyToken,
  authorize("DOCTOR"),
  AppointmentController.getDoctorAppointments
);

router.patch(
  "/update-status",
  verifyToken,
  authorize("DOCTOR", "PATIENT"),
  validateRequest(AppointmentValidation.updateAppointmentZodSchema),
  AppointmentController.updateAppointmentStatus
);

export default router;
