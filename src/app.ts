import express, { Application } from "express";
import cors from "cors";
import httpStatus from "http-status";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import { rateLimit, validateOrigin } from "./app/middleware/authorization";
import authRouter from "./app/router/auth.router";
import userRouter from "./app/router/user.router";
import appointmentRouter from "./app/router/appointment.router";

const app: Application = express();

// Security middleware
app.use(validateOrigin(["*"])); // Allow all origins for now
app.use(rateLimit(100, 15 * 60 * 1000)); // Global rate limiting: 100 requests per 15 minutes

// using cors to allow cross origin resource sharing
app.use(
  cors({
    origin: true, // Allow all origins
    credentials: true, // Allow credentials
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// using express.json() to parse json data from the request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" })); // Limit request body size

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  next();
});

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1/appointments", appointmentRouter);

// using globalErrorHandler middleware to handle all the errors
app.use(globalErrorHandler);

// this is not found middleware which will be executed when a request is made to a route which is not defined
app.use((req, res, next) => {
  res.status(httpStatus.NOT_FOUND).json({
    message: "Not Found",
    statusCode: httpStatus.NOT_FOUND,
    success: false,
    errorMessages: [
      {
        message: "Not Found",
        path: req.originalUrl,
      },
    ],
  });

  next();
});

export default app;
