import mongoose, { Document, Schema } from 'mongoose'

export interface IOwnerApiKeys extends Document {
  ownerId: string
  hostkitApiKey: string
  hostkitApiSecret: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const ownerApiKeysSchema = new Schema<IOwnerApiKeys>({
  ownerId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  hostkitApiKey: {
    type: String,
    required: true
  },
  hostkitApiSecret: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Encrypt sensitive data before saving
ownerApiKeysSchema.pre('save', function(next) {
  // In production, you should encrypt these fields
  // For now, we'll store them as-is but add encryption later
  next()
})

export default mongoose.model<IOwnerApiKeys>('OwnerApiKeys', ownerApiKeysSchema)

