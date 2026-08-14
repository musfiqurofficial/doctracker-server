import { z } from 'zod';

export const loginValidationSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email({ message: 'Invalid email address' }),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, { message: 'Password must be at least 6 characters' }),
  }),
});

export const changePasswordValidationSchema = z.object({
  body: z.object({
    currentPassword: z
      .string({ required_error: 'Current password is required' })
      .min(1, { message: 'Current password is required' }),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(6, { message: 'New password must be at least 6 characters' }),
  }),
});

export const updateProfileValidationSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email({ message: 'Invalid email address' })
      .optional(),
  }),
});
