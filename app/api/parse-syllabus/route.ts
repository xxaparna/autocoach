import { NextResponse, type NextRequest } from "next/server"
import { groqClient } from "@/services/groqClient"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { text: string }
    const text = (body?.text || "").toString()
    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: "Provide syllabus text" }, { status: 400 })
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Missing GROQ_API_KEY in environment" }, { status: 401 })
    }

    // Truncate extremely large inputs to keep under token limits
    const maxChars = 120_000
    const clipped = text.length > maxChars ? text.slice(0, maxChars) : text

    const prompt = `You are an academic planner assistant. Extract a clean list of syllabus items from the text below.
Return ONLY valid JSON array where each item is: {"subject": string, "topic": string, "hours": number}.
If hours are not given, infer a small integer (1-3) realistically.

Syllabus text:\n${clipped}`

    let resp
    try {
      resp = await groqClient.generateText({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        maxTokens: 2000,
        prompt,
      })
    } catch (e: any) {
      console.error('Groq API error in syllabus parsing:', e);
      return NextResponse.json({ 
        error: `Groq API request failed: ${e.message}`,
        details: e.message
      }, { status: 502 });
    }

    let parsed
    try {
      parsed = JSON.parse(resp.text)
    } catch {
      const match = resp.text.match(/\[[\s\S]*\]/)
      if (!match) return NextResponse.json({ error: "AI did not return JSON", raw: resp.text }, { status: 502 })
      try {
        parsed = JSON.parse(match[0])
      } catch {
        return NextResponse.json({ error: "Failed to parse AI JSON", raw: resp.text }, { status: 502 })
      }
    }

    if (!Array.isArray(parsed)) return NextResponse.json({ error: "Unexpected AI output" }, { status: 502 })

    // Quick shape validation
    const cleaned = parsed
      .map((it: any) => ({
        subject: String(it?.subject || "").trim(),
        topic: String(it?.topic || "").trim(),
        hours: Number(it?.hours) > 0 ? Number(it?.hours) : 1,
      }))
      .filter((x: any) => x.subject && x.topic)

    if (!cleaned.length) return NextResponse.json({ error: "No items extracted" }, { status: 422 })

    return NextResponse.json({ items: cleaned })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to parse syllabus" }, { status: 500 })
  }
}
