"use client"

import { useState, useEffect } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"

export function useWelcomePrompt() {
  const [hasSeenWelcome, setHasSeenWelcome] = useLocalStorage("ac_welcome_seen", false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [preferredBuddy, setPreferredBuddy] = useLocalStorage<"career" | "study" | null>("ac_preferred_buddy", null)

  useEffect(() => {
    // Show welcome prompt if user hasn't seen it yet
    if (!hasSeenWelcome) {
      // Add a small delay for better UX
      const timer = setTimeout(() => {
        setShowWelcome(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [hasSeenWelcome])

  const handleChooseBuddy = (buddy: "career" | "study") => {
    setPreferredBuddy(buddy)
    setHasSeenWelcome(true)
    setShowWelcome(false)
  }

  const handleCloseWelcome = () => {
    setHasSeenWelcome(true)
    setShowWelcome(false)
  }

  const resetWelcome = () => {
    setHasSeenWelcome(false)
    setPreferredBuddy(null)
  }

  return {
    showWelcome,
    preferredBuddy,
    handleChooseBuddy,
    handleCloseWelcome,
    resetWelcome,
  }
}
