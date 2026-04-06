import mongoose, { Schema, Model, models } from "mongoose"

export interface IMessage {
  userId: string
  role: "user" | "assistant"
  content: string
  conversationId?: string
  createdAt: Date
  updatedAt: Date
}

const MessageSchema = new Schema<IMessage>(
  {
    userId: { type: String, required: true, index: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    conversationId: { type: String, index: true },
  },
  { timestamps: true, collection: "Messages" },
)

export const Message: Model<IMessage> = (models.Message as Model<IMessage>) || mongoose.model<IMessage>("Message", MessageSchema)
