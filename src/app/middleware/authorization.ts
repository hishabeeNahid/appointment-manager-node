import { NextFunction, Request, Response } from "express";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

// Rate limiting middleware
export const rateLimit = (
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000
) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || "unknown";
    const now = Date.now();

    const userRequests = requests.get(ip);

    if (!userRequests || now > userRequests.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
    } else {
      userRequests.count++;

      if (userRequests.count > maxRequests) {
        return next(
          new ApiError(
            httpStatus.TOO_MANY_REQUESTS,
            "Too many requests from this IP, please try again later"
          )
        );
      }
    }

    next();
  };
};

// Check if user is accessing their own appointment
export const authorizeOwnAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Please Login First"));
  }

  const appointmentId = req.params?.id;

  if (!appointmentId) {
    return next(
      new ApiError(httpStatus.BAD_REQUEST, "Appointment ID is required")
    );
  }

  // Import prisma here to avoid circular dependencies
  const { PrismaClient } = await import("../../../generated/prisma");
  const prisma = new PrismaClient();

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { doctorId: true, patientId: true },
    });

    if (!appointment) {
      return next(new ApiError(httpStatus.NOT_FOUND, "Appointment not found"));
    }

    // Check if user is the doctor or patient of this appointment
    if (
      req.user.role === "DOCTOR" &&
      appointment.doctorId !== req.user.userId
    ) {
      return next(
        new ApiError(
          httpStatus.FORBIDDEN,
          "You can only access your own appointments"
        )
      );
    }

    if (
      req.user.role === "PATIENT" &&
      appointment.patientId !== req.user.userId
    ) {
      return next(
        new ApiError(
          httpStatus.FORBIDDEN,
          "You can only access your own appointments"
        )
      );
    }

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(
      new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Error checking appointment access"
      )
    );
  } finally {
    await prisma.$disconnect();
  }
};

// Check if user is accessing their own profile
export const authorizeOwnProfile = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Please Login First"));
  }

  const profileId = req.params?.id || req.params?.userId;

  if (profileId && profileId !== req.user.userId) {
    return next(
      new ApiError(httpStatus.FORBIDDEN, "You can only access your own profile")
    );
  }

  next();
};

// Admin-only middleware (for future use)
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Please Login First"));
  }

  if (req.user.role !== "ADMIN") {
    return next(
      new ApiError(httpStatus.FORBIDDEN, "Access denied. Admin role required")
    );
  }

  next();
};

// Optional authentication middleware
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bearer_token = req.headers.authorization;

  if (!bearer_token || !bearer_token.startsWith("Bearer ")) {
    // No token provided, continue without authentication
    return next();
  }

  try {
    const { verifyToken } = await import("./auth");
    await verifyToken(req, res, next);
  } catch (error) {
    // Token is invalid, but we don't throw error for optional auth
    return next();
  }
};

// Check if user has active session
export const checkActiveSession = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Please Login First"));
  }

  // You can add additional session checks here
  // For example, check if user account is still active
  // or if user has been blocked

  next();
};

// Validate request origin (basic CORS check)
export const validateOrigin = (allowedOrigins: string[] = ["*"]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;

    if (allowedOrigins.includes("*") || !origin) {
      return next();
    }

    if (!allowedOrigins.includes(origin)) {
      return next(new ApiError(httpStatus.FORBIDDEN, "Origin not allowed"));
    }

    next();
  };
};
