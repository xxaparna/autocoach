"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export default function FeatureCard({ title, description, Icon }: { title: string; description: string; Icon: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "group relative rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow",
        "dark:bg-card"
      )}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/0 via-teal-500/0 to-sky-500/0 group-hover:from-emerald-500/5 group-hover:to-sky-500/5 transition-colors" />
      <div className="relative flex items-start gap-3">
        <div className="rounded-lg bg-emerald-50 text-emerald-700 p-2 ring-1 ring-emerald-100">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-muted-foreground mt-1">{description}</div>
        </div>
      </div>
    </motion.div>
  )
}
