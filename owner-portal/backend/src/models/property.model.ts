import mongoose, { Document, Schema } from "mongoose";

export interface IProperty extends Document {
  id: number;
  name: string;
  address: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  hostkitId: string;
  hostkitApiKey: string;
  status: 'active' | 'inactive' | 'maintenance';
  requiresCommission: boolean;
  images: string[];
  amenities: string[];
  owner: mongoose.Types.ObjectId;
  accountants: mongoose.Types.ObjectId[];
  isAdminOwned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema: Schema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Apartment', 'House', 'Villa', 'Condominium', 'Penthouse', 'Studio'],
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    maxGuests: {
      type: Number,
      required: true,
      min: 1,
    },
    hostkitId: {
      type: String,
      required: true,
      trim: true,
    },
    hostkitApiKey: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active',
    },
    requiresCommission: {
      type: Boolean,
      required: true,
      default: true,
    },
    images: [{
      type: String,
      trim: true,
    }],
    amenities: [{
      type: String,
      trim: true,
    }],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    accountants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    isAdminOwned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProperty>("Property", PropertySchema);