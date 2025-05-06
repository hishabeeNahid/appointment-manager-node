import { Router } from 'express';
import { verifyToken } from '../middleware/auth';
import Controller from '../controller/controller';
import validateRequest from '../middleware/validateRequest';
import { UserValidator } from '../validations/user.validation';

const router = Router();

router.use(verifyToken);

router.get('/get-todos', Controller.get_todos);
router.post(
  '/create-users',
  validateRequest(UserValidator.createUserZodSchema),
  Controller.create_users
);

export default router;
