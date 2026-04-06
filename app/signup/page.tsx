"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppNavbar } from "@/components/app-navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Signup failed")
      // Success -> redirect to dashboard
      router.push("/dashboard")
    } catch (err: any) {
      alert(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create your account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700">
                  {loading ? "Creating..." : "Create account"}
                </Button>
              </form>

              <div className="my-4 flex items-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="grid gap-2">
                <Button type="button" variant="outline" className="w-full" disabled>
                  Continue with Google (coming soon)
                </Button>
                <Button type="button" variant="outline" className="w-full" disabled>
                  Continue with GitHub (coming soon)
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                Already have an account? {" "}
                <Link href="/login" className="text-teal-700 hover:underline">Sign in</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
