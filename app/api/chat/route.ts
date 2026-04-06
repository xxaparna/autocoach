import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json()

    const system =
      "You are AutoCoach Doubt Bot: a friendly, focused tutor. Explain step-by-step, provide short examples, " +
      "and suggest practice problems. If asked about code, give language-specific tips and complexity."

    const history = (messages || []).map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")

    const personalization = `Preferences:\n${JSON.stringify(context || {}, null, 2)}\n`

    const prompt = `${system}\n\n${personalization}\nConversation:\n${history}\n\nASSISTANT:`

    const { text } = await generateText({
      model: google("gemini-1.5-pro"),
      temperature: 0.3,
      prompt,
    })

    return NextResponse.json({ text })
  } catch (e) {
    return NextResponse.json({ text: "I couldn’t process that right now. Please try again." })
  }
}
