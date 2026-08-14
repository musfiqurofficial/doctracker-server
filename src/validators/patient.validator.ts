import { z } from 'zod';

export const createPatientValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Patient name is required' })
      .min(2, { message: 'Name must be at least 2 characters' }),
    age: z
      .number({ required_error: 'Patient age is required' })
      .min(0, { message: 'Age cannot be negative' })
      .max(120, { message: 'Age cannot exceed 120' }),
    gender: z.enum(['Male', 'Female', 'Other'], {
      required_error: 'Gender is required',
    }),
    condition: z
      .string({ required_error: 'Medical condition is required' })
      .min(2, { message: 'Condition must be specified' }),
    status: z.enum(['stable', 'recovering', 'critical']).optional(),
    doctorId: z
      .string({ required_error: 'Assigned Doctor ID is required' })
      .regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid Doctor ObjectId' }),
    visitDate: z.string().optional(),
  }),
});

export const updatePatientValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    age: z.number().min(0).max(120).optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    condition: z.string().min(2).optional(),
    status: z.enum(['stable', 'recovering', 'critical']).optional(),
    doctorId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid Doctor ObjectId' })
      .optional(),
    visitDate: z.string().optional(),
  }),
});
