import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  uid:       string;   // Firebase UID
  email:     string;
  name:      string;
  phone?:    string;
  company?:  string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    uid:     { type: String, required: true, unique: true },
    email:   { type: String, required: true, unique: true },
    name:    { type: String, required: true },
    phone:   { type: String },
    company: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

UserSchema.index({ email: 1 });

export default mongoose.model<IUser>('User', UserSchema);
