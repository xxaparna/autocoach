import mongoose from "mongoose"

let isConnected = 0 as 0 | 1

export async function connectDB(uri?: string) {
  const MONGODB_URI = uri || process.env.MONGODB_URI

  // 🔍 DEBUG: Check if env is loaded
  console.log(" ENV CHECK (MONGODB_URI):", MONGODB_URI ? "FOUND" : "NOT FOUND")

  if (!MONGODB_URI) {
    throw new Error(" MONGODB_URI is not set. Check your .env.local file")
  }

  
  if (isConnected) {
    console.log(" Using existing DB connection")
    return
  }

  // 🔄 Check mongoose state
  if (mongoose.connection.readyState >= 1) {
    isConnected = 1
    console.log(" Already connected (mongoose state)")
    return
  }

  try {
    console.log("⏳ Connecting to MongoDB...")

    await mongoose.connect(MONGODB_URI, {
      dbName: "autocoach", //  IMPORTANT: ensures correct DB
    })

    isConnected = 1

    console.log(" MongoDB Connected Successfully")
  } catch (error: any) {
    console.error(" MongoDB Connection Failed:", error.message)
    throw error
  }
}