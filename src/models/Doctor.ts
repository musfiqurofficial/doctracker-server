import { Schema, model, Document } from 'mongoose';

export interface IDoctor extends Document {
  name: string;
  email: string;
  phone: string;
  specialty: string;
  department: string;
  qualification?: string;
  experienceYears?: number;
  consultationFee?: number;
  availabilityStatus: 'Available' | 'On Leave' | 'Busy';
  patientsCount?: number;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<IDoctor>(
  {
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    qualification: {
      type: String,
      default: 'MBBS, MD',
      trim: true,
    },
    experienceYears: {
      type: Number,
      default: 5,
      min: 0,
    },
    consultationFee: {
      type: Number,
      default: 500,
      min: 0,
    },
    availabilityStatus: {
      type: String,
      enum: ['Available', 'On Leave', 'Busy'],
      default: 'Available',
    },
    patientsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    bio: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast regex & filter queries per rules.md
doctorSchema.index({ name: 'text', specialty: 'text', department: 'text' });
doctorSchema.index({ name: 1 });
doctorSchema.index({ specialty: 1 });
doctorSchema.index({ department: 1 });
doctorSchema.index({ availabilityStatus: 1 });

export const Doctor = model<IDoctor>('Doctor', doctorSchema);
