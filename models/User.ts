import mongoose, { Schema, Model, models } from "mongoose"

export interface IUser {
  name?: string
  email: string
  password: string
  createdAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    // Use a Mongo-safe collection name variant of "Signin/login"
    collection: "Signin_login",
  },
)

export const User: Model<IUser> = (models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema)
