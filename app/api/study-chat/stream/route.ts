import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { connectDB } from "@/lib/db"
import { Goal } from "@/models/Goal"
import { Syllabus } from "@/models/Syllabus"
import { Progress } from "@/models/Progress"
import { Message } from "@/models/Message"
import { groqClient } from "@/services/groqClient"

type MessageRole = 'user' | 'assistant' | 'system';

export const runtime = "nodejs"

export async function POST(req: Request) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "Missing GROQ_API_KEY" }, { status: 500 })
  }

  try {
    const body = await req.json()
    const message: string = (body?.message || "").toString()
    const history: Array<{ role: MessageRole; content: string }> = Array.isArray(body?.history)
      ? body.history.map((m: any) => ({
          role: (m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user') as MessageRole,
          content: String(m.content || '')
        })).slice(-12)
      : []
    const includeGoals: boolean = body?.includeGoals !== false

    await connectDB()

    // Build context from goals, syllabus, progress
    let ctxParts: string[] = []
    if (includeGoals) {
      const goals = await Goal.find({ userId: session.uid }).select("title status targetDate subtasks").limit(50)
      if (goals.length) {
        const lines = goals.map((g: any) => {
          const due = g.targetDate ? new Date(g.targetDate).toISOString().slice(0,10) : ""
          const stDone = Array.isArray(g.subtasks) ? g.subtasks.filter((s: any) => s.done).length : 0
          const stTotal = Array.isArray(g.subtasks) ? g.subtasks.length : 0
          return `- ${g.title} [${g.status}]${due?` (due ${due})`:''}${stTotal?` - subtasks ${stDone}/${stTotal}`:''}`
        })
        ctxParts.push(`Goals:\n${lines.join("\n")}`)
      }
    }
    const syllabus = await Syllabus.findOne({ userId: session.uid })
    if (syllabus?.topics?.length) {
      const lines = syllabus.topics.slice(0, 50).map((t: any, i: number) => `- ${t.title} [${t.status||'not_started'}]`)
      ctxParts.push(`Syllabus topics:\n${lines.join("\n")}`)
    }
    const recent = await Progress.find({ userId: session.uid }).sort({ date: -1, createdAt: -1 }).limit(10)
    if (recent.length) {
      const lines = recent.map((p: any) => `- ${p.topic || "(untitled)"}: ${String(p.summary).slice(0,120)}...`)
      ctxParts.push(`Recent study summaries:\n${lines.join("\n")}`)
    }
    const context = ctxParts.length ? `CONTEXT:\n${ctxParts.join("\n\n")}` : ""

    const system = `You are AutoCoach Study Buddy, a supportive tutoring assistant.
- Keep replies concise (2-6 sentences) unless user asks for detail.
- Use provided context (goals, syllabus, progress) to personalize suggestions.
- If asked 'what to study today', prioritize imminent deadlines and incomplete items.
- Offer next steps and short plans.
- Maintain a professional, friendly tone.`

    const convo = history.map(m => `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`).join("\n")
    const prompt = `${system}\n\n${context ? context + "\n\n" : ""}${convo}\nUser: ${message}\n\nAssistant:`

    // Persist incoming user message
    await Message.create({ userId: session.uid, role: 'user', content: message })

    // Create messages array with proper typing
    const messages: { role: MessageRole; content: string }[] = [
      { role: 'system' as const, content: system }
    ];
    
    if (context) {
      messages.push({ role: 'system' as const, content: context });
    }
    
    messages.push(
      ...history,
      { role: 'user' as const, content: message }
    );

    // Get the streaming response
    const response = await groqClient.streamText({
      messages,
      temperature: 0.4,
      maxTokens: 1024,
      model: 'llama-3.3-70b-versatile' // Using the latest supported model
    });
    
    if (!response || !response.stream) {
      throw new Error('Failed to get streaming response from Groq');
    }
    
    const { stream } = response;

    // Create a transform stream to capture the full response
    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()
    const encoder = new TextEncoder()
    
    // Start processing the stream
    ;(async () => {
      let fullResponse = ''
      try {
        // Handle the stream from Groq
        for await (const chunk of stream as AsyncIterable<{ choices: Array<{ delta: { content?: string } }> }>) {
          const content = chunk.choices[0]?.delta?.content || ''
          if (content) {
            fullResponse += content
            await writer.write(encoder.encode(content))
          }
        }
        
        // Persist the assistant's full response
        if (fullResponse.trim()) {
          await Message.create({ 
            userId: session.uid, 
            role: 'assistant' as const, 
            content: fullResponse.trim() 
          })
        }
      } catch (e) {
        console.error('Stream error:', e)
        await writer.write(encoder.encode('\n[Error: Failed to process response]'))
      } finally {
        try {
          await writer.close()
        } catch (e) {
          console.error('Error closing writer:', e)
        }
      }
    })()

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Content-Encoding': 'none',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Stream failed' }, { status: 500 })
  }
}
