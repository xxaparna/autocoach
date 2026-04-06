"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, TrendingUp, Target, Lightbulb, Award, AlertTriangle } from "lucide-react"
import type { AnalysisResult } from "@/app/page"

interface AnalysisResultsProps {
  result: AnalysisResult
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getMatchBgColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-100"
    if (percentage >= 60) return "bg-yellow-100"
    return "bg-red-100"
  }

  return (
    <div className="space-y-6">
      {/* Overall Match Score */}
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Target className="w-6 h-6" />
            <span>Overall Match Score</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className={`text-6xl font-bold mb-4 ${getMatchColor(result.matchPercentage)}`}>
            {result.matchPercentage}%
          </div>
          <Progress value={result.matchPercentage} className="w-full max-w-md mx-auto mb-4" />
          <p className="text-gray-600 max-w-2xl mx-auto">{result.overallFeedback}</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Matched Skills */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span>Matched Skills ({result.matchedSkills.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.matchedSkills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                  {skill}
                </Badge>
              ))}
            </div>
            {result.matchedSkills.length === 0 && <p className="text-gray-500 italic">No matching skills found</p>}
          </CardContent>
        </Card>

        {/* Missing Skills */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-700">
              <XCircle className="w-5 h-5" />
              <span>Missing Skills ({result.missingSkills.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.missingSkills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-red-100 text-red-800">
                  {skill}
                </Badge>
              ))}
            </div>
            {result.missingSkills.length === 0 && <p className="text-gray-500 italic">No missing skills identified</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Resume Strengths */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-700">
              <Award className="w-5 h-5" />
              <span>Resume Strengths</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.resumeStrengths.map((strength, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Improvement Areas */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-700">
              <AlertTriangle className="w-5 h-5" />
              <span>Areas for Improvement</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.improvementAreas.map((area, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <TrendingUp className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{area}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-700">
            <Lightbulb className="w-5 h-5" />
            <span>Tailored Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {result.recommendations.map((recommendation, index) => (
              <div key={index} className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <p className="text-gray-800">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
