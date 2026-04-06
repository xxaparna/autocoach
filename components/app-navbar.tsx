"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { GraduationCap, FileText, LayoutGrid, Brain, Bell, Menu, X, Target, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import ModeToggle from "@/components/mode-toggle"

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/planner", label: "Planner", icon: GraduationCap },
  { href: "/planner/goals", label: "Goals", icon: Target },
  { href: "/planner/chat", label: "Study Chat", icon: MessageSquare },
  { href: "/resume-tools/builder", label: "Resume Builder", icon: FileText },
  { href: "/resume-tools/job-match", label: "Job Match", icon: Brain },
]

export function AppNavbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isHome = pathname === "/"

  // Close on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Target className="w-6 h-6 text-teal-600" />
            <div className="font-bold text-foreground">AutoCoach</div>
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {nav.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-2">
          <NotificationsToggle />
          <ModeToggle />
          <Link href="/login">
            <Button variant="outline" size="sm" className="bg-transparent">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <ModeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile panel */}
      <div
        id="mobile-nav"
        className={cn(
          "md:hidden overflow-hidden border-t border-border bg-background",
          open ? "max-h-[80vh]" : "max-h-0",
          "transition-[max-height] duration-300 ease-in-out",
        )}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col gap-1">
            {nav.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                    active ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200" : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>

          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-3">
            <NotificationsToggle />
            <Link href="/login" className="w-full">
              <Button variant="outline" size="sm" className="bg-transparent w-full">
                Sign In
              </Button>
            </Link>
            <Link href="/signup" className="w-full">
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 w-full">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

function NotificationsToggle() {
  const request = async () => {
    if (typeof window === "undefined") return
    if (!("Notification" in window)) return alert("Notifications not supported in this browser.")
    const perm = await Notification.requestPermission()
    if (perm === "granted") {
      new Notification("Notifications enabled", { body: "AutoCoach will send helpful reminders." })
    }
  }
  return (
    <Button variant="ghost" size="icon" onClick={request} aria-label="Enable notifications">
      <Bell className="w-5 h-5 text-muted-foreground" />
    </Button>
  )
}
