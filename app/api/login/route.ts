import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { User } from "@/models/User"
import bcrypt from "bcryptjs"
import { setSession } from "@/lib/session"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body || {}
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }
    await connectDB()
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 })
    }
    await setSession({ uid: String(user._id), email: user.email })
    return NextResponse.json({ ok: true, user: { id: user._id, email: user.email, name: user.name } })
  } catch (err) {
    console.error("/api/login error", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}