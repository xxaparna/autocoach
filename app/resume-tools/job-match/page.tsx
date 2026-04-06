"use client"

import { useState } from "react"
import { AppNavbar } from "@/components/app-navbar"
import { UploadSection } from "@/components/upload-section"
import { JobDescriptionInput } from "@/components/job-description-input"
import { AnalysisResults } from "@/components/analysis-results"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Zap } from "lucide-react"
import type { AnalysisResult } from "@/components/types"

export default function JobMatchPage() {
  const [resumeText, setResumeText] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [role, setRole] = useState("")
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    if (!resumeText || !jobDescription) {
      alert("Please upload a resume and enter a job description")
      return
    }
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: resumeText, jobDescription, role }),
      })
      if (!response.ok) throw new Error("Analysis failed")
      const result = await response.json()
      setAnalysisResult(result)
    } catch (e) {
      alert("Analysis failed. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setResumeText("")
    setJobDescription("")
    setRole("")
    setAnalysisResult(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <main className="container mx-auto px-4 py-8">
        {!analysisResult ? (
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <UploadSection onResumeExtracted={setResumeText} />
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <JobDescriptionInput value={jobDescription} onChange={setJobDescription} role={role} onRoleChange={setRole} />
                </CardContent>
              </Card>
            </div>
            <div className="text-center">
              <Button
                onClick={handleAnalyze}
                disabled={!resumeText || !jobDescription || isAnalyzing}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Analyze Match
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 text-center">
              <Button onClick={handleReset} variant="outline" className="mb-4 bg-transparent">
                Analyze Another
              </Button>
            </div>
            <AnalysisResults result={analysisResult} />
          </div>
        )}
      </main>
    </div>
  )
}

