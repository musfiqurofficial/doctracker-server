import { Schema, model, Document } from 'mongoose';

export interface IAdmin extends Document {
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        const obj = ret as Record<string, any>;
        delete obj.password;
        return obj;
      },
    },
  }
);

export const Admin = model<IAdmin>('Admin', adminSchema);
