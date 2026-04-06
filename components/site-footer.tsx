"use client"

import Link from "next/link"
import { Github, Linkedin, Mail } from "lucide-react"

export default function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-border">
      <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">© {new Date().getFullYear()} AutoCoach</div>
        <div className="flex items-center gap-3">
          <Link href="mailto:contact@example.com" aria-label="Contact">
            <Mail className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
          </Link>
          <Link href="https://github.com/" target="_blank" aria-label="GitHub">
            <Github className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
          </Link>
          <Link href="https://www.linkedin.com/" target="_blank" aria-label="LinkedIn">
            <Linkedin className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
          </Link>
        </div>
      </div>
    </footer>
  )
}
