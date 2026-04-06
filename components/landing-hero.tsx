"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sparkles, Brain, MessageSquare, Play } from "lucide-react"

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-600 text-white">
      <div className="absolute inset-0 opacity-30 pointer-events-none" aria-hidden>
        <div className="absolute -top-16 -left-16 h-64 w-64 rounded-full bg-emerald-400 blur-3xl" />
        <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-teal-300 blur-3xl" />
      </div>
      <div className="relative px-6 sm:px-10 py-14 sm:py-20">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" /> AutoCoach — Where Learning Meets Intelligence
          </div>
          <h1 className="mt-4 text-3xl sm:text-5xl font-bold leading-tight">
            Study smarter with your AI-powered Study Buddy
          </h1>
          <p className="mt-3 max-w-2xl text-white/85">
            Plan, track, and learn effectively with contextual coaching, PDF notes summarization, and real-time chat assistance.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-white/90">
                <Play className="w-4 h-4 mr-2" /> Get Started
              </Button>
            </Link>
            <Link href="/planner/chat">
              <Button size="lg" variant="outline" className="bg-transparent border-white/50 text-white hover:bg-white/10">
                <MessageSquare className="w-4 h-4 mr-2" /> Try Study Chat
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex items-center gap-4 text-sm text-white/80">
            <div className="inline-flex items-center gap-2"><Brain className="w-4 h-4" /> Gemini-powered assistant</div>
            <div>PDF notes summarization</div>
            <div>Planner & Goals</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
