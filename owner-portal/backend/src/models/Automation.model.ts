import mongoose, { Document, Schema } from 'mongoose';

export interface IAutomation extends Document {
  name: string;
  description: string;
  type: string;
  schedule: string;
  config: any;
  status: string;
  userId: string;
  propertyId?: number;
  runCount: number;
  lastRunAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AutomationSchema = new Schema<IAutomation>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['saft_generation', 'siba_alerts', 'calendar_sync']
  },
  schedule: {
    type: String,
    required: true,
    default: '0 9 2 * *' // Default: 2nd of each month at 9 AM
  },
  config: {
    type: Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'paused', 'disabled'],
    default: 'active'
  },
  userId: {
    type: String,
    required: true
  },
  propertyId: {
    type: Number,
    required: false
  },
  runCount: {
    type: Number,
    default: 0
  },
  lastRunAt: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
AutomationSchema.index({ userId: 1 });
AutomationSchema.index({ propertyId: 1 });
AutomationSchema.index({ type: 1 });
AutomationSchema.index({ status: 1 });

export const AutomationModel = mongoose.model<IAutomation>('Automation', AutomationSchema);
