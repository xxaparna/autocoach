import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { connectDB } from "@/lib/db"
import { Goal } from "@/models/Goal"

export async function GET(req: Request) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await connectDB()

  const url = new URL(req.url)
  const status = url.searchParams.get("status")
  const from = url.searchParams.get("from")
  const to = url.searchParams.get("to")
  const sort = url.searchParams.get("sort") || "createdAt"
  const order = url.searchParams.get("order") === "asc" ? 1 : -1

  const filter: any = { userId: session.uid }
  if (status && ["not_started", "in_progress", "completed"].includes(status)) {
    filter.status = status
  }
  if (from || to) {
    filter.targetDate = {}
    if (from) filter.targetDate.$gte = new Date(from)
    if (to) filter.targetDate.$lte = new Date(to)
  }

  const sortBy: Record<string, 1 | -1> = { [sort]: order as 1 | -1 }
  const goals = await Goal.find(filter).sort(sortBy)
  return NextResponse.json({ goals })
}

export async function POST(req: Request) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await req.json()
    const { title, description = "", targetDate, status = "not_started", subtasks } = body || {}
    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 })
    await connectDB()
    const goal = await Goal.create({
      userId: session.uid,
      title,
      description,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      status,
      ...(Array.isArray(subtasks) ? { subtasks: subtasks.map((s: any) => ({ title: String(s.title || "").slice(0, 200), done: !!s.done })) } : {}),
    })
    return NextResponse.json({ goal }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 })
  }
}
