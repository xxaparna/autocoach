import mongoose, { Schema, Model, models } from "mongoose"

export interface IJobAnalysis {
  userId: string
  createdAt: Date
  updatedAt: Date
  matchPercentage: number
  matchedSkills: string[]
  missingSkills: string[]
  recommendations: string[]
  overallFeedback: string
  resumeStrengths: string[]
  improvementAreas: string[]
}

const JobAnalysisSchema = new Schema<IJobAnalysis>(
  {
    userId: { type: String, required: true, index: true },
    matchPercentage: { type: Number, required: true },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    overallFeedback: { type: String, default: "" },
    resumeStrengths: { type: [String], default: [] },
    improvementAreas: { type: [String], default: [] },
  },
  { timestamps: true, collection: "JobAnalysis" },
)

export const JobAnalysis: Model<IJobAnalysis> = (models.JobAnalysis as Model<IJobAnalysis>) || mongoose.model<IJobAnalysis>("JobAnalysis", JobAnalysisSchema)
