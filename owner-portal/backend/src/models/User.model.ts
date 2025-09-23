import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "admin" | "owner" | "accountant" | "user";

export interface ICompany {
  name: string;
  nif: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  companies?: ICompany[];
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>({
  name: { type: String, required: true },
  nif: { type: String, required: true }
}, { _id: false });

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "owner", "accountant", "user"], default: "user" },
    isVerified: { type: Boolean, default: false },
    companies: [companySchema],
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>("User", userSchema);
