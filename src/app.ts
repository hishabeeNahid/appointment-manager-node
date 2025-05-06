import express, { Application } from 'express';
import cors from 'cors';
import httpStatus from 'http-status';
import globalErrorHandler from './app/middleware/globalErrorHandler';

const app: Application = express();

// using cors to allow cross origin resource sharing
app.use(cors());

// using express.json() to parse json data from the request body

// using express.urlencoded() to parse urlencoded data from the request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// using the user router
// app.use('/api/v1/admin', adminRouter);

// using globalErrorHandler middleware to handle all the errors
app.use(globalErrorHandler);

// this is not found middleware which will be executed when a request is made to a route which is not defined
app.use((req, res, next) => {
  res.status(httpStatus.NOT_FOUND).json({
    message: 'Not Found',
    statusCode: httpStatus.NOT_FOUND,
    success: false,
    errorMessages: [
      {
        message: 'Not Found',
        path: req.originalUrl,
      },
    ],
  });

  next();
});

export default app;
