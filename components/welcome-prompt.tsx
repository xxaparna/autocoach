"use client"

import React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import {
  Briefcase,
  GraduationCap,
  FileText,
  Target,
  ShieldCheck,
  CalendarDays,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"

interface WelcomePromptProps {
  open: boolean
  onClose: () => void
  onChoose: (buddy: "career" | "study") => void
}

export function WelcomePrompt({ open, onClose, onChoose }: WelcomePromptProps) {
  const [selectedBuddy, setSelectedBuddy] = useState<"career" | "study" | null>(null)
  const [dontShow, setDontShow] = useState(false)
  const router = useRouter()
  const firstTileRef = useRef<HTMLDivElement | null>(null)

  const handleChoose = (buddy: "career" | "study") => {
    setSelectedBuddy(buddy)
    onChoose(buddy)

    // Navigate to the appropriate section
    if (buddy === "career") {
      router.push("/resume-tools/job-match")
    } else {
      router.push("/planner")
    }

    // Close after a brief delay to show selection
    setTimeout(() => {
      onClose()
    }, 800)
  }

  useEffect(() => {
    if (open && firstTileRef.current) {
      firstTileRef.current.focus()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl md:max-h-[80vh] p-0 overflow-hidden rounded-xl border-0 shadow-xl">
        <div className="bg-white">
          <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 px-6 py-6 text-white">
            <DialogHeader className="text-center">
              <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <DialogTitle className="text-2xl font-extrabold mb-1">Choose your AI Buddy</DialogTitle>
                <DialogDescription className="text-white/85 text-sm">Personalize your experience for career growth or academic success</DialogDescription>
              </motion.div>
            </DialogHeader>
          </div>

          {/* Scrollable content area so actions remain reachable */}
          <div className="p-5 md:p-6 overflow-y-auto max-h-[calc(80vh-96px)] pb-16">
            <div className="grid md:grid-cols-2 gap-4">
              <AnimatePresence>
                <motion.div
                  key="career-tile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                >
                  <BuddyCard
                    ref={firstTileRef}
                    type="career"
                    title="Career Buddy"
                    subtitle="Land your dream job"
                    description="Build a standout resume and match with jobs using AI"
                    icon={Briefcase}
                    gradient="from-blue-600 to-purple-600"
                    features={[
                      { icon: FileText, label: "Resume Builder", desc: "Create ATS-friendly resumes" },
                      { icon: Target, label: "Job Match AI", desc: "Match skills to job descriptions" },
                      { icon: ShieldCheck, label: "Resume Analysis", desc: "Get personalized feedback" },
                    ]}
                    selected={selectedBuddy === "career"}
                    onSelect={() => handleChoose("career")}
                  />
                </motion.div>

                <motion.div
                  key="study-tile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.08 }}
                >
                  <BuddyCard
                    type="study"
                    title="Study Buddy"
                    subtitle="Master your academics"
                    description="Get adaptive plans, track progress, and hit your goals"
                    icon={GraduationCap}
                    gradient="from-teal-600 to-emerald-600"
                    features={[
                      { icon: CalendarDays, label: "Study Planner", desc: "Adaptive weekly" },
                      { icon: FileText, label: "Progress Tracking", desc: "Monitor" },
                      { icon: Target, label: "Goal Setting", desc: "Achieve goals" },
                    ]}
                    selected={selectedBuddy === "study"}
                    onSelect={() => handleChoose("study")}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Sticky controls to keep Skip/Don't show visible */}
            <div className="mt-4 flex flex-col items-center gap-2 sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 py-3">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Checkbox checked={dontShow} onCheckedChange={(v) => setDontShow(!!v)} />
                Don’t show again
              </label>
              <p className="text-[11px] text-muted-foreground text-center">
                You can switch assistants anytime from the dashboard.
              </p>
              <Button variant="ghost" onClick={onClose} className="text-gray-600 hover:text-gray-900 h-8 px-3 text-sm">
                Skip for now
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface BuddyCardProps {
  type: "career" | "study"
  title: string
  subtitle: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  features: Array<{
    icon: React.ComponentType<{ className?: string }>
    label: string
    desc: string
  }>
  selected: boolean
  onSelect: () => void
}

const BuddyCard = React.forwardRef<HTMLDivElement, BuddyCardProps>(function BuddyCard(
  {
    type,
    title,
    subtitle,
    description,
    icon: Icon,
    gradient,
    features,
    selected,
    onSelect,
  },
  ref,
) {
  return (
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="h-full outline-none" tabIndex={0} ref={ref}>
      <Card
        role="button"
        aria-label={`Select ${title}`}
        className={`h-full cursor-pointer transition-all duration-300 ${
          selected
            ? "ring-2 ring-offset-2 ring-teal-500 shadow-xl"
            : "hover:shadow-lg border-2 border-transparent hover:border-gray-200"
        }`}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onSelect()
          }
        }}
      >
        <CardHeader className="text-center pb-3">
          <div
            className={`w-12 h-12 mx-auto rounded-2xl bg-gradient-to-r ${gradient} flex items-center justify-center mb-3 shadow-md`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-lg font-bold text-gray-900">{title}</CardTitle>
          <Badge variant="secondary" className="mx-auto text-xs">
            {subtitle}
          </Badge>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {features.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.06 }}
                className="inline-flex items-center gap-2 rounded-md bg-gray-50 px-2.5 py-2 text-xs text-gray-800 hover:bg-gray-100"
              >
                <div className={`p-1.5 rounded-md bg-gradient-to-r ${gradient}`}>
                  <feature.icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-medium">{feature.label}</span>
              </motion.div>
            ))}
          </div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-4">
            <Button
              className={`w-full h-9 text-sm bg-gradient-to-r ${gradient} hover:opacity-90 text-white font-medium`}
              onClick={(e) => {
                e.stopPropagation()
                onSelect()
              }}
            >
              {selected ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Selected!
                </>
              ) : (
                <>
                  Choose {title}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
})
