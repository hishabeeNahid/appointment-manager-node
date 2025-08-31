import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../../config";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bearer_token = req.headers.authorization;

    if (!bearer_token || !bearer_token.startsWith("Bearer ")) {
      return next(
        new ApiError(httpStatus.UNAUTHORIZED, "Access token is required")
      );
    }

    const token = bearer_token.split(" ")[1];
    const jwt_secret = config.jwt_secret;

    if (!token || !jwt_secret) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Please Login First"));
    }

    const decoded = jwt.verify(token, jwt_secret) as any;

    if (!decoded || !decoded.userId || !decoded.email || !decoded.role) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Invalid token"));
    }

    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Token has expired"));
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Invalid token"));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Please Login First"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          httpStatus.FORBIDDEN,
          `Access denied. Required roles: ${roles.join(", ")}. Your role: ${
            req.user.role
          }`
        )
      );
    }

    next();
  };
};

// Middleware to check if user is accessing their own resource
export const authorizeOwnResource = (resourceIdField: string = "id") => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Please Login First"));
    }

    const resourceId = req.params[resourceIdField] || req.body[resourceIdField];

    if (resourceId && resourceId !== req.user.userId) {
      return next(
        new ApiError(
          httpStatus.FORBIDDEN,
          "You can only access your own resources"
        )
      );
    }

    next();
  };
};

// Middleware to check if user is a doctor
export const requireDoctor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Please Login First"));
  }

  if (req.user.role !== "DOCTOR") {
    return next(
      new ApiError(httpStatus.FORBIDDEN, "Access denied. Doctor role required")
    );
  }

  next();
};

// Middleware to check if user is a patient
export const requirePatient = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Please Login First"));
  }

  if (req.user.role !== "PATIENT") {
    return next(
      new ApiError(httpStatus.FORBIDDEN, "Access denied. Patient role required")
    );
  }

  next();
};
