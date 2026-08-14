import { z } from 'zod';

export const createDoctorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(6, 'Phone number must be at least 6 characters'),
  specialty: z.string().min(2, 'Specialty is required'),
  department: z.string().min(2, 'Department is required'),
  qualification: z.string().optional(),
  experienceYears: z.number().min(0).optional(),
  consultationFee: z.number().min(0).optional(),
  availabilityStatus: z.enum(['Available', 'On Leave', 'Busy']).optional(),
  bio: z.string().optional(),
});

export const updateDoctorSchema = createDoctorSchema.partial();

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
