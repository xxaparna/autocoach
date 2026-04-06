"use client"

import { useState, useMemo } from "react"
import { AppNavbar } from "@/components/app-navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocalStorage } from "@/hooks/use-local-storage"
import {
  buildHeuristicPlan,
  rebalanceAfterMiss,
  groupByDate,
  type SyllabusItem,
  type Preferences,
  type ExamDate,
  type WeeklyPlan,
} from "@/utils/planner"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import { 
  Check, 
  RotateCcw, 
  Upload, 
  CalendarDays, 
  Clock, 
  AlertTriangle,
  FileText,
  TrendingUp,
  Target,
  BookOpen,
  BarChart3,
  Download,
  Trash2,
  Plus,
  Sparkles,
  CheckCircle2,
  Circle,
  XCircle
} from "lucide-react"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"

export default function PlannerPage() {
  const [syllabus, setSyllabus] = useLocalStorage<SyllabusItem[]>("ac_syllabus", [])
  const [examDates, setExamDates] = useLocalStorage<ExamDate[]>("ac_exams", [])
  const [prefs, setPrefs] = useLocalStorage<Preferences>("ac_prefs", {
    dailyHours: 3,
    focusSubjects: [],
    weakTopics: [],
    startDate: new Date().toISOString().slice(0, 10),
  })
  const [plan, setPlan] = useLocalStorage<WeeklyPlan | null>("ac_plan", null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isUploading, setIsUploading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [newExam, setNewExam] = useState({ name: "", date: "", subject: "" })

  const grouped = useMemo(() => groupByDate(plan?.tasks || []), [plan])

  // Calculate progress statistics
  const stats = useMemo(() => {
    if (!plan) return { total: 0, completed: 0, missed: 0, remaining: 0, percentage: 0 }
    const total = plan.tasks.length
    const completed = plan.tasks.filter(t => t.completed).length
    const missed = plan.tasks.filter(t => t.missed).length
    const remaining = total - completed - missed
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, missed, remaining, percentage }
  }, [plan])

  // Calculate subject-wise progress
  const subjectProgress = useMemo(() => {
    if (!plan) return []
    const subjects: Record<string, { total: number, completed: number }> = {}
    plan.tasks.forEach(t => {
      if (!subjects[t.subject]) {
        subjects[t.subject] = { total: 0, completed: 0 }
      }
      subjects[t.subject].total++
      if (t.completed) subjects[t.subject].completed++
    })
    return Object.entries(subjects).map(([subject, data]) => ({
      subject,
      total: data.total,
      completed: data.completed,
      percentage: Math.round((data.completed / data.total) * 100)
    }))
  }, [plan])

  const importCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[]
        const items: SyllabusItem[] = rows
          .map((r) => {
            const subject = (r.subject || r.Subject || "").toString().trim()
            const topic = (r.topic || r.Topic || "").toString().trim()
            const hours = Math.max(0.5, Number.parseFloat(r.hours || r.Hours || "1") || 1)
            return { subject, topic, hours }
          })
          .filter((x) => x.subject && x.topic && x.hours > 0)
        
        if (items.length === 0) {
          toast.error("No valid items found in CSV. Check format: subject, topic, hours")
          return
        }
        
        setSyllabus(items)
        toast.success(`Loaded ${items.length} syllabus items from CSV`)
      },
      error: (error) => {
        toast.error(`Failed to parse CSV: ${error.message}`)
      }
    })
  }

  const importXLSX = async (file: File) => {
    try {
      const data = await file.arrayBuffer()
      const wb = XLSX.read(data)
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws) as any[]
      const items: SyllabusItem[] = rows
        .map((r) => {
          const subject = (r.subject || r.Subject || "").toString().trim()
          const topic = (r.topic || r.Topic || "").toString().trim()
          const hours = Math.max(0.5, Number.parseFloat(r.hours || r.Hours || "1") || 1)
          return { subject, topic, hours }
        })
        .filter((x) => x.subject && x.topic && x.hours > 0)
      
      if (items.length === 0) {
        toast.error("No valid items found in Excel. Check format: subject, topic, hours")
        return
      }
      
      setSyllabus(items)
      toast.success(`Loaded ${items.length} syllabus items from Excel`)
    } catch (error) {
      toast.error("Failed to parse Excel file")
      console.error(error)
    }
  }

  const loadPdfJs = async () => {
    if (typeof window === "undefined") return null
    const w = window as any
    if (w.pdfjsLib) return w.pdfjsLib
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script")
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
      s.async = true
      s.onload = () => resolve()
      s.onerror = () => reject(new Error("Failed to load pdf.js"))
      document.head.appendChild(s)
    })
    const pdfjs = (window as any).pdfjsLib
    if (pdfjs?.GlobalWorkerOptions) {
      pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
    }
    return pdfjs
  }

  const importPDF = async (file: File) => {
    toast.info("Extracting text from PDF...")
    const pdfjs = await loadPdfJs()
    const ab = await file.arrayBuffer()
    const doc = await (pdfjs as any).getDocument({ data: ab }).promise
    let text = ""
    const pages = doc.numPages || 0
    for (let i = 1; i <= pages; i++) {
      const page = await doc.getPage(i)
      const content = await page.getTextContent()
      const strings = (content.items || []).map((it: any) => it.str || "")
      text += strings.join(" ") + "\n"
    }
    text = text.trim()
    if (!text) {
      toast.error("No text detected in PDF. If it's scanned, please convert to text or DOCX.")
      throw new Error("No text in PDF")
    }
    toast.info("Analyzing syllabus with AI...")
    const res = await fetch("/api/parse-syllabus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(`Failed to parse syllabus: ${err?.error || "Unknown error"}`)
      throw new Error(err?.error || "Failed to parse")
    }
    const data = (await res.json()) as { items: SyllabusItem[] }
    setSyllabus(data.items)
    toast.success(`Successfully parsed ${data.items.length} topics from your syllabus!`)
  }

  // Drag and drop handler
  const onDrop = async (acceptedFiles: File[]) => {
    console.log("onDrop called with files:", acceptedFiles)
    if (acceptedFiles.length === 0) {
      console.log("No files accepted")
      return
    }
    const file = acceptedFiles[0]
    console.log("Processing file:", file.name, file.type)
    
    setIsUploading(true)
    try {
      if (file.name.toLowerCase().endsWith(".pdf")) {
        console.log("Importing PDF...")
        await importPDF(file)
      } else if (file.name.toLowerCase().endsWith(".csv")) {
        console.log("Importing CSV...")
        importCSV(file)
      } else if (file.name.toLowerCase().endsWith(".xlsx") || file.name.toLowerCase().endsWith(".xls")) {
        console.log("Importing Excel...")
        await importXLSX(file)
      } else {
        toast.error("Please upload a PDF, CSV, or Excel file.")
      }
    } catch (error) {
      toast.error("Failed to process file")
      console.error("File processing error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    disabled: isUploading,
    noClick: false,
    noKeyboard: false
  })

  const generatePlan = async () => {
    if (syllabus.length === 0) {
      toast.error("Please upload a syllabus first")
      return
    }
    setIsGenerating(true)
    toast.info("Generating your personalized study plan...")
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syllabus, preferences: prefs, exams: examDates }),
      })
      if (res.ok) {
        const data = (await res.json()) as WeeklyPlan
        setPlan(data)
        toast.success("Study plan generated successfully!")
      } else {
        // fallback
        const data = buildHeuristicPlan(syllabus, prefs, examDates)
        setPlan(data)
        toast.success("Study plan generated using fallback method")
      }
    } catch {
      const data = buildHeuristicPlan(syllabus, prefs, examDates)
      setPlan(data)
      toast.success("Study plan generated using fallback method")
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleComplete = (taskId: string) => {
    if (!plan) return
    const task = plan.tasks.find(t => t.id === taskId)
    const updated = { ...plan, tasks: plan.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)) }
    setPlan(updated)
    if (task && !task.completed) {
      toast.success("Task marked as completed! 🎉")
    }
  }

  const markMissed = (taskId: string) => {
    if (!plan) return
    const copy: WeeklyPlan = JSON.parse(JSON.stringify(plan))
    rebalanceAfterMiss(copy, taskId)
    setPlan(copy)
    toast.info("Task rescheduled to next available slot")
  }

  const addExam = () => {
    if (!newExam.name || !newExam.date) {
      toast.error("Please provide exam name and date")
      return
    }
    setExamDates([...examDates, newExam])
    setNewExam({ name: "", date: "", subject: "" })
    toast.success("Exam added successfully")
  }

  const removeExam = (index: number) => {
    setExamDates(examDates.filter((_, i) => i !== index))
    toast.success("Exam removed")
  }

  const clearSyllabus = () => {
    setSyllabus([])
    toast.success("Syllabus cleared")
  }

  const resetPlan = () => {
    setPlan(null)
    toast.success("Plan reset")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <AppNavbar />
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-3 mb-8">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-emerald-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              AI Study Planner
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your syllabus and let AI create a personalized study plan with intelligent scheduling and progress tracking
          </p>
        </div>

        {/* Progress Overview - Only show if plan exists */}
        {plan && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-emerald-200 bg-white/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Tasks</p>
                    <p className="text-3xl font-bold text-emerald-600">{stats.total}</p>
                  </div>
                  <Target className="w-10 h-10 text-emerald-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-white/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <CheckCircle2 className="w-10 h-10 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-white/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Remaining</p>
                    <p className="text-3xl font-bold text-amber-600">{stats.remaining}</p>
                  </div>
                  <Circle className="w-10 h-10 text-amber-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-200 bg-white/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Progress</p>
                    <p className="text-3xl font-bold text-emerald-600">{stats.percentage}%</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-emerald-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur border border-emerald-100">
            <TabsTrigger value="upload" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="plan" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <CalendarDays className="w-4 h-4 mr-2" />
              Study Plan
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white" disabled={!plan}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white" disabled={!plan}>
              <Clock className="w-4 h-4 mr-2" />
              Timeline
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6 mt-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-emerald-200 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    Upload Your Syllabus
                  </CardTitle>
                  <CardDescription>
                    Drag and drop your PDF syllabus or select a file. Also supports CSV and Excel formats.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Drag and Drop Zone */}
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                      isDragActive 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-gray-300 hover:border-emerald-400 bg-gray-50'
                    } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-emerald-100 rounded-full">
                        <Upload className="w-8 h-8 text-emerald-600" />
                      </div>
                      {isUploading ? (
                        <div className="space-y-2">
                          <p className="text-gray-700 font-medium">Processing your file...</p>
                          <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 animate-pulse rounded-full w-full"></div>
                          </div>
                        </div>
                      ) : isDragActive ? (
                        <p className="text-emerald-600 font-medium">Drop your file here!</p>
                      ) : (
                        <>
                          <p className="text-gray-700 font-medium">
                            Drag & drop your syllabus here, or click to browse
                          </p>
                          <p className="text-sm text-gray-500">
                            Supports PDF, CSV, and Excel files
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Syllabus Table */}
                  {syllabus.length > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Parsed Syllabus ({syllabus.length} items)</h3>
                        <Button variant="outline" size="sm" onClick={clearSyllabus} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Clear
                        </Button>
                      </div>
                      <div className="max-h-80 overflow-auto border rounded-lg bg-white">
                        <table className="w-full text-sm">
                          <thead className="bg-emerald-50 sticky top-0">
                            <tr>
                              <th className="p-3 text-left font-semibold text-gray-700">Subject</th>
                              <th className="p-3 text-left font-semibold text-gray-700">Topic</th>
                              <th className="p-3 text-left font-semibold text-gray-700">Hours</th>
                            </tr>
                          </thead>
                          <tbody>
                            {syllabus.map((s, i) => (
                              <tr key={i} className="border-t hover:bg-gray-50">
                                <td className="p-3">{s.subject}</td>
                                <td className="p-3">{s.topic}</td>
                                <td className="p-3">
                                  <Badge variant="secondary">{s.hours}h</Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                {/* Preferences Card */}
                <Card className="border-emerald-200 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-lg">Study Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-700">Daily Study Hours</Label>
                      <Input
                        type="number"
                        min={1}
                        max={24}
                        value={prefs.dailyHours}
                        onChange={(e) => setPrefs({ ...prefs, dailyHours: Number(e.target.value) || 1 })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700">Start Date</Label>
                      <Input
                        type="date"
                        value={prefs.startDate}
                        onChange={(e) => setPrefs({ ...prefs, startDate: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700">Focus Subjects</Label>
                      <Input
                        placeholder="e.g., Mathematics, Physics"
                        value={prefs.focusSubjects.join(", ")}
                        onChange={(e) =>
                          setPrefs({
                            ...prefs,
                            focusSubjects: e.target.value
                              .split(",")
                              .map((x) => x.trim())
                              .filter(Boolean),
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700">Weak Topics</Label>
                      <Textarea
                        placeholder="e.g., Calculus, Thermodynamics"
                        value={prefs.weakTopics.join(", ")}
                        onChange={(e) =>
                          setPrefs({
                            ...prefs,
                            weakTopics: e.target.value
                              .split(",")
                              .map((x) => x.trim())
                              .filter(Boolean),
                          })
                        }
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Exams Card */}
                <Card className="border-emerald-200 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-lg">Upcoming Exams</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Input
                        placeholder="Exam name"
                        value={newExam.name}
                        onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                      />
                      <Input
                        type="date"
                        value={newExam.date}
                        onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                      />
                      <Input
                        placeholder="Subject (optional)"
                        value={newExam.subject}
                        onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
                      />
                      <Button onClick={addExam} className="w-full bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Exam
                      </Button>
                    </div>
                    {examDates.length > 0 && (
                      <div className="space-y-2 mt-4">
                        {examDates.map((exam, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-emerald-50 rounded border border-emerald-200">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{exam.name}</p>
                              <p className="text-xs text-gray-600">{exam.date} {exam.subject && `• ${exam.subject}`}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeExam(i)}
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Generate Button */}
                <Button 
                  onClick={generatePlan} 
                  disabled={syllabus.length === 0 || isGenerating}
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Study Plan
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Study Plan Tab */}
          <TabsContent value="plan" className="space-y-6 mt-6">
            {!plan ? (
              <Card className="border-emerald-200 bg-white/80 backdrop-blur">
                <CardContent className="py-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No study plan generated yet</p>
                  <p className="text-gray-500 text-sm mt-2">Upload a syllabus and generate a plan to get started</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Your Study Schedule</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={resetPlan} className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Reset Plan
                    </Button>
                  </div>
                </div>

                {/* Overall Progress Bar */}
                <Card className="border-emerald-200 bg-white/80 backdrop-blur">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Overall Progress</span>
                        <span className="font-semibold text-emerald-600">{stats.percentage}%</span>
                      </div>
                      <Progress value={stats.percentage} className="h-3" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{stats.completed} completed</span>
                        <span>{stats.remaining} remaining</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Daily Tasks Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Object.entries(grouped).map(([date, tasks]) => {
                    const dayCompleted = tasks.filter(t => t.completed).length
                    const dayTotal = tasks.length
                    const dayProgress = Math.round((dayCompleted / dayTotal) * 100)
                    
                    return (
                      <Card key={date} className="border-emerald-200 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                              <p className="text-xs text-gray-500 mt-1">{dayCompleted}/{dayTotal} tasks</p>
                            </div>
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {tasks.reduce((a, b) => a + b.hours, 0)}h
                            </Badge>
                          </div>
                          <Progress value={dayProgress} className="h-1.5 mt-2" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {tasks.map((t) => (
                            <div key={t.id} className={`p-3 rounded-lg border-2 transition-all ${
                              t.completed 
                                ? 'border-green-200 bg-green-50' 
                                : t.missed 
                                ? 'border-red-200 bg-red-50' 
                                : 'border-gray-200 bg-white hover:border-emerald-300'
                            }`}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{t.subject}</p>
                                  <p className="text-xs text-gray-600 truncate">{t.topic}</p>
                                  <p className="text-xs text-gray-500 mt-1">{t.hours}h</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <Button
                                    size="icon"
                                    variant={t.completed ? "default" : "outline"}
                                    onClick={() => toggleComplete(t.id)}
                                    className={`h-8 w-8 ${t.completed ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  {!t.completed && (
                                    <Button 
                                      size="icon" 
                                      variant="outline" 
                                      onClick={() => markMissed(t.id)}
                                      className="h-8 w-8"
                                    >
                                      <RotateCcw className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-900">Smart Rescheduling</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Missed tasks are automatically rescheduled to the next available days to keep you on track.
                    </p>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Subject Progress */}
              <Card className="border-emerald-200 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                    Subject-wise Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {subjectProgress.map((subject, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{subject.subject}</span>
                        <span className="text-emerald-600 font-semibold">{subject.percentage}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={subject.percentage} className="flex-1 h-2" />
                        <span className="text-xs text-gray-500 w-16">{subject.completed}/{subject.total}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Study Statistics */}
              <Card className="border-emerald-200 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Study Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <p className="text-sm text-gray-600">Total Hours</p>
                      <p className="text-2xl font-bold text-emerald-600">{plan?.summary.totalHours || 0}</p>
                    </div>
                    <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                      <p className="text-sm text-gray-600">Total Subjects</p>
                      <p className="text-2xl font-bold text-teal-600">{Object.keys(plan?.summary.subjects || {}).length}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-600">Avg. Hours/Day</p>
                      <p className="text-2xl font-bold text-green-600">
                        {plan ? Math.round((plan.summary.totalHours / Object.keys(grouped).length) * 10) / 10 : 0}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600">Study Days</p>
                      <p className="text-2xl font-bold text-blue-600">{Object.keys(grouped).length}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-sm text-gray-700 mb-3">Hours by Subject</h4>
                    <div className="space-y-2">
                      {Object.entries(plan?.summary.subjects || {}).map(([subject, hours]) => (
                        <div key={subject} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">{subject}</span>
                          <Badge variant="secondary">{hours}h</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Insights Card */}
            <Card className="border-emerald-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">Great Progress!</p>
                        <p className="text-sm text-gray-600 mt-1">
                          You've completed {stats.percentage}% of your study plan. Keep up the momentum!
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {stats.percentage < 50 && stats.remaining > 0 && (
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900">Stay Focused</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {stats.remaining} tasks remaining. Try to complete at least {Math.ceil(stats.remaining / 7)} tasks per day.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {examDates.length > 0 && (
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <CalendarDays className="w-5 h-5 text-blue-600 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900">Upcoming Exams</p>
                          <p className="text-sm text-gray-600 mt-1">
                            You have {examDates.length} exam{examDates.length !== 1 ? 's' : ''} scheduled. Make sure to review!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6 mt-6">
            <Card className="border-emerald-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  Study Timeline
                </CardTitle>
                <CardDescription>
                  Visual overview of your study schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(grouped).map(([date, tasks], idx) => {
                    const isToday = new Date(date).toDateString() === new Date().toDateString()
                    const isPast = new Date(date) < new Date() && !isToday
                    const allCompleted = tasks.every(t => t.completed)
                    
                    return (
                      <div key={date} className="relative">
                        {idx !== Object.keys(grouped).length - 1 && (
                          <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-emerald-300 to-transparent" />
                        )}
                        <div className="flex gap-4">
                          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm ${
                            allCompleted 
                              ? 'bg-green-500 text-white' 
                              : isToday 
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-200' 
                              : isPast 
                              ? 'bg-gray-300 text-gray-600' 
                              : 'bg-white border-2 border-emerald-300 text-emerald-600'
                          }`}>
                            {allCompleted ? (
                              <CheckCircle2 className="w-6 h-6" />
                            ) : (
                              new Date(date).getDate()
                            )}
                          </div>
                          <div className="flex-1 pb-8">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900">
                                {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                              </h3>
                              {isToday && (
                                <Badge className="bg-emerald-600">Today</Badge>
                              )}
                              {allCompleted && (
                                <Badge className="bg-green-600">Completed</Badge>
                              )}
                            </div>
                            <div className="space-y-2">
                              {tasks.map((task, taskIdx) => (
                                <div 
                                  key={task.id} 
                                  className={`p-3 rounded-lg border-l-4 ${
                                    task.completed 
                                      ? 'bg-green-50 border-green-500' 
                                      : task.missed 
                                      ? 'bg-red-50 border-red-500' 
                                      : 'bg-white border-emerald-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                      {task.completed ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                      ) : task.missed ? (
                                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                      ) : (
                                        <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-gray-900">{task.subject}</p>
                                        <p className="text-xs text-gray-600">{task.topic}</p>
                                      </div>
                                      <Badge variant="secondary" className="flex-shrink-0">
                                        {task.hours}h
                                      </Badge>
                                    </div>
                                    {!task.completed && (
                                      <div className="flex gap-1 ml-2">
                                        <Button
                                          size="icon"
                                          variant="outline"
                                          onClick={() => toggleComplete(task.id)}
                                          className="h-8 w-8"
                                        >
                                          <Check className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
