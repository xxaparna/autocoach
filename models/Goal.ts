import mongoose, { Schema, Model, models } from "mongoose"

export type GoalStatus = "not_started" | "in_progress" | "completed"

export interface IGoal {
  userId: string
  title: string
  description?: string
  targetDate?: Date
  status: GoalStatus
  subtasks?: { title: string; done: boolean }[]
  createdAt: Date
  updatedAt: Date
}

const GoalSchema = new Schema<IGoal>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    targetDate: { type: Date },
    status: { type: String, enum: ["not_started", "in_progress", "completed"], default: "not_started", index: true },
    subtasks: [
      new Schema(
        {
          title: { type: String, required: true, trim: true },
          done: { type: Boolean, default: false },
        },
        { _id: false },
      ),
    ],
  },
  { timestamps: true, collection: "Goals" },
)

export const Goal: Model<IGoal> = (models.Goal as Model<IGoal>) || mongoose.model<IGoal>("Goal", GoalSchema)
