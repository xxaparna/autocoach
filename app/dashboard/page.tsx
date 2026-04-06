"use client"

import Link from "next/link"
import { AppNavbar } from "@/components/app-navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WelcomePrompt } from "@/components/welcome-prompt"
import { useWelcomePrompt } from "@/hooks/use-welcome-prompt"
import React, { useMemo, useState, useEffect } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { groupByDate } from "@/utils/planner"
import type { PlanTask } from "@/utils/planner"
import { Sparkles, Clock, CheckCircle2, Target, TrendingUp, Briefcase, GraduationCap, CalendarDays, MessageSquare, List, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"

const quotes = [
  "Small progress is still progress.",
  "Consistency beats intensity.",
  "Focus on being 1% better every day.",
  "Action is the antidote to anxiety.",
]

export default function DashboardPage() {
  const [tasks, setTasks] = useLocalStorage<PlanTask[]>("ac_tasks", [])
  const grouped = useMemo(() => groupByDate(tasks), [tasks])
  const todayStr = new Date().toISOString().slice(0, 10)
  const todayTasks = grouped[todayStr] || []
  const [date, setDate] = useState<Date | undefined>(new Date())
  const completion = Math.round(((tasks.filter((t) => t.completed).length || 0) / (tasks.length || 1)) * 100)
  const studyHours = tasks.reduce((a, b) => a + b.hours, 0)
  const readiness = Math.min(100, Math.round(completion * 0.6 + (todayTasks.length > 0 ? 10 : 0)))
  const [quoteIdx, setQuoteIdx] = useState<number>(0)
  const [mounted, setMounted] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [goals, setGoals] = useState<any[]>([])
  const [progressList, setProgressList] = useState<any[]>([])
  const [recentMessages, setRecentMessages] = useState<any[]>([])
  const [quickTitle, setQuickTitle] = useState("")
  const [quickDate, setQuickDate] = useState("")
  const [addingGoal, setAddingGoal] = useState(false)
  const [lastAnalysis, setLastAnalysis] = useState<any | null>(null)
  
  // Avoid hydration mismatch by randomizing quote only after mount
  // Server renders a deterministic first quote
  useEffect(() => {
    setMounted(true)
    setQuoteIdx(Math.floor(Math.random() * quotes.length))
  }, [])

  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" })
        const data = await res.json()
        if (!ignore && data?.user) {
          const name = data.user.name || (data.user.email ? String(data.user.email).split("@")[0] : "")
          setUserName(name || null)
        }
      } catch {}
    })()
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let cancel = false
    ;(async () => {
      try {
        const [g, p, m, a] = await Promise.all([
          fetch("/api/goals", { cache: "no-store" }),
          fetch("/api/progress", { cache: "no-store" }),
          fetch("/api/messages", { cache: "no-store" }),
          fetch("/api/analyze/last", { cache: "no-store" }),
        ])
        if (!cancel && g.ok) {
          const gj = await g.json()
          const list = Array.isArray(gj) ? gj : gj?.goals || gj?.data || []
          setGoals(Array.isArray(list) ? list : [])
        }
        if (!cancel && p.ok) {
          const pj = await p.json()
          setProgressList(Array.isArray(pj?.progress) ? pj.progress : [])
        }
        if (!cancel && m.ok) {
          const mj = await m.json()
          const msgs = Array.isArray(mj?.messages) ? mj.messages : []
          setRecentMessages(msgs.slice(-6))
        }
        if (!cancel && a.ok) {
          const aj = await a.json()
          setLastAnalysis(aj?.analysis || null)
        }
      } catch {}
    })()
    return () => {
      cancel = true
    }
  }, [])

  const last7DaysData = useMemo(() => {
    const days: { date: string; hours: number }[] = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const hours = (grouped[key] || []).reduce((a, b) => a + b.hours, 0)
      days.push({ date: key.slice(5), hours }) // mm-dd for x axis
    }
    return days
  }, [grouped])

  const quickAddGoal = async () => {
    const title = quickTitle.trim()
    if (!title) return
    try {
      setAddingGoal(true)
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, targetDate: quickDate || undefined }),
      })
      const data = await res.json()
      if (!res.ok) return
      setGoals((g) => [data, ...g])
      setQuickTitle("")
      setQuickDate("")
    } finally {
      setAddingGoal(false)
    }
  }

  const toggleTask = (id: string, checked: boolean | string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !!checked } : t)))
  }

  const markAllTodayDone = () => {
    setTasks((prev) => prev.map((t) => (t.date === todayStr ? { ...t, completed: true } : t)))
  }

  const { showWelcome, preferredBuddy, handleChooseBuddy, handleCloseWelcome, resetWelcome } = useWelcomePrompt()

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Prompt */}
        <WelcomePrompt open={showWelcome} onClose={handleCloseWelcome} onChoose={handleChooseBuddy} />

        {/* Hero */}
        <div className="rounded-xl overflow-hidden">
          <div className="relative bg-gradient-to-r from-teal-600 via-teal-500 to-blue-600 p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {preferredBuddy === "career" ? (
                    <Badge className="bg-white/20 text-white border-white/30">Career Mode</Badge>
                  ) : (
                    <Badge className="bg-white/20 text-white border-white/30">Study Mode</Badge>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {userName ? `Welcome back, ${userName}` : "Welcome back"}
                  {preferredBuddy ? ", your buddy is ready" : "!"}
                </h1>
                <p className="text-white/80 mt-1 text-sm sm:text-base">
                  Track progress, plan your day, and level up your career.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/resume-tools/builder"><Button variant="secondary">Build Resume</Button></Link>
                <Link href="/planner"><Button className="bg-white text-teal-700 hover:bg-white/90">Open Planner</Button></Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Card className="pro-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600" />
                  Study Hours Planned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{studyHours}h</div>
                <p className="text-sm text-gray-500">Total across current plan</p>
                <div className="h-24 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={last7DaysData} margin={{ left: -20, right: 0, top: 5, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} width={24} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ stroke: "#94a3b8", strokeDasharray: 4 }} />
                      <Area type="monotone" dataKey="hours" stroke="#14b8a6" fillOpacity={1} fill="url(#colorHours)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <Card className="pro-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Syllabus Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold">{completion}%</div>
                  <Progress value={completion} className="flex-1" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <Card className="pro-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Career Readiness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{readiness}</div>
                <p className="text-sm text-gray-500">Composite index</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
            <Card className="pro-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-emerald-600" />
                  Tasks Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{todayTasks.length}</div>
                <p className="text-sm text-gray-500">Planned in your schedule</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Card className="pro-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Link href="/planner" className="group">
                <div className="p-4 rounded-lg border bg-white hover:shadow-sm transition flex items-center gap-3">
                  <List className="w-5 h-5 text-teal-600" />
                  <div className="font-medium">Open Planner</div>
                </div>
              </Link>
              <Link href="/planner/goals" className="group">
                <div className="p-4 rounded-lg border bg-white hover:shadow-sm transition flex items-center gap-3">
                  <Target className="w-5 h-5 text-green-600" />
                  <div className="font-medium">Manage Goals</div>
                </div>
              </Link>
              <Link href="/planner/chat" className="group">
                <div className="p-4 rounded-lg border bg-white hover:shadow-sm transition flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  <div className="font-medium">Study Chat</div>
                </div>
              </Link>
              <Link href="/resume-tools/job-match" className="group">
                <div className="p-4 rounded-lg border bg-white hover:shadow-sm transition flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  <div className="font-medium">Job Match</div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="pro-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" /> Resume Latest Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastAnalysis ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Match</span>
                  <span className="font-semibold">{Math.round(lastAnalysis.matchPercentage)}%</span>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Top matched skills</div>
                  <div className="flex flex-wrap gap-1">
                    {(lastAnalysis.matchedSkills || []).slice(0,6).map((s: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs border border-emerald-200">{s}</span>
                    ))}
                    {(!lastAnalysis.matchedSkills || lastAnalysis.matchedSkills.length === 0) && (
                      <span className="text-xs text-gray-500">No skills listed</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Recommendations</div>
                  <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
                    {(lastAnalysis.recommendations || []).slice(0,3).map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
                <Link href="/resume-tools/job-match"><Button variant="outline" size="sm" className="bg-white mt-1">Open Job Match</Button></Link>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No analysis yet. Run Job Match to see insights here.</div>
            )}
          </CardContent>
        </Card>

        <Card className="pro-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-teal-600" /> Quick Add Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-3">
              <Input
                placeholder="Goal title"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
              />
              <Input
                type="date"
                placeholder="Target date"
                value={quickDate}
                onChange={(e) => setQuickDate(e.target.value)}
              />
              <Button onClick={quickAddGoal} disabled={addingGoal || !quickTitle.trim()} className="bg-teal-600 hover:bg-teal-700">
                {addingGoal ? "Adding..." : "Add Goal"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 pro-card">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Workspace</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="rounded-lg border bg-white p-4">
                      <h3 className="font-semibold mb-2">Recent Trend</h3>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={last7DaysData} margin={{ left: -20, right: 0, top: 10, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorHours2" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10 }} width={24} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ stroke: "#cbd5e1", strokeDasharray: 4 }} />
                            <Area type="monotone" dataKey="hours" stroke="#4f46e5" fillOpacity={1} fill="url(#colorHours2)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Today's Plan</h3>
                        {todayTasks.length > 0 && (
                          <Button variant="ghost" size="sm" onClick={markAllTodayDone}>
                            Mark all done
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {todayTasks.length === 0 && <p className="text-sm text-gray-500">No tasks for today.</p>}
                        {todayTasks.map((t) => (
                          <div key={t.id} className="p-3 rounded border bg-white flex items-center justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <Checkbox checked={!!t.completed} onCheckedChange={(v) => toggleTask(t.id, v)} />
                              <div>
                                <div className={cn("font-medium", t.completed && "line-through text-gray-400")}>{t.subject}</div>
                                <div className="text-sm text-gray-600">{t.topic}</div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">{t.hours}h</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="calendar" className="mt-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
                    <div>
                      <h3 className="font-semibold mb-2">Selected Day</h3>
                      <div className="text-sm text-gray-600">Pick a date to view tasks in Planner.</div>
                      <Link href="/planner">
                        <Button variant="outline" size="sm" className="mt-3 bg-white">Open Planner</Button>
                      </Link>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="pro-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
                Motivation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <blockquote suppressHydrationWarning className="text-gray-800 italic">"{mounted ? quotes[quoteIdx] : quotes[0]}"</blockquote>
              </motion.div>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setQuoteIdx((i) => (i + 1) % quotes.length)}>
                New quote
              </Button>
              <div className="mt-4 grid grid-cols-1 gap-2">
                <Link href="/resume-tools/job-match">
                  <Button className="w-full">Match Resume to JD</Button>
                </Link>
                <Link href="/resume-tools/builder">
                  <Button variant="outline" className="w-full bg-white">
                    Build Resume
                  </Button>
                </Link>
                <Link href="/planner">
                  <Button variant="secondary" className="w-full">
                    Plan Studies
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="pro-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-teal-600" />
              What's next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-3">
              <Link href="/planner" className="group">
                <div className="p-4 rounded-lg border bg-white hover:shadow-sm transition">
                  <div className="font-medium">Import Syllabus</div>
                  <div className="text-xs text-gray-500">CSV/XLSX</div>
                </div>
              </Link>
              <Link href="/resume-tools/builder" className="group">
                <div className="p-4 rounded-lg border bg-white hover:shadow-sm transition">
                  <div className="font-medium">Build Resume</div>
                  <div className="text-xs text-gray-500">Create & export PDF</div>
                </div>
              </Link>
              <Link href="/resume-tools/job-match" className="group">
                <div className="p-4 rounded-lg border bg-white hover:shadow-sm transition">
                  <div className="font-medium">Tailored Tips</div>
                  <div className="text-xs text-gray-500">Match resume to JD</div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="pro-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-teal-600" /> Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {goals
                  .filter((g) => g?.targetDate)
                  .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
                  .slice(0, 6)
                  .map((g) => (
                    <div key={g._id || g.id || g.title} className="p-3 rounded border bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Target className="w-4 h-4 text-emerald-600" />
                          <div>
                            <div className="font-medium">{g.title}</div>
                            <div className="text-xs text-gray-500">Due {new Date(g.targetDate).toISOString().slice(0,10)}</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 capitalize">{g.status || "not_started"}</div>
                      </div>
                      {Array.isArray(g.subtasks) && g.subtasks.length > 0 && (
                        <div className="mt-2">
                          {(() => {
                            const done = g.subtasks.filter((s: any) => s && s.done).length
                            const total = g.subtasks.length
                            const pct = Math.round((done / (total || 1)) * 100)
                            return (
                              <>
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                  <span>Progress</span>
                                  <span>
                                    {done}/{total} ({pct}%)
                                  </span>
                                </div>
                                <Progress value={pct} />
                              </>
                            )
                          })()}
                        </div>
                      )}
                    </div>
                  ))}
                {(!goals || goals.length === 0) && (
                  <div className="text-sm text-gray-500">No goals yet or you are not signed in.</div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="pro-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" /> Recent Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[320px] overflow-y-auto">
                {progressList.map((p) => (
                  <div key={p._id} className="p-3 rounded border bg-white">
                    <div className="font-medium text-sm">{p.topic || "(untitled)"}</div>
                    <div className="text-xs text-gray-600 line-clamp-3">{p.summary}</div>
                  </div>
                ))}
                {progressList.length === 0 && (
                  <div className="text-sm text-gray-500">No progress summaries yet.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="pro-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" /> Recent Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {recentMessages.map((m) => (
                <div key={m._id} className="p-3 rounded border bg-white">
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">{m.role}</div>
                  <div className="text-sm text-gray-800 line-clamp-2">{String(m.content || "").slice(0, 220)}</div>
                </div>
              ))}
              {recentMessages.length === 0 && (
                <div className="text-sm text-gray-500">No messages yet. Start a chat in Study Chat.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
