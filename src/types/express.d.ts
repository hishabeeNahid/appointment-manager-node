// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import { Request } from 'express';

declare module 'express-serve-static-core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Request {
    userId?: string;
    user?: {
      userId: string;
      email: string;
      role: string;
    };
  }
}
