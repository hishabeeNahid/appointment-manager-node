import z from 'zod';

const createUserZodSchema = z.object({
  body: z.object({
    phoneNumber: z.string({
      required_error: 'Phone number is required',
    }),
    role: z.enum(['seller', 'buyer'], {
      required_error: 'Role is required',
    }),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(6, {
        message: 'Password Should be at least 6 characters long',
      }),
    name: z.object({
      firstName: z.string({
        required_error: 'First name is required',
      }),
      lastName: z.string({
        required_error: 'Last name is required',
      }),
    }),
    address: z.string({
      required_error: 'Address is required',
    }),
  }),
});

const updateUserZodSchema = z.object({
  body: z.object({
    phoneNumber: z.string().optional(),
    role: z.enum(['seller', 'buyer']).optional(),
    password: z
      .string()
      .min(6, {
        message: 'Password Should be at least 6 characters long',
      })
      .optional(),
    name: z
      .object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
      })
      .optional(),
    address: z.string().optional(),
  }),
});

export const UserValidator = {
  createUserZodSchema,
  updateUserZodSchema,
};
