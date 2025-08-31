import * as bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import prisma from "../../shared/db";

const createUser = async (userData: {
  name: string;
  email: string;
  password: string;
  role: "DOCTOR" | "PATIENT";
  photo_url?: string;
  specialization?: string;
}) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      photo_url: true,
      specialization: true,
      createdAt: true,
    },
  });

  return user;
};

const loginUser = async (email: string, password: string) => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || "default-secret",
    { expiresIn: "7d" }
  );

  // Return user data without password
  const userWithoutPassword = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    photo_url: user.photo_url,
    specialization: user.specialization,
  };

  return {
    user: userWithoutPassword,
    token,
  };
};

const AuthService = {
  createUser,
  loginUser,
};

export default AuthService;
