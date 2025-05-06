import httpStatus from 'http-status';
import { ErrorRequestHandler } from 'express';
import { IGenericErrorMessage } from '../../interface/error';
import { config } from '../../config';
import ApiError from '../../errors/ApiError';
import { ZodError } from 'zod';
import handleZodValidationError from '../../errors/handleZodValidationError';

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = 'Something went wrong';
  let errorMessages: IGenericErrorMessage[] = [];

  // handle zod validation error
  if (error instanceof ZodError) {
    const simplifiedError = handleZodValidationError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  }

  // handle ApiError which is a custom error class
  else if (error instanceof ApiError) {
    statusCode = error?.statusCode;
    message = error?.message;
    errorMessages = error?.message
      ? [{ message: error.message, path: '' }]
      : [];
  }

  // handle Error class this is default express error class
  else if (error instanceof Error) {
    message = error?.message;
    // message = error
    errorMessages = error?.message
      ? [{ message: error.message, path: '' }]
      : [];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack: config.env === 'development' ? error.stack : undefined,
  });
};

export default globalErrorHandler;
