import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  reviewId: string;
  propertyId: number;
  bookingId: string;
  guestName: string;
  rating: number; // 1-5 stars
  reviewText: string;
  reviewDate: Date;
  platform: string; // Airbnb, Booking.com, etc.
  responseText?: string;
  responseDate?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    reviewId: { type: String, required: true, unique: true },
    propertyId: { type: Number, required: true },
    bookingId: { type: String, required: true },
    guestName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, required: true },
    reviewDate: { type: Date, required: true },
    platform: { type: String, required: true },
    responseText: { type: String },
    responseDate: { type: Date },
    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const ReviewModel = mongoose.model<IReview>("Review", reviewSchema);





