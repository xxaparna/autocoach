"use client"

import { useEffect, useRef, useState } from "react"
import { AppNavbar } from "@/components/app-navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Send, Sparkles, Library, Brain } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"

type Msg = { role: "user" | "assistant"; content: string }

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I’m your AutoCoach Doubt Bot. Ask me anything about your syllabus topics, coding problems, or exam prep. I’ll answer based on your preferences and weak topics.",
    },
  ])
  const [input, setInput] = useState("")
  const [contextNote, setContextNote] = useState("")
  const [prefs] = useLocalStorage<any>("ac_prefs", null)
  const [syllabus] = useLocalStorage<any[]>("ac_syllabus", [])
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const ask = async () => {
    const text = input.trim()
    if (!text) return
    const userMsg: Msg = { role: "user", content: text }
    setMessages((m) => [...m, userMsg])
    setInput("")
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          context: {
            preferences: prefs,
            weakTopics: prefs?.weakTopics || [],
            focusSubjects: prefs?.focusSubjects || [],
            syllabusPreview: (syllabus || []).slice(0, 20), // cap payload
            note: contextNote,
          },
        }),
      })
      const data = await res.json()
      setMessages((m) => [...m, { role: "assistant", content: data.text || "I couldn’t generate a response." }])
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, something went wrong. Please try again." }])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" /> Personalised Doubt Bot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                ref={listRef}
                className="h-[60vh] w-full overflow-y-auto rounded border bg-white p-4 space-y-4"
                aria-live="polite"
              >
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`max-w-[85%] p-3 rounded ${
                      m.role === "user"
                        ? "ml-auto bg-indigo-600 text-white"
                        : "mr-auto bg-gray-100 text-gray-900 border"
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Add optional context (e.g., 'Explain DP for knapsack with examples')"
                  value={contextNote}
                  onChange={(e) => setContextNote(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question…"
                  className="flex-1 min-h-[48px] h-24"
                />
                <Button onClick={ask} className="self-end">
                  <Send className="w-4 h-4 mr-2" /> Ask
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Library className="w-5 h-5 text-purple-600" /> Context Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-gray-600 mb-1">Focus Subjects</div>
                <div className="flex flex-wrap gap-2">
                  {(prefs?.focusSubjects || []).length === 0 && <Badge variant="secondary">None set</Badge>}
                  {(prefs?.focusSubjects || []).map((s: string, i: number) => (
                    <Badge key={i} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Weak Topics</div>
                <div className="flex flex-wrap gap-2">
                  {(prefs?.weakTopics || []).length === 0 && <Badge variant="secondary">None set</Badge>}
                  {(prefs?.weakTopics || []).map((s: string, i: number) => (
                    <Badge key={i} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                The bot uses your preferences to tailor explanations and practice suggestions.
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> Tip: Set preferences in Planner.
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
