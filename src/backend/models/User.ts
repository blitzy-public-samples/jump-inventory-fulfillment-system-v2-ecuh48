import { Schema, model, Document } from 'mongoose';
import { UserRole } from '../types/UserRole';

// Define the User schema
const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.WAREHOUSE_STAFF },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

// Add virtual method to get full name of user
UserSchema.virtual('fullName').get(function(this: UserDocument) {
  return `${this.firstName} ${this.lastName}`;
});

// Define the User document interface
interface UserDocument extends Document {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  createdAt: Date;
  lastLogin: Date;
  fullName: string;
}

// Create and export the User model
export const User = model<UserDocument>('User', UserSchema);