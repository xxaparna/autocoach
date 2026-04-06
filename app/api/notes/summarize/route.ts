import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { connectDB } from "@/lib/db"
import { Progress } from "@/models/Progress"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || ""
  if (!apiKey) return NextResponse.json({ error: "Missing GOOGLE_GENERATIVE_AI_API_KEY (or GEMINI_API_KEY)" }, { status: 500 })

  try {
    const body = await req.json()
    const text: string = String(body?.text || "")
    const topic: string | undefined = body?.topic ? String(body.topic).slice(0, 200) : undefined
    if (!text.trim()) return NextResponse.json({ error: "Text is required" }, { status: 400 })

    const prompt = `Summarize the following study notes succinctly.
- Provide 4-7 bullet points.
- Keep each bullet short (max ~20 words).
- Include key formulas or definitions if any.
- End with a single actionable next step.

NOTES:\n${text}`

    const google = createGoogleGenerativeAI({ apiKey })
    const modelId = process.env.GOOGLE_GENAI_MODEL || "gemini-2.0-flash"

    const { text: out } = await generateText({ model: google(modelId), prompt, temperature: 0.2, maxOutputTokens: 400 })
    const summary = (out || "").trim()

    await connectDB()
    const doc = await Progress.create({ userId: session.uid, topic, summary, source: "note" })

    return NextResponse.json({ summary, progress: doc }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Summarization failed" }, { status: 500 })
  }
}
