import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import AppointmentService from "../services/appointment.service";
import ApiError from "../../errors/ApiError";

const createAppointment = catchAsync(async (req, res) => {
  const { doctorId, date } = req.body;
  const patientId = (req as any).user.userId;

  const result = await AppointmentService.createAppointment({
    doctorId,
    patientId,
    date,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Appointment created successfully",
    data: result,
  });
});

const getPatientAppointments = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const patientId = (req as any).user.userId;

  const result = await AppointmentService.getPatientAppointments(
    patientId,
    status as string,
    Number(page),
    Number(limit)
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Patient appointments retrieved successfully",
    data: result.appointments,
    meta: result.meta,
  });
});

const getDoctorAppointments = catchAsync(async (req, res) => {
  const { status, date, page = 1, limit = 10 } = req.query;
  const doctorId = (req as any).user.userId;

  const result = await AppointmentService.getDoctorAppointments(
    doctorId,
    status as string,
    date ? new Date(date as string) : undefined,
    Number(page),
    Number(limit)
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Doctor appointments retrieved successfully",
    data: result.appointments,
    meta: result.meta,
  });
});

const updateAppointmentStatus = catchAsync(async (req, res) => {
  // Safely extract parameters with fallbacks
  const { status, appointment_id } = req.body || {};
  const userId = (req as any).user?.userId;
  const userRole = (req as any).user?.role;
  const id = appointment_id;

  // Validate required parameters
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Appointment ID is required");
  }

  if (!status) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Status is required");
  }

  if (!userId || !userRole) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User authentication required");
  }

  const result = await AppointmentService.updateAppointmentStatus(
    id,
    status,
    userId,
    userRole
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Appointment status updated successfully",
    data: result,
  });
});

const AppointmentController = {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
};

export default AppointmentController;
