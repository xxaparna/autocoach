import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { connectDB } from "@/lib/db"
import { Goal } from "@/models/Goal"
import { groqClient } from "@/services/groqClient"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const session = getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const message: string = (body?.message || "").toString()
    const history: Array<{ role: "user" | "assistant"; content: string }> = Array.isArray(body?.history)
      ? body.history.map((m: any) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content || "") })).slice(-8)
      : []
    const includeGoals: boolean = body?.includeGoals !== false
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Missing GROQ_API_KEY" }, { status: 500 })
    }

    await connectDB()

    let goalsSummary = ""
    if (includeGoals) {
      const goals = await Goal.find({ userId: session.uid }).select("title status targetDate subtasks").limit(50)
      const lines: string[] = []
      for (const g of goals) {
        const due = g.targetDate ? new Date(g.targetDate).toISOString().slice(0, 10) : ""
        const stDone = Array.isArray(g.subtasks) ? g.subtasks.filter((s: any) => s.done).length : 0
        const stTotal = Array.isArray(g.subtasks) ? g.subtasks.length : 0
        lines.push(`- ${g.title} [${g.status}]${due ? ` (due ${due})` : ""}${stTotal ? ` - subtasks ${stDone}/${stTotal}` : ""}`)
      }
      goalsSummary = lines.length ? `User goals:\n${lines.join("\n")}` : ""
    }

    const system = `You are AutoCoach Study Buddy, a supportive tutoring assistant.
- Answer conversationally in 2-6 concise sentences.
- When relevant, suggest a short plan or next steps.
- If goals context is provided, tailor advice and reference it briefly.
- Prefer green-themed emojis like ✅📘 sparingly.
- If user asks for summary, provide bullet points.
- If user asks "what to study today", infer from upcoming due dates and incomplete items.`

    const context = [goalsSummary].filter(Boolean).join("\n\n")

    const conversationPrefix = context ? `CONTEXT:\n${context}\n\n` : ""
    const convoLines = history
      .map((m) => `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`)
      .concat([`User: ${message}`])
      .join("\n")

    const { text } = await groqClient.generateText({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `${conversationPrefix}${convoLines}\n\nAssistant:` }
      ],
      temperature: 0.4,
      maxTokens: 1024,
    })

    return NextResponse.json({ reply: text })
  } catch (e: any) {
    const msg = e?.message || "Chat failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
