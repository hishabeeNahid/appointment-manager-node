import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.join(process.cwd(), '.env'),
});

export const config = {
  port: process.env.PORT || 5050,
  env: process.env.NODE_ENV || 'development',
  db_host: process.env.DB_HOST,
  db_port: Number(process.env.DB_PORT),
  jwt_secret: process.env.JWT_SECRET,
};
