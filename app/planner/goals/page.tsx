"use client"

import { useEffect, useMemo, useState } from "react"
import { AppNavbar } from "@/components/app-navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Trash2, Pencil, CheckCircle2, Plus, Target, ChevronDown } from "lucide-react"

type Goal = {
  _id: string
  title: string
  description?: string
  targetDate?: string
  status: "not_started" | "in_progress" | "completed"
  subtasks?: { title: string; done: boolean }[]
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: "", description: "", targetDate: "", status: "not_started" as Goal["status"] })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [suggesting, setSuggesting] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [sort, setSort] = useState("createdAt")
  const [order, setOrder] = useState<"asc" | "desc">("desc")
  const [openSubtasks, setOpenSubtasks] = useState<Record<string, boolean>>({})
  const [newSubtask, setNewSubtask] = useState<Record<string, string>>({})

  const completedPct = useMemo(() => {
    if (!goals.length) return 0
    const done = goals.filter(g => g.status === "completed").length
    return Math.round((done / goals.length) * 100)
  }, [goals])

  const load = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter) params.set("status", statusFilter)
      if (from) params.set("from", from)
      if (to) params.set("to", to)
      if (sort) params.set("sort", sort)
      if (order) params.set("order", order)
      const res = await fetch(`/api/goals?${params.toString()}`, { cache: "no-store" })
      if (res.status === 401) {
        setGoals([])
        setLoading(false)
        return
      }
      const data = await res.json()
      setGoals(data.goals || [])
    } catch (e) {
      toast.error("Failed to load goals")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter, from, to, sort, order])

  const submit = async () => {
    try {
      setCreating(true)
      const res = await fetch(editingId ? `/api/goals/${editingId}` : "/api/goals", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Save failed")
      setForm({ title: "", description: "", targetDate: "", status: "not_started" })
      setEditingId(null)
      await load()
      toast.success("Saved")
    } catch (e) {
      toast.error("Failed to save goal")
    } finally {
      setCreating(false)
    }
  }

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/goals/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      await load()
      toast.success("Deleted")
    } catch (e) {
      toast.error("Failed to delete goal")
    }
  }

  const suggest = async () => {
    try {
      setSuggesting(true)
      const res = await fetch("/api/goals/suggest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data?.error || "Suggestion failed")
        return
      }
      if (data?.suggestions?.length) {
        const s = data.suggestions[0]
        setForm({
          title: s.title?.slice(0, 120) || form.title,
          description: s.description?.slice(0, 1000) || form.description,
          targetDate: s.targetDate ? new Date(s.targetDate).toISOString().slice(0,10) : form.targetDate,
          status: "not_started",
        })
        toast.success("Suggestion added to form")
      } else {
        const msg = data?.error ? `No suggestions: ${data.error}` : "No suggestions returned"
        toast.info(msg)
      }
    } catch (e) {
      toast.error("Failed to get suggestions")
    } finally {
      setSuggesting(false)
    }
  }

  const toggleSubtask = async (goal: Goal, idx: number) => {
    const updated = [...(goal.subtasks || [])]
    updated[idx] = { ...updated[idx], done: !updated[idx].done }
    await fetch(`/api/goals/${goal._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subtasks: updated }) })
    await load()
  }

  const deleteSubtask = async (goal: Goal, idx: number) => {
    const updated = (goal.subtasks || []).filter((_, i) => i !== idx)
    await fetch(`/api/goals/${goal._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subtasks: updated }) })
    await load()
  }

  const addSubtask = async (goal: Goal) => {
    const title = (newSubtask[goal._id] || "").trim()
    if (!title) return
    const updated = [ ...(goal.subtasks || []), { title, done: false } ]
    setNewSubtask({ ...newSubtask, [goal._id]: "" })
    await fetch(`/api/goals/${goal._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subtasks: updated }) })
    await load()
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2"><Target className="w-6 h-6 text-teal-600"/> Goals</h1>
            <p className="text-muted-foreground">Set and track SMART goals for studies and career.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 border bg-white">
            <CardHeader>
              <CardTitle>Create / Edit Goal</CardTitle>
              <CardDescription>Green & white minimal design</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., Finish DSA course" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What, why, and how you'll achieve it" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="targetDate">Target date</Label>
                  <Input id="targetDate" type="date" value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select id="status" className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Goal["status"] })}>
                    <option value="not_started">Not started</option>
                    <option value="in_progress">In progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="bg-teal-600 hover:bg-teal-700" onClick={submit} disabled={creating || !form.title}>{editingId ? "Update" : "Create"}</Button>
                {editingId && (
                  <Button variant="outline" onClick={() => { setEditingId(null); setForm({ title: "", description: "", targetDate: "", status: "not_started" }) }}>Cancel</Button>
                )}
              </div>

              <div className="pt-4 border-t">
                <Label className="mb-1 block">Use Gemini to suggest SMART goal</Label>
                <div className="flex gap-2">
                  <Input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g., I have 4 weeks for OS exam" />
                  <Button variant="outline" onClick={suggest} disabled={suggesting}>{suggesting ? "Suggesting..." : "Suggest"}</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <Card className="border bg-white">
              <CardHeader>
                <CardTitle>Filters & Sorting</CardTitle>
                <CardDescription>Refine your goals list</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <Label>Status</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                      <option value="">All</option>
                      <option value="not_started">Not started</option>
                      <option value="in_progress">In progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <Label>From</Label>
                    <Input type="date" value={from} onChange={e => setFrom(e.target.value)} />
                  </div>
                  <div>
                    <Label>To</Label>
                    <Input type="date" value={to} onChange={e => setTo(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Sort by</Label>
                      <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={sort} onChange={e => setSort(e.target.value)}>
                        <option value="createdAt">Created</option>
                        <option value="targetDate">Target date</option>
                        <option value="status">Status</option>
                        <option value="title">Title</option>
                      </select>
                    </div>
                    <div>
                      <Label>Order</Label>
                      <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={order} onChange={e => setOrder(e.target.value as any)}>
                        <option value="desc">Desc</option>
                        <option value="asc">Asc</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border bg-white">
              <CardHeader>
                <CardTitle>Progress</CardTitle>
                <CardDescription>{completedPct}% completed</CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={completedPct} />
              </CardContent>
            </Card>

            <Card className="border bg-white">
              <CardHeader>
                <CardTitle>Your Goals</CardTitle>
                <CardDescription>{loading ? "Loading..." : `${goals.length} total`}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {goals.map(g => (
                    <div key={g._id} className="p-4 rounded-lg border flex flex-col gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="font-semibold text-foreground">{g.title}</div>
                        {g.description ? <div className="text-sm text-muted-foreground">{g.description}</div> : null}
                        <div className="text-xs text-muted-foreground flex gap-3">
                          <span>Status: {g.status.replace("_"," ")}</span>
                          {g.targetDate ? <span>Due: {new Date(g.targetDate).toLocaleDateString()}</span> : null}
                        </div>
                        {g.subtasks && g.subtasks.length > 0 && (
                          <div className="mt-2">
                            {(() => {
                              const done = g.subtasks!.filter(s => s.done).length
                              const pct = Math.round((done / g.subtasks!.length) * 100)
                              return (
                                <div>
                                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                    <span>Subtasks</span>
                                    <span>{done}/{g.subtasks!.length} ({pct}%)</span>
                                  </div>
                                  <Progress value={pct} />
                                </div>
                              )
                            })()}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setEditingId(g._id); setForm({ title: g.title, description: g.description || "", targetDate: g.targetDate ? g.targetDate.slice(0,10) : "", status: g.status }) }}>
                          <Pencil className="w-4 h-4 mr-1"/> Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => remove(g._id)}>
                          <Trash2 className="w-4 h-4 mr-1"/> Delete
                        </Button>
                        {g.status !== "completed" && (
                          <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={async () => { await fetch(`/api/goals/${g._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "completed" }) }); load(); }}>
                            <CheckCircle2 className="w-4 h-4 mr-1"/> Mark done
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => setOpenSubtasks({ ...openSubtasks, [g._id]: !openSubtasks[g._id] })}>
                          <ChevronDown className={`w-4 h-4 mr-1 transition-transform ${openSubtasks[g._id] ? "rotate-180" : ""}`} /> Subtasks
                        </Button>
                      </div>
                      {openSubtasks[g._id] && (
                        <div className="border-t pt-3 space-y-2">
                          <div className="space-y-2">
                            {(g.subtasks || []).map((s, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-2">
                                <label className="flex items-center gap-2 text-sm">
                                  <input type="checkbox" checked={s.done} onChange={() => toggleSubtask(g, idx)} />
                                  <span className={s.done ? "line-through text-muted-foreground" : ""}>{s.title}</span>
                                </label>
                                <Button size="icon" variant="ghost" onClick={() => deleteSubtask(g, idx)} aria-label="Delete subtask">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input placeholder="New subtask" value={newSubtask[g._id] || ""} onChange={e => setNewSubtask({ ...newSubtask, [g._id]: e.target.value })} />
                            <Button onClick={() => addSubtask(g)} className="bg-teal-600 hover:bg-teal-700"><Plus className="w-4 h-4 mr-1"/>Add</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {!loading && goals.length === 0 && (
                    <div className="text-sm text-muted-foreground">No goals yet. Start by creating one.</div>
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
