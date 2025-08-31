import { Router } from "express";
import UserController from "../controller/user.controller";
import { verifyToken, authorize } from "../middleware/auth";

const router = Router();

router.get("/doctors", UserController.getDoctors);
router.get(
  "/patients",
  verifyToken,
  authorize("DOCTOR"),
  UserController.getPatients
);
router.get("/specializations", UserController.getSpecializations);

export default router;
