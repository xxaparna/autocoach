"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { AppNavbar } from "@/components/app-navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AnimatePresence, motion } from "framer-motion"
import {
  CalendarDays,
  FileCheck2,
  FileText,
  Target,
  Rocket,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Mail,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react"

type Feature = {
  title: string
  desc: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  pills: string[]
}

const features: Feature[] = [
  {
    title: "ATS Resume Analyzer",
    desc: "Optimize your resume for ATS with AI-powered scoring and keyword matching.",
    href: "/placement",
    icon: FileCheck2,
    pills: ["ATS Score", "Keyword Match vs JD", "Formatting Suggestions", "Actionable Tips"],
  },
  {
    title: "Resume Builder",
    desc: "Create professional, ATS-friendly resumes with smart suggestions and live preview.",
    href: "/resume-tools/builder",
    icon: FileText,
    pills: ["Modern Templates", "Smart Suggestions", "Quantify Achievements", "PDF/DOCX Export"],
  },
  {
    title: "Job Match (AI)",
    desc: "Match your resume to any job description and see strengths, gaps, and improvements.",
    href: "/resume-tools/job-match",
    icon: Target,
    pills: ["Match %", "Matched & Missing Skills", "Tailored Recommendations", "Overall Feedback"],
  },
  {
    title: "Study Planner",
    desc: "Upload syllabus and get adaptive weekly plans with automatic rescheduling.",
    href: "/planner",
    icon: CalendarDays,
    pills: ["CSV/XLSX Import", "Adaptive Plan", "Missed-session Rebalance", "Progress Dashboard"],
  },
]

const faqs = [
  {
    question: "How does the ATS Resume Analyzer work?",
    answer:
      "Our AI scans your resume against job descriptions to identify missing keywords, formatting issues, and content gaps. You get a detailed score and actionable recommendations to improve your chances.",
  },
  {
    question: "Can I export my resume in different formats?",
    answer:
      "Yes! The Resume Builder supports PDF, DOCX, and other formats. You can also download multiple versions optimized for different roles.",
  },
  {
    question: "How accurate is the Job Match AI?",
    answer:
      "Our Job Match uses advanced NLP to analyze both your resume and job description. It achieves 94% accuracy in identifying skill gaps and matches.",
  },
  {
    question: "Is there a free trial available?",
    answer: "Start with our free trial to access all core features. No credit card required.",
  },
]

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [email, setEmail] = useState("")
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return
    const alreadyShown = sessionStorage.getItem("introShown") === "1"
    if (alreadyShown) {
      setShowIntro(false)
      return
    }
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const duration = reduceMotion ? 300 : 2200
    const t = setTimeout(() => {
      setShowIntro(false)
      sessionStorage.setItem("introShown", "1")
    }, duration)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-white"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col items-center gap-4 p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-teal-600/10 flex items-center justify-center">
                <Rocket className="w-7 h-7 text-teal-700 animate-pulse" />
              </div>
              <div>
                <div className="text-2xl font-extrabold tracking-tight text-teal-700">AutoCoach</div>
                <div className="text-sm text-teal-800/70">Smart Learning Starts Here</div>
              </div>
              <div className="w-40 h-1.5 rounded-full bg-teal-100 overflow-hidden">
                <motion.div
                  className="h-full bg-teal-600"
                  initial={{ x: "-100%" }}
                  animate={{ x: ["-100%", "0%", "100%"] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AppNavbar />
      <main className="container mx-auto px-4">
        {/* Hero Section with Animation */}
        <motion.section
          className="py-20 md:py-32 flex flex-col items-center text-center max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: showIntro ? 0 : 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full bg-teal-100 text-teal-700 px-3 py-1 text-sm mb-4">
            <Sparkles className="w-3 h-3" /> AutoCoach 2.0 · AI Platform
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Build. Match. Grow — All in One Place.
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            Build ATS-ready resumes, match to jobs with AI, and plan your studies with confidence.
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link href="/signup">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8 gap-2 group">
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="px-8 bg-transparent hover:bg-teal-50">
                Explore Features
              </Button>
            </Link>
          </motion.div>

          {/* Animated Stats
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-12">
            <StatCard label="Active Users" value="10K+" icon={Users} />
            <StatCard label="Resumes Built" value="50K+" icon={FileText} />
            <StatCard label="Job Matches" value="100K+" icon={Target} />
            <StatCard label="Success Rate" value="94%" icon={TrendingUp} />
          </div> */}

          
        </motion.section>

        {/* Key Features Highlights */}
        <section id="features" className="py-10 md:py-14 pro-section">
          <div className="grid md:grid-cols-3 gap-4">
            <HighlightCard
              title="Resume Builder"
              desc="Create professional, ATS-optimized resumes with live preview."
              href="/resume-tools/builder"
              icon={FileText}
            />
            <HighlightCard
              title="Job Match"
              desc="Match your resume to any JD and get tailored improvements."
              href="/resume-tools/job-match"
              icon={Target}
            />
            <HighlightCard
              title="Study Planner"
              desc="Import syllabus and get adaptive, trackable plans."
              href="/planner"
              icon={CalendarDays}
            />
          </div>
        </section>

        {/* Social Proof - Testimonials */}
        <section className="py-12 border-y border-border mb-12">
          <div className="text-center mb-8">
            <p className="text-sm text-teal-600 font-semibold">TRUSTED BY THOUSANDS</p>
            <h2 className="text-2xl md:text-3xl font-bold mt-2">Hear from Our Users</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              quote="AutoCoach helped me land my dream job. The job matching feature identified gaps I didn't know I had."
              author="Ridhima"
              role="CSE undergrad"
              avatar="SC"
            />
            <TestimonialCard
              quote="The study planner adapted perfectly to my schedule. I completed my preparation 2 weeks early!"
              author="Anish"
              role="Web developer intern"
              avatar="RP"
            />
            <TestimonialCard
              quote="The ATS analyzer improved my resume visibility by 40%. Highly recommended!"
              author="Kaira"
              role="Student"
              avatar="EW"
            />
          </div>
        </section>

        

        {/* How It Works */}
        <section className="py-20 bg-teal-50/50 -mx-4 px-4 rounded-3xl mb-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm text-teal-600 font-semibold mb-2">OUR PROCESS</p>
              <h2 className="text-3xl md:text-4xl font-bold">How It Works in 3 Steps</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <StepCard
                step={1}
                title="Create Your Profile"
                desc="Sign up and tell us about your career goals and study needs"
                icon={Users}
              />
              <div className="hidden md:flex items-center justify-center">
                <div className="h-1 w-full bg-teal-200" />
              </div>
              <StepCard
                step={2}
                title="Get Personalized Insights"
                desc="Upload your resume and get AI-powered analysis and recommendations"
                icon={Sparkles}
              />
              <div className="hidden md:flex items-center justify-center">
                <div className="h-1 w-full bg-teal-200" />
              </div>
              <StepCard
                step={3}
                title="Execute & Succeed"
                desc="Follow our adaptive plans and track your progress to success"
                icon={TrendingUp}
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 mb-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm text-teal-600 font-semibold mb-2">QUESTIONS?</p>
              <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-border rounded-lg overflow-hidden transition-all">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 hover:bg-teal-50 transition-colors"
                  >
                    <span className="font-semibold text-left">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-teal-600 transition-transform ${openFaq === idx ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 py-4 bg-teal-50/50 border-t border-border text-muted-foreground">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        

        {/* Footer */}
        <footer className="border-t border-border py-12 mt-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">© 2025 AutoCoach. All rights reserved.</p>
            <p className="text-sm text-muted-foreground">Built with Next.js and powered by AI</p>
          </div>
        </footer>
      </main>
    </div>
  )
}

function FeatureCard({ feature, delay }: { feature: Feature; delay: number }) {
  const Icon = feature.icon
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: delay * 0.05 }}>
      <Card
        className="border-0 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 bg-card group cursor-pointer"
      >
        <CardHeader className="flex flex-row items-start gap-4">
          <div className="shrink-0 rounded-xl bg-teal-600/10 p-3 group-hover:bg-teal-600/20 transition-colors">
            <Icon className="w-6 h-6 text-teal-700" />
          </div>
          <div className="space-y-1 flex-1">
            <CardTitle className="text-foreground group-hover:text-teal-700 transition-colors">{feature.title}</CardTitle>
            <p className="text-muted-foreground text-sm">{feature.desc}</p>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid sm:grid-cols-2 gap-2 mb-4">
            {feature.pills.map((p) => (
              <div
                key={p}
                className="inline-flex items-center gap-2 rounded-md bg-teal-50 px-3 py-2 text-xs text-teal-700 group-hover:bg-teal-100 transition-colors"
              >
                <CheckCircle2 className="w-3 h-3" />
                {p}
              </div>
            ))}
          </div>
          <Link href={feature.href}>
            <Button variant="outline" className="bg-transparent w-full group-hover:bg-teal-50">
              Learn More
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }}
      className="p-4 rounded-lg border border-border bg-card hover:border-teal-300 transition-colors">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-teal-600" />
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-2xl font-bold text-foreground">{value}</div>
        </div>
      </div>
    </motion.div>
  )
}

function HighlightCard({
  title,
  desc,
  href,
  icon: Icon,
}: {
  title: string
  desc: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      <Link href={href}>
        <Card className="h-full border bg-white hover:shadow-md transition-shadow pro-card">
          <CardContent className="p-5 flex items-start gap-3">
            <div className="rounded-lg bg-teal-50 p-3">
              <Icon className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <div className="font-semibold text-foreground">{title}</div>
              <div className="text-sm text-muted-foreground">{desc}</div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

function TestimonialCard({
  quote,
  author,
  role,
  avatar,
}: {
  quote: string
  author: string
  role: string
  avatar: string
}) {
  return (
    <Card className="border-0 shadow-sm bg-card hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-yellow-400">
              ★
            </span>
          ))}
        </div>
        <p className="text-muted-foreground mb-4 italic">"{quote}"</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
            {avatar}
          </div>
          <div>
            <div className="font-semibold text-foreground">{author}</div>
            <div className="text-sm text-muted-foreground">{role}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StepCard({
  step,
  title,
  desc,
  icon: Icon,
}: {
  step: number
  title: string
  desc: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}) {
  return (
    <div className="relative">
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">
        {step}
      </div>
      <Card className="border-0 shadow-sm bg-white mt-4 hover:shadow-md transition-shadow">
        <CardContent className="pt-8 pb-6">
          <div className="flex justify-center mb-4">
            <Icon className="w-8 h-8 text-teal-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2 text-foreground text-center">{title}</h3>
          <p className="text-muted-foreground text-sm text-center">{desc}</p>
        </CardContent>
      </Card>
    </div>
  )
}
