"use client"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Briefcase, Sparkles, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"

interface JobDescriptionInputProps {
  value: string
  onChange: (value: string) => void
  role: string
  onRoleChange: (value: string) => void
}

const sampleJobDescription = `Senior Software Engineer - Full Stack

We are looking for a Senior Software Engineer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies.

Requirements:
• 5+ years of experience in software development
• Proficiency in JavaScript, TypeScript, React, and Node.js
• Experience with cloud platforms (AWS, Azure, or GCP)
• Knowledge of database systems (PostgreSQL, MongoDB)
• Experience with CI/CD pipelines and DevOps practices
• Strong problem-solving and communication skills
• Bachelor's degree in Computer Science or related field

Nice to have:
• Experience with Docker and Kubernetes
• Knowledge of microservices architecture
• Experience with GraphQL
• Familiarity with machine learning concepts

We offer competitive salary, health benefits, and flexible work arrangements.`

export function JobDescriptionInput({ value, onChange, role, onRoleChange }: JobDescriptionInputProps) {
  const handleSampleLoad = () => {
    onChange(sampleJobDescription)
  }

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
      pdfjs.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
    }
    return pdfjs
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Briefcase className="w-5 h-5 mr-2" />
          Job Description
        </h2>
        <Button variant="ghost" size="sm" onClick={handleSampleLoad}>
          <Sparkles className="w-4 h-4 mr-1" />
          Load Sample
        </Button>
      </div>

      {/* Role input */}
      <div>
        <label className="text-sm font-medium text-gray-700">Job Title / Role</label>
        <Input
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
          placeholder="e.g., Senior Software Engineer"
          className="mt-1"
        />
      </div>

      {/* JD upload */}
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2 text-sm text-gray-700">
              <Upload className="w-4 h-4" />
              Upload JD (PDF/DOCX/TXT)
            </span>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={async (e) => {
                const inputEl = e.currentTarget as HTMLInputElement
                const f = inputEl?.files?.[0]
                if (!f) return
                try {
                  // If PDF: handle entirely client-side to avoid server 415
                  if (f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")) {
                    const pdfjs = await loadPdfJs()
                    const ab = await f.arrayBuffer()
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
                    if (text) {
                      onChange(text)
                      return
                    }
                    // OCR (first 2 pages) for scanned PDFs
                    try {
                      const { recognize } = await import("tesseract.js")
                      let ocrText = ""
                      const pagesToScan = Math.min(doc.numPages || 0, 2)
                      for (let i = 1; i <= pagesToScan; i++) {
                        const page = await doc.getPage(i)
                        const viewport = page.getViewport({ scale: 2 })
                        const canvas = document.createElement("canvas")
                        canvas.width = viewport.width
                        canvas.height = viewport.height
                        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
                        await page.render({ canvasContext: ctx, viewport }).promise
                        const dataUrl = canvas.toDataURL("image/png")
                        const { data } = await recognize(dataUrl, "eng")
                        ocrText += ((data && data.text) || "") + "\n"
                      }
                      ocrText = ocrText.trim()
                      if (ocrText) {
                        onChange(ocrText)
                        return
                      }
                    } catch {}
                    throw new Error("Failed to extract JD")
                  }

                  // Non-PDF: use server (DOCX/TXT)
                  const fd = new FormData()
                  fd.append("file", f)
                  const res = await fetch("/api/extract-resume", { method: "POST", body: fd })
                  if (!res.ok) throw new Error("Failed to extract JD")
                  const data = await res.json()
                  onChange(data.text || "")
                } catch {
                  alert("Failed to extract text from JD. Please paste it manually.")
                } finally {
                  if (inputEl) inputEl.value = ""
                }
              }}
            />
          </label>
        </CardContent>
      </Card>

      <Card className="border-2 border-gray-200">
        <CardContent className="p-4">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste the job description here..."
            rows={12}
            className="resize-none border-0 p-0 focus-visible:ring-0"
          />
        </CardContent>
      </Card>

      <p className="text-sm text-gray-500">
        Include the full job description with requirements, responsibilities, and qualifications for the best analysis.
      </p>
    </div>
  )
}

