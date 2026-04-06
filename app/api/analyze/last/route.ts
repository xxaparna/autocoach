import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { connectDB } from "@/lib/db"
import { JobAnalysis } from "@/models/JobAnalysis"

export const runtime = "nodejs"

export async function GET() {
  const session = getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await connectDB()
  const last = await JobAnalysis.findOne({ userId: session.uid }).sort({ createdAt: -1 })
  return NextResponse.json({ analysis: last })
}
