import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { connectDB } from "@/lib/db"
import { Goal } from "@/models/Goal"
import { groqClient } from "@/services/groqClient"

export async function POST(req: Request) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY is not set" }, { status: 500 })
  }

  try {
    const body = await req.json()
    const { prompt } = body || {}
    await connectDB()
    const existing = await Goal.find({ userId: session.uid }).select("title description status targetDate").limit(10)

    const system = `You generate SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound) for study or career.
Return ONLY a JSON array (no explanation) of 1-3 goals with this exact shape:
[
  {
    "title": "Goal title",
    "description": "Detailed description",
    "targetDate": "YYYY-MM-DD"
  }
]`

    const user = `User context: ${prompt || ""}\nExisting goals: ${JSON.stringify(existing)}`

    const { text: raw } = await groqClient.generateText({
      system,
      messages: [
        { role: 'user', content: user }
      ],
      temperature: 0.3,
      maxTokens: 1024,
    })

    let parsed: any = null
    try {
      if (raw.startsWith("[") || raw.startsWith("{")) {
        parsed = JSON.parse(raw)
      } else {
        const fence = raw.match(/```(?:json)?\n([\s\S]*?)```/i)
        if (fence?.[1]) parsed = JSON.parse(fence[1])
        else {
          const arr = raw.match(/\[[\s\S]*\]/)
          parsed = arr ? JSON.parse(arr[0]) : null
        }
      }
    } catch {
      parsed = null
    }

    let suggestions: any[] = []
    if (Array.isArray(parsed)) suggestions = parsed
    else if (parsed && Array.isArray(parsed.goals)) suggestions = parsed.goals
    else if (parsed && typeof parsed === "object" && parsed.title) suggestions = [parsed]

    // validate and normalize
    suggestions = (suggestions || [])
      .filter((g) => g && typeof g.title === "string")
      .map((g) => ({
        title: String(g.title).slice(0, 120),
        description: g.description ? String(g.description).slice(0, 1000) : "",
        targetDate: g.targetDate ? String(g.targetDate) : "",
      }))

    // No second retry; we already tried fallback model above

    return NextResponse.json({ suggestions })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to generate suggestions"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
