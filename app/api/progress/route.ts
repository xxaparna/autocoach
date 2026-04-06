import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { connectDB } from "@/lib/db"
import { Progress } from "@/models/Progress"

export const runtime = "nodejs"

export async function GET() {
  const session = getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await connectDB()
  const items = await Progress.find({ userId: session.uid }).sort({ date: -1, createdAt: -1 }).limit(100)
  return NextResponse.json({ progress: items })
}

export async function POST(req: Request) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await connectDB()
  const body = await req.json()
  const doc = await Progress.create({
    userId: session.uid,
    date: body?.date ? new Date(body.date) : new Date(),
    topic: body?.topic ? String(body.topic).slice(0, 200) : undefined,
    summary: String(body?.summary || "").slice(0, 5000),
    source: body?.source ? String(body.source).slice(0, 50) : undefined,
  })
  return NextResponse.json({ progress: doc }, { status: 201 })
}
