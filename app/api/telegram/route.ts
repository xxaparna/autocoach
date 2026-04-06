import { type NextRequest, NextResponse } from "next/server"

// Demo endpoint: sends a Telegram message using provided token and chatId in the request body.
// In production, store secrets as environment variables.
export async function POST(req: NextRequest) {
  try {
    const { token, chatId, message } = await req.json()
    if (!token || !chatId || !message)
      return NextResponse.json({ error: "token, chatId, message required" }, { status: 400 })
    const url = `https://api.telegram.org/bot${token}/sendMessage`
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
