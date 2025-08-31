import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import AuthService from '../services/auth.service';

const registerPatient = catchAsync(async (req, res) => {
  const result = await AuthService.createUser({
    ...req.body,
    role: 'PATIENT',
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Patient registered successfully',
    data: result,
  });
});

const registerDoctor = catchAsync(async (req, res) => {
  if (!req.body.specialization) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Specialization is required for doctors',
    });
  }

  const result = await AuthService.createUser({
    ...req.body,
    role: 'DOCTOR',
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Doctor registered successfully',
    data: result,
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await AuthService.loginUser(email, password);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User logged in successfully',
    data: result,
  });
});

const AuthController = {
  registerPatient,
  registerDoctor,
  login,
};

export default AuthController;
