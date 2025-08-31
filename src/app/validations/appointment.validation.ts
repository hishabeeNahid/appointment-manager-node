import { z } from "zod";

const createAppointmentZodSchema = z.object({
  body: z.object({
    doctorId: z.string({
      required_error: "Doctor ID is required",
    }),
    date: z
      .string({
        required_error: "Date is required",
      })
      .refine(
        (str) => {
          const date = new Date(str);
          return !isNaN(date.getTime());
        },
        {
          message: "Invalid date format. Please provide a valid date.",
        }
      )
      .transform((str) => new Date(str)),
  }),
});

const updateAppointmentZodSchema = z.object({
  body: z.object({
    status: z.enum(["PENDING", "CANCELLED", "COMPLETED"], {
      required_error: "Status is required",
    }),
    appointment_id: z.string({
      required_error: "Appointment ID is required",
    }),
  }),
});

export const AppointmentValidation = {
  createAppointmentZodSchema,
  updateAppointmentZodSchema,
};
