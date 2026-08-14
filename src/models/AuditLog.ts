import { Schema, model, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  action: 'LOGIN' | 'LOGOUT';
  adminId?: Types.ObjectId;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      enum: ['LOGIN', 'LOGOUT'],
      required: true,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    email: {
      type: String,
      trim: true,
    },
    ipAddress: {
      type: String,
      default: 'Unknown IP',
    },
    userAgent: {
      type: String,
      default: 'Unknown Device',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for rapid last-3-days lookup and sorting
auditLogSchema.index({ timestamp: -1 });

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
