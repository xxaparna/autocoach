"use client"

import { AppNavbar } from "@/components/app-navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShieldCheck, AlertTriangle, FileText, Briefcase } from "lucide-react"
import { computeAtsScore } from "@/utils/resume-ats"

export default function PlacementPage() {
  const [resumeText, setResumeText] = useState("")
  const [jobText, setJobText] = useState("")
  const ats = useMemo(() => computeAtsScore(resumeText, jobText), [resumeText, jobText])

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                ATS Resume Analyzer
              </CardTitle>
              <Link href="/resume-tools/job-match">
                <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                  <Briefcase className="w-4 h-4" />
                  Match with JD
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Resume Text
                </label>
                <textarea
                  className="mt-1 w-full border rounded p-3 h-40"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume content..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Job Description (optional)</label>
                <textarea
                  className="mt-1 w-full border rounded p-3 h-32"
                  value={jobText}
                  onChange={(e) => setJobText(e.target.value)}
                  placeholder="Paste the job description to tailor analysis..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ATS Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{ats.score}</div>
              <Progress value={ats.score} className="mb-3" />
              <div className="space-y-2">
                <div className="text-sm text-gray-600">Keywords matched</div>
                <div className="flex flex-wrap gap-2">
                  {ats.matched.slice(0, 12).map((k, i) => (
                    <Badge key={i} variant="secondary">
                      {k}
                    </Badge>
                  ))}
                </div>
                <div className="mt-3 text-sm text-gray-600">Missing</div>
                <div className="flex flex-wrap gap-2">
                  {ats.missing.slice(0, 12).map((k, i) => (
                    <Badge key={i} className="bg-red-100 text-red-800" variant="secondary">
                      {k}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {ats.recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
