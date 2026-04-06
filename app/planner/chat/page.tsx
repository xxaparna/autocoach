"use client"

import { useEffect, useRef, useState } from "react"
import { AppNavbar } from "@/components/app-navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Sparkles, Send, Bot, User, FileText, Loader2 } from "lucide-react"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export default function StudyChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I’m your Study Buddy. Ask me anything — try: ‘What should I study today?’ or ‘Summarize my last topic.’",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [notes, setNotes] = useState("")
  const [summarizing, setSummarizing] = useState(false)
  const [progress, setProgress] = useState<Array<{ _id: string; date: string; topic?: string; summary: string }>>([])
  const [extractingPdf, setExtractingPdf] = useState(false)

  useEffect(() => {
    // auto-scroll to bottom on new message
    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, loading])

  // Load chat history and recent progress
  useEffect(() => {
    const load = async () => {
      try {
        const [mres, pres] = await Promise.all([
          fetch("/api/messages", { cache: "no-store" }),
          fetch("/api/progress", { cache: "no-store" }),
        ])
        if (mres.ok) {
          const mj = await mres.json()
          const hist = (mj?.messages || []).map((m: any) => ({ role: m.role, content: m.content }))
          if (hist.length) setMessages(hist)
        }
        if (pres.ok) {
          const pj = await pres.json()
          setProgress(pj?.progress || [])
        }
      } catch {
        // ignore
      }
    }
    load()
  }, [])

  const send = async () => {
    const text = input.trim()
    if (!text) return
    setInput("")
    const next = [...messages, { role: "user" as const, content: text }]
    setMessages(next)
    setLoading(true)
    try {
      const res = await fetch("/api/study-chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: next }),
      })
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}))
        toast.error(data?.error || "Chat failed")
        setLoading(false)
        return
      }
      // Stream reader
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let partial = ""
      setMessages((m) => [...m, { role: "assistant", content: "" }])
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        partial += decoder.decode(value, { stream: true })
        setMessages((m) => {
          const clone = m.slice()
          clone[clone.length - 1] = { role: "assistant", content: partial }
          return clone
        })
      }
    } catch (e) {
      toast.error("Network error")
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const summarizeNotes = async () => {
    const text = notes.trim()
    if (!text) return
    setSummarizing(true)
    try {
      const res = await fetch("/api/notes/summarize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data?.error || "Summarization failed")
        return
      }
      toast.success("Summary saved to Progress")
      setNotes("")
      // refresh progress
      const pres = await fetch("/api/progress", { cache: "no-store" })
      if (pres.ok) {
        const pj = await pres.json()
        setProgress(pj?.progress || [])
      }
    } catch {
      toast.error("Network error")
    } finally {
      setSummarizing(false)
    }
  }

  // PDF upload and extraction (client-side via pdf.js)
  const loadPdfJs = async () => {
    if (typeof window === "undefined") return null
    const w = window as any
    if (w.pdfjsLib) return w.pdfjsLib
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script")
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Failed to load pdf.js"))
      document.head.appendChild(script)
    })
    const pdfjs = (window as any).pdfjsLib
    if (pdfjs && pdfjs.GlobalWorkerOptions) {
      pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
    }
    return pdfjs
  }

  const onPdfSelected = async (file: File | null) => {
    if (!file) return
    if (!(file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"))) {
      toast.error("Please choose a PDF file")
      return
    }
    try {
      setExtractingPdf(true)
      const pdfjs = await loadPdfJs()
      const ab = await file.arrayBuffer()
      const doc = await (pdfjs as any).getDocument({ data: ab }).promise
      let text = ""
      const numPages = doc.numPages || 0
      for (let i = 1; i <= numPages; i++) {
        const page = await doc.getPage(i)
        const content = await page.getTextContent()
        const strings = (content.items || []).map((it: any) => it.str || "")
        text += strings.join(" ") + "\n"
      }
      text = text.trim()
      if (!text) {
        toast.error("Could not extract text. Please copy-paste manually.")
        return
      }
      setNotes(text)
      toast.success("PDF text extracted. You can edit or Summarize & Save.")
    } catch (e) {
      toast.error("Failed to extract PDF")
    } finally {
      setExtractingPdf(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 text-teal-700 px-3 py-1 text-xs">
              <Sparkles className="w-3.5 h-3.5" /> Study Buddy Chat
            </div>
          </div>

          <Card className="border bg-white">
            <CardContent className="p-0">
              <div ref={viewportRef} className="h-[60vh] md:h-[68vh] overflow-y-auto p-4 space-y-3">
                {messages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm border ${m.role === "user" ? "bg-teal-600 text-white border-teal-600" : "bg-white text-foreground border-border"}`}>
                      <div className="flex items-start gap-2">
                        {m.role === "assistant" ? (
                          <Bot className="w-4 h-4 mt-0.5 text-teal-600" />
                        ) : (
                          <User className="w-4 h-4 mt-0.5 text-teal-50" />
                        )}
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl px-4 py-3 border bg-white text-foreground border-border">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-teal-600" />
                        <TypingDots />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-border p-3 flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Ask about today's plan, summaries, or next steps..."
                />
                <Button className="bg-teal-600 hover:bg-teal-700" onClick={send} disabled={loading || !input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>
          <div className="lg:col-span-1 space-y-4">
            <Card className="border bg-white">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="w-4 h-4 text-teal-600" /> Notes/PDF summary
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => onPdfSelected(e.target.files?.[0] || null)}
                  />
                  {extractingPdf ? (
                    <span className="text-muted-foreground">Extracting PDF...</span>
                  ) : (
                    <span className="text-muted-foreground">Upload a PDF to auto-fill the notes</span>
                  )}
                </div>
                <textarea
                  className="w-full min-h-[120px] text-sm rounded-md border border-input bg-background p-2"
                  placeholder="Paste notes or extracted PDF text to summarize and save to Progress..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button onClick={summarizeNotes} disabled={summarizing || !notes.trim()} className="bg-teal-600 hover:bg-teal-700">
                    {summarizing ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Summarizing</>) : (<>Summarize & Save</>)}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Tip: Use your PDF tool to copy text here; we’ll summarize and store it as study progress.</p>
              </CardContent>
            </Card>

            <Card className="border bg-white">
              <CardContent className="p-4 space-y-2">
                <div className="text-sm font-medium">Recent Progress</div>
                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {progress.map((p) => (
                    <div key={p._id} className="text-xs border rounded-md p-2 bg-white">
                      <div className="font-medium truncate">{p.topic || "(untitled)"}</div>
                      <div className="text-muted-foreground line-clamp-3">{p.summary}</div>
                    </div>
                  ))}
                  {progress.length === 0 && (
                    <div className="text-xs text-muted-foreground">No progress summaries yet.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function TypingDots() {
  return (
    <div className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-teal-500"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}
