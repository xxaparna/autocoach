import mongoose, { Schema, Model, models } from "mongoose"

export interface ISyllabusTopic {
  title: string
  description?: string
  status?: "not_started" | "in_progress" | "completed"
}

export interface ISyllabus {
  userId: string
  topics: ISyllabusTopic[]
  updatedAt: Date
  createdAt: Date
}

const SyllabusTopicSchema = new Schema<ISyllabusTopic>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ["not_started", "in_progress", "completed"], default: "not_started" },
  },
  { _id: false },
)

const SyllabusSchema = new Schema<ISyllabus>(
  {
    userId: { type: String, required: true, index: true },
    topics: { type: [SyllabusTopicSchema], default: [] },
  },
  { timestamps: true, collection: "Syllabus" },
)

export const Syllabus: Model<ISyllabus> = (models.Syllabus as Model<ISyllabus>) || mongoose.model<ISyllabus>("Syllabus", SyllabusSchema)
