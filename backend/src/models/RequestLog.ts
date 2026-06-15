import mongoose, { Schema, Document } from 'mongoose';

export interface IRequestLog extends Document {
  ip: string;
  url: string;
  placeId?: string;
  source: 'cache' | 'api';
  success: boolean;
  errorMessage?: string;
  createdAt: Date;
}

const RequestLogSchema = new Schema<IRequestLog>(
  {
    ip: { type: String, required: true, index: true },
    url: { type: String, required: true },
    placeId: { type: String },
    source: { type: String, enum: ['cache', 'api'], required: true },
    success: { type: Boolean, required: true },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

// Auto-delete logs older than 30 days
RequestLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export const RequestLog = mongoose.model<IRequestLog>('RequestLog', RequestLogSchema);
