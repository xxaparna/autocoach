import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { connectDB } from "@/lib/db"
import { User } from "@/models/User"

export async function GET() {
  try {
    const session = getSession()
    if (!session) return NextResponse.json({ user: null }, { status: 200 })

    await connectDB()
    const user = await User.findById(session.uid).select("name email")
    if (!user) return NextResponse.json({ user: null }, { status: 200 })

    return NextResponse.json({ user: { id: String(user._id), name: user.name || "", email: user.email } })
  } catch (e) {
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
