import { Schema, model, Document, Types } from 'mongoose';

export interface IPatient extends Document {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  condition: string;
  status: 'stable' | 'recovering' | 'critical';
  doctorId: Types.ObjectId;
  visitDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<IPatient>(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Patient age is required'],
      min: [0, 'Age cannot be negative'],
      max: [120, 'Age exceeds maximum limit'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['Male', 'Female', 'Other'],
    },
    condition: {
      type: String,
      required: [true, 'Medical condition is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['stable', 'recovering', 'critical'],
      default: 'stable',
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Assigned Doctor is required'],
    },
    visitDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance optimization (rules.md Section 5)
patientSchema.index({ doctorId: 1 });
patientSchema.index({ name: 'text', condition: 'text' });
patientSchema.index({ condition: 1 });
patientSchema.index({ status: 1 });
patientSchema.index({ visitDate: -1 });

export const Patient = model<IPatient>('Patient', patientSchema);
