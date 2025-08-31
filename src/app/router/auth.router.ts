import { Router } from "express";
import AuthController from "../controller/auth.controller";
import validateRequest from "../middleware/validateRequest";
import { AuthValidation } from "../validations/auth.validation";

const router = Router();

router.post(
  "/register/patient",
  validateRequest(AuthValidation.createUserZodSchema),
  AuthController.registerPatient
);

router.post(
  "/register/doctor",
  validateRequest(AuthValidation.createDoctorZodSchema),
  AuthController.registerDoctor
);

router.post(
  "/login",
  validateRequest(AuthValidation.loginZodSchema),
  AuthController.login
);

export default router;
