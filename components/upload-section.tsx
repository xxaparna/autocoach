"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, X, Check } from "lucide-react"

interface UploadSectionProps {
  onResumeExtracted: (text: string) => void
}

export function UploadSection({ onResumeExtracted }: UploadSectionProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState("")
  const [isExtracting, setIsExtracting] = useState(false)

  const loadPdfJs = async () => {
    if (typeof window === "undefined") return null
    const w = window as any
    if (w.pdfjsLib) return w.pdfjsLib
    // Load legacy UMD build from CDN to avoid bundling issues
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

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setUploadedFile(file)
      setIsExtracting(true)

      try {
        // If PDF: parse entirely on client first (more reliable), skip server
        if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
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
          if (text) {
            setResumeText(text)
            onResumeExtracted(text)
            return
          }
          // Try OCR (first 3 pages) for scanned PDFs
          try {
            let ocrText = ""
            const pagesToScan = Math.min(doc.numPages || 0, 3)
            const Tesseract = (await import("tesseract.js")) as any
            for (let i = 1; i <= pagesToScan; i++) {
              const page = await doc.getPage(i)
              const viewport = page.getViewport({ scale: 2 })
              const canvas = document.createElement("canvas")
              canvas.width = viewport.width
              canvas.height = viewport.height
              const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
              await page.render({ canvasContext: ctx, viewport }).promise
              const dataUrl = canvas.toDataURL("image/png")
              const { data } = await Tesseract.recognize(dataUrl, "eng")
              ocrText += ((data && data.text) || "") + "\n"
            }
            ocrText = ocrText.trim()
            if (ocrText) {
              setResumeText(ocrText)
              onResumeExtracted(ocrText)
              return
            }
          } catch {}
          throw new Error("PDF text could not be extracted. Please paste text manually or try another file.")
        }

        // Non-PDF: use server endpoint (DOCX/TXT)
        const formData = new FormData()
        formData.append("file", file)
        const response = await fetch("/api/extract-resume", { method: "POST", body: formData })
        if (!response.ok) throw new Error("Failed to extract text from resume")
        const { text } = await response.json()
        setResumeText(text)
        onResumeExtracted(text)
      } catch (error) {
        console.error("Error extracting resume:", error)
        alert("Failed to extract text from resume. Please try again or paste the text manually.")
      } finally {
        setIsExtracting(false)
      }
    },
    [onResumeExtracted],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
  })

  const handleTextChange = (text: string) => {
    setResumeText(text)
    onResumeExtracted(text)
  }

  const clearFile = () => {
    setUploadedFile(null)
    setResumeText("")
    onResumeExtracted("")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Upload Resume</h2>
        {uploadedFile && (
          <Button variant="ghost" size="sm" onClick={clearFile}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {!uploadedFile ? (
        <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={`text-center cursor-pointer ${isDragActive ? "text-blue-600" : "text-gray-500"}`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">
                {isDragActive ? "Drop your resume here" : "Upload your resume"}
              </p>
              <p className="text-sm text-gray-500 mb-4">Supports PDF, DOC, DOCX, and TXT files</p>
              <Button variant="outline">Choose File</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              {isExtracting ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              ) : (
                <Check className="w-6 h-6 text-green-600" />
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900">{uploadedFile.name}</span>
                </div>
                <p className="text-sm text-gray-500">
                  {isExtracting ? "Extracting text..." : "Text extracted successfully"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Resume Text {uploadedFile ? "(Extracted)" : "(Paste manually)"}
        </label>
        <Textarea
          value={resumeText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Paste your resume text here or upload a file above..."
          rows={8}
          className="resize-none"
        />
      </div>
    </div>
  )
}
