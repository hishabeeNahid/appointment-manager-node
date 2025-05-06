import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // verify token logic

  const bearer_token = req.headers.authorization;
  const token = bearer_token?.split(' ')[1];
  const jwt_secret = config.jwt_secret;

  if (!token || !jwt_secret) {
    return res.status(401).json({
      message: 'Please Login First',
      status: 401,
    });
  }

  try {
    const decoded = jwt.verify(token, jwt_secret);

    if (!decoded) {
      return res.status(401).json({
        message: 'Unauthorized',
        status: 401,
      });
    }

    const user_id = decoded['sub'];
    req.userId = user_id as string;

    next();
  } catch (error) {
    console.log({ error });

    return res.status(401).json({
      message: 'Unauthorized',
    });
  }
};
