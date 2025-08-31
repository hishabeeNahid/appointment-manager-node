import { AppointmentStatus } from "@prisma/client";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import prisma from "../../shared/db";

const createAppointment = async (appointmentData: {
  doctorId: string;
  patientId: string;
  date: Date;
}) => {
  // Check if doctor exists
  const doctor = await prisma.user.findUnique({
    where: { id: appointmentData.doctorId, role: "DOCTOR" },
  });

  if (!doctor) {
    throw new ApiError(httpStatus.NOT_FOUND, "Doctor not found");
  }

  // Check if patient exists
  const patient = await prisma.user.findUnique({
    where: { id: appointmentData.patientId, role: "PATIENT" },
  });

  if (!patient) {
    throw new ApiError(httpStatus.NOT_FOUND, "Patient not found");
  }

  // Validate appointment date format (should already be validated by Zod)
  if (isNaN(appointmentData.date.getTime())) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format");
  }

  // Check if doctor is available on that date
  // For simple date strings like "2025-08-31", we'll check the entire day
  const startOfDay = new Date(appointmentData.date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(appointmentData.date);
  endOfDay.setHours(23, 59, 59, 999);

  const conflictingAppointment = await prisma.appointment.findFirst({
    where: {
      doctorId: appointmentData.doctorId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        in: ["PENDING", "COMPLETED"],
      },
    },
  });

  if (conflictingAppointment) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "Doctor is not available at this time"
    );
  }

  const appointment = await prisma.appointment.create({
    data: appointmentData,
    include: {
      doctor: {
        select: {
          id: true,
          name: true,
          email: true,
          specialization: true,
          photo_url: true,
        },
      },
      patient: {
        select: {
          id: true,
          name: true,
          email: true,
          photo_url: true,
        },
      },
    },
  });

  return appointment;
};

const getPatientAppointments = async (
  patientId: string,
  status?: string,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;

  // Validate status if provided
  if (status && !["PENDING", "CANCELLED", "COMPLETED"].includes(status)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid status. Must be one of: PENDING, CANCELLED, COMPLETED`
    );
  }

  const where = {
    patientId,
    ...(status && { status: status as AppointmentStatus }),
  };

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            specialization: true,
            photo_url: true,
          },
        },
      },
      orderBy: { date: "asc" },
      skip,
      take: limit,
    }),
    prisma.appointment.count({ where }),
  ]);

  return {
    appointments,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getDoctorAppointments = async (
  doctorId: string,
  status?: string,
  date?: Date,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;

  // Validate status if provided
  if (status && !["PENDING", "CANCELLED", "COMPLETED"].includes(status)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid status. Must be one of: PENDING, CANCELLED, COMPLETED`
    );
  }

  const where: any = {
    doctorId,
    ...(status && { status: status as AppointmentStatus }),
  };

  if (date) {
    // Ensure date is a proper Date object
    const searchDate = new Date(date);
    if (isNaN(searchDate.getTime())) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format");
    }

    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);
    where.date = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            photo_url: true,
          },
        },
      },
      orderBy: { date: "asc" },
      skip,
      take: limit,
    }),
    prisma.appointment.count({ where }),
  ]);

  return {
    appointments,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const updateAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus,
  userId: string,
  userRole: string
) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      doctor: true,
      patient: true,
    },
  });

  if (!appointment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Appointment not found");
  }

  // Check if user has permission to update this appointment
  if (userRole === "PATIENT" && appointment.patientId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You can only update your own appointments"
    );
  }

  if (userRole === "DOCTOR" && appointment.doctorId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You can only update your own appointments"
    );
  }

  const updatedAppointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
    include: {
      doctor: {
        select: {
          id: true,
          name: true,
          email: true,
          specialization: true,
          photo_url: true,
        },
      },
      patient: {
        select: {
          id: true,
          name: true,
          email: true,
          photo_url: true,
        },
      },
    },
  });

  return updatedAppointment;
};

const AppointmentService = {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
};

export default AppointmentService;
