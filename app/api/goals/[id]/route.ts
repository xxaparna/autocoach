import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { connectDB } from "@/lib/db"
import { Goal } from "@/models/Goal"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = params
  try {
    const body = await req.json()
    const { title, description, targetDate, status, subtasks } = body || {}
    await connectDB()
    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId: session.uid },
      {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(targetDate !== undefined ? { targetDate: targetDate ? new Date(targetDate) : undefined } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(Array.isArray(subtasks)
          ? { subtasks: subtasks.map((s: any) => ({ title: String(s.title || "").slice(0, 200), done: !!s.done })) }
          : {}),
      },
      { new: true },
    )
    if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ goal })
  } catch (e) {
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = params
  try {
    await connectDB()
    const res = await Goal.deleteOne({ _id: id, userId: session.uid })
    if (res.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 })
  }
}
