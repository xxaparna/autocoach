import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { connectDB } from "@/lib/db"
import { Message } from "@/models/Message"

export const runtime = "nodejs"

export async function GET() {
  const session = getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await connectDB()
  const msgs = await Message.find({ userId: session.uid }).sort({ createdAt: 1 }).limit(200)
  return NextResponse.json({ messages: msgs })
}
