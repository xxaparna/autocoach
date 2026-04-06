import mongoose from "mongoose"

let isConnected = 0 as 0 | 1

export async function connectDB(uri?: string) {
  const MONGODB_URI = uri || process.env.MONGODB_URI
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add it to your .env.local")
  }
  if (isConnected) return
  if (mongoose.connection.readyState >= 1) {
    isConnected = 1
    return
  }
  await mongoose.connect(MONGODB_URI)
  isConnected = 1
}
