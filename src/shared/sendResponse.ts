import { Response } from 'express';
import { ISendResponse } from '../interface/response';
import httpStatus from 'http-status';

const sendResponse = <T>(
  res: Response,
  {
    statusCode = httpStatus.OK,
    message = 'success',
    success = true,
    data,
    meta,
  }: ISendResponse<T>
) => {
  return res.status(statusCode).json({
    success: success,
    statusCode,
    message,
    data,
    ...meta,
  });
};

export default sendResponse;
