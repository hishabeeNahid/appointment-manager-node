import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import UserService from '../services/user.service';

const getDoctors = catchAsync(async (req, res) => {
  const { specialization, search, page = 1, limit = 10 } = req.query;

  const result = await UserService.getDoctors(
    specialization as string,
    search as string,
    Number(page),
    Number(limit)
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Doctors retrieved successfully',
    data: result.doctors,
    meta: result.meta,
  });
});

const getPatients = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const result = await UserService.getPatients(Number(page), Number(limit));

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Patients retrieved successfully',
    data: result.patients,
    meta: result.meta,
  });
});

const getSpecializations = catchAsync(async (req, res) => {
  const result = await UserService.getSpecializations();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Specializations retrieved successfully',
    data: result,
  });
});

const UserController = {
  getDoctors,
  getPatients,
  getSpecializations,
};

export default UserController;
