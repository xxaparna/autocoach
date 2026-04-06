export type SyllabusItem = {
  subject: string
  topic: string
  hours: number
  priority?: number
}

export type ExamDate = { name: string; date: string; subject?: string }

export type Preferences = {
  dailyHours: number
  focusSubjects: string[]
  weakTopics: string[]
  startDate: string
}

export type PlanTask = {
  id: string
  date: string // yyyy-mm-dd
  subject: string
  topic: string
  hours: number
  completed?: boolean
  missed?: boolean
}

export type WeeklyPlan = {
  tasks: PlanTask[]
  summary: {
    totalHours: number
    subjects: Record<string, number>
  }
}

// Simple heuristic planner if AI is unavailable.
export function buildHeuristicPlan(syllabus: SyllabusItem[], prefs: Preferences, examDates: ExamDate[]): WeeklyPlan {
  const tasks: PlanTask[] = []
  const start = new Date(prefs.startDate || new Date().toISOString().slice(0, 10))
  const bySubject: Record<string, SyllabusItem[]> = {}
  syllabus.forEach((s) => {
    const key = s.subject.trim() || "General"
    bySubject[key] = bySubject[key] || []
    bySubject[key].push(s)
  })
  // Sort by weak topics and focus subjects
  Object.values(bySubject).forEach((arr) => {
    arr.sort((a, b) => {
      const aWeak = prefs.weakTopics.some((w) => a.topic.toLowerCase().includes(w.toLowerCase()))
      const bWeak = prefs.weakTopics.some((w) => b.topic.toLowerCase().includes(w.toLowerCase()))
      const aFocus = prefs.focusSubjects.some((f) => f.toLowerCase() === a.subject.toLowerCase())
      const bFocus = prefs.focusSubjects.some((f) => f.toLowerCase() === b.subject.toLowerCase())
      const aw = (aWeak ? 2 : 0) + (aFocus ? 1 : 0)
      const bw = (bWeak ? 2 : 0) + (bFocus ? 1 : 0)
      return bw - aw
    })
  })
  // distribute hours daily
  let dayIdx = 0
  const dailyHours = Math.max(1, prefs.dailyHours)
  const flat: SyllabusItem[] = Object.entries(bySubject).flatMap(([subject, arr]) =>
    arr.map((x) => ({ ...x, subject, hours: x.hours || 1 })),
  )
  
  while (flat.length > 0) {
    let remaining = dailyHours
    const date = new Date(start)
    date.setDate(start.getDate() + dayIdx)
    const dateStr = date.toISOString().slice(0, 10)
    // exam proximity bias: if exam is within 7 days, prefer that subject
    const nearExam = examDates.find((e) => {
      const d = new Date(e.date)
      const diff = Math.ceil((d.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      return diff >= 0 && diff <= 7 && !!e.subject
    })
    
    while (remaining > 0 && flat.length > 0) {
      let itemIdx = 0
      if (nearExam && nearExam.subject) {
        const idx = flat.findIndex((f) => f.subject.toLowerCase() === nearExam.subject!.toLowerCase())
        if (idx !== -1) itemIdx = idx
      }
      
      const item = flat[itemIdx]
      if (!item || !item.hours) break
      
      const hours = Math.min(item.hours, remaining, Math.max(1, Math.round(dailyHours / 2)))
      tasks.push({
        id: `${dateStr}-${item.subject}-${item.topic}-${Math.random().toString(36).slice(2, 8)}`,
        date: dateStr,
        subject: item.subject,
        topic: item.topic,
        hours,
      })
      item.hours -= hours
      if (item.hours <= 0) {
        flat.splice(itemIdx, 1)
      }
      remaining -= hours
    }
    dayIdx += 1
    
    // Safety check to prevent infinite loops
    if (dayIdx > 365) break
  }
  const summary = {
    totalHours: tasks.reduce((a, b) => a + b.hours, 0),
    subjects: tasks.reduce<Record<string, number>>((acc, t) => {
      acc[t.subject] = (acc[t.subject] || 0) + t.hours
      return acc
    }, {}),
  }
  return { tasks, summary }
}

export function rebalanceAfterMiss(plan: WeeklyPlan, missedTaskId: string) {
  const task = plan.tasks.find((t) => t.id === missedTaskId)
  if (!task) return plan
  task.missed = true
  task.completed = false
  // push missed task to next day with available slot, preserving order
  const idx = plan.tasks.findIndex((t) => t.id === missedTaskId)
  const day = new Date(task.date)
  for (let i = 1; i <= 7; i++) {
    const date = new Date(day)
    date.setDate(day.getDate() + i)
    const dateStr = date.toISOString().slice(0, 10)
    const newTask = {
      ...task,
      id: `${dateStr}-${task.subject}-${task.topic}-${Math.random().toString(36).slice(2, 8)}`,
      date: dateStr,
      missed: false,
    }
    plan.tasks.splice(idx + i, 0, newTask)
    break
  }
}

export function groupByDate(tasks: PlanTask[]): Record<string, PlanTask[]> {
  return tasks.reduce<Record<string, PlanTask[]>>((acc, t) => {
    acc[t.date] = acc[t.date] || []
    acc[t.date].push(t)
    return acc
  }, {})
}
