"use client"

import { useEffect, useState } from "react"
import { AppNavbar } from "@/components/app-navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface Topic { title: string; description?: string; status?: "not_started" | "in_progress" | "completed" }

export default function SyllabusPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")

  useEffect(() => {
    let cancel = false
    ;(async () => {
      try {
        const res = await fetch("/api/syllabus", { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          if (!cancel) setTopics(data?.syllabus?.topics || [])
        }
      } catch {}
      if (!cancel) setLoading(false)
    })()
    return () => { cancel = true }
  }, [])

  const addTopic = async () => {
    const title = newTitle.trim()
    if (!title) return
    const next = [...topics, { title, description: newDesc.trim() || undefined, status: "not_started" }]
    try {
      const res = await fetch("/api/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics: next }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data?.error || "Failed to save"); return }
      setTopics(data?.syllabus?.topics || [])
      setNewTitle("")
      setNewDesc("")
    } catch { toast.error("Network error") }
  }

  const updateStatus = async (index: number, status: Topic["status"]) => {
    try {
      const res = await fetch("/api/syllabus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index, topic: { status } }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data?.error || "Failed to update"); return }
      setTopics(data?.syllabus?.topics || [])
    } catch { toast.error("Network error") }
  }

  const removeTopic = async (index: number) => {
    const next = topics.filter((_, i) => i !== index)
    try {
      const res = await fetch("/api/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics: next }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data?.error || "Failed to delete"); return }
      setTopics(data?.syllabus?.topics || [])
    } catch { toast.error("Network error") }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Syllabus</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-3">
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Topic title" />
              <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)" />
              <Button onClick={addTopic} disabled={!newTitle.trim()} className="bg-teal-600 hover:bg-teal-700">Add</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Topics</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : topics.length === 0 ? (
              <div className="text-sm text-muted-foreground">No topics yet.</div>
            ) : (
              <div className="space-y-2">
                {topics.map((t, i) => (
                  <div key={i} className="p-3 rounded border bg-white flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{t.title}</div>
                      {t.description && <div className="text-sm text-muted-foreground">{t.description}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={t.status || "not_started"}
                        onChange={(e) => updateStatus(i, e.target.value as Topic["status"])}
                        className="text-sm border rounded px-2 py-1 bg-background"
                      >
                        <option value="not_started">Not started</option>
                        <option value="in_progress">In progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <Button variant="outline" className="bg-white" onClick={() => removeTopic(i)}>Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
