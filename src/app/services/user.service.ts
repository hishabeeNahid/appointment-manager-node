import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

const getDoctors = async (
  specialization?: string,
  search?: string,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;

  const where: any = {
    role: 'DOCTOR',
    ...(specialization && { specialization }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { specialization: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [doctors, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        specialization: true,
        photo_url: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    doctors,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getPatients = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  const [patients, total] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'PATIENT' },
      select: {
        id: true,
        name: true,
        email: true,
        photo_url: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where: { role: 'PATIENT' } }),
  ]);

  return {
    patients,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getSpecializations = async () => {
  const specializations = [
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'Neurology',
    'Oncology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
  ];

  return specializations;
};

const UserService = {
  getDoctors,
  getPatients,
  getSpecializations,
};

export default UserService;
