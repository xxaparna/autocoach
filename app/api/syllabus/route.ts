import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { connectDB } from "@/lib/db"
import { Syllabus } from "@/models/Syllabus"

export const runtime = "nodejs"

export async function GET() {
  const session = getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await connectDB()
  const doc = await Syllabus.findOne({ userId: session.uid })
  return NextResponse.json({ syllabus: doc })
}

export async function POST(req: Request) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await connectDB()
  const body = await req.json()
  const topics = Array.isArray(body?.topics) ? body.topics.map((t: any) => ({
    title: String(t.title || "").slice(0, 200),
    description: t.description ? String(t.description).slice(0, 1000) : undefined,
    status: ["not_started","in_progress","completed"].includes(t.status) ? t.status : "not_started",
  })) : []
  const doc = await Syllabus.findOneAndUpdate(
    { userId: session.uid },
    { $set: { topics } },
    { upsert: true, new: true }
  )
  return NextResponse.json({ syllabus: doc })
}

export async function PATCH(req: Request) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await connectDB()
  const body = await req.json()
  const { index, topic } = body || {}
  const doc = await Syllabus.findOne({ userId: session.uid })
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (typeof index !== 'number' || index < 0 || index >= doc.topics.length) {
    return NextResponse.json({ error: "Invalid index" }, { status: 400 })
  }
  if (topic && typeof topic === 'object') {
    const t = doc.topics[index]
    t.title = topic.title !== undefined ? String(topic.title).slice(0,200) : t.title
    t.description = topic.description !== undefined ? String(topic.description).slice(0,1000) : t.description
    if (["not_started","in_progress","completed"].includes(topic.status)) t.status = topic.status
  }
  await doc.save()
  return NextResponse.json({ syllabus: doc })
}
