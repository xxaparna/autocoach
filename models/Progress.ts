import mongoose, { Schema, Model, models } from "mongoose"

export interface IProgress {
  userId: string
  date: Date
  topic?: string
  summary: string
  source?: string // e.g., "note", "pdf", "manual"
  createdAt: Date
  updatedAt: Date
}

const ProgressSchema = new Schema<IProgress>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: Date, default: () => new Date(), index: true },
    topic: { type: String, trim: true },
    summary: { type: String, required: true },
    source: { type: String, trim: true },
  },
  { timestamps: true, collection: "Progress" },
)

export const Progress: Model<IProgress> = (models.Progress as Model<IProgress>) || mongoose.model<IProgress>("Progress", ProgressSchema)
