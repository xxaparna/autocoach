import { NextResponse, type NextRequest } from "next/server"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const headerKey = request.headers.get("x-ggai-key") || request.headers.get("x-api-key")
    const apiKey = (headerKey && headerKey.trim()) || process.env.GOOGLE_GENERATIVE_AI_API_KEY || ""
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GOOGLE_GENERATIVE_AI_API_KEY (set header x-ggai-key or .env.local)" }, { status: 401 })
    }

    const q = new URL(request.url).searchParams.get("q") || "Respond with a JSON: {\"ok\": true, \"model\": \"gemini-2.5-flash\"}"

    const googleProvider = createGoogleGenerativeAI({ apiKey })
    const { text } = await generateText({
      model: googleProvider("gemini-2.5-flash"),
      prompt: q,
      temperature: 0,
    })

    try {
      const parsed = JSON.parse(text)
      return NextResponse.json({ ok: true, parsed, raw: text })
    } catch {
      return NextResponse.json({ ok: true, raw: text })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Gemini test failed" }, { status: 502 })
  }
}
