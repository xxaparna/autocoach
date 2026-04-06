export interface AnalysisResult {
  matchPercentage: number
  matchedSkills: string[]
  missingSkills: string[]
  recommendations: string[]
  overallFeedback: string
  resumeStrengths: string[]
  improvementAreas: string[]
}
