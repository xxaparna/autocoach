"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { problems } from "@/data/problems"
import { AppNavbar } from "@/components/app-navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeRunner } from "@/components/code-runner"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { ChevronLeft, Flame, CheckCircle2 } from "lucide-react"

export default function ProblemPage() {
  const { slug } = useParams<{ slug: string }>()
  const p = useMemo(() => problems.find((x) => x.slug === slug), [slug])
  const router = useRouter()
  const [solved, setSolved] = useLocalStorage<string[]>("coding_solved", [])
  const [code, setCode] = useState(p?.starter || "")
  const [lang, setLang] = useState<"javascript" | "python">("javascript")
  const [result, setResult] = useState<{ passed: number; total: number } | null>(null)

  useEffect(() => {
    if (p) setCode(p.starter)
  }, [p]) // Updated dependency to p

  if (!p) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppNavbar />
        <main className="container mx-auto px-4 py-6">Problem not found.</main>
      </div>
    )
  }

  const markSolved = () => {
    if (!result || result.passed !== result.total) return
    if (!solved.includes(p.slug)) setSolved([...solved, p.slug])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" className="bg-transparent" onClick={() => router.back()}>
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex items-center gap-2">
            {p.daily && (
              <Badge className="bg-emerald-100 text-emerald-800" variant="secondary">
                <Flame className="w-3 h-3 mr-1" /> Daily
              </Badge>
            )}
            <Badge
              className={
                p.difficulty === "Easy"
                  ? "bg-green-100 text-green-700"
                  : p.difficulty === "Medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
              }
              variant="secondary"
            >
              {p.difficulty}
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{p.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-gray-700 leading-relaxed">{p.statement}</div>
            <div className="flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Tabs value={lang} onValueChange={(v) => setLang(v as any)}>
              <TabsList>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python" disabled>
                  Python (coming soon)
                </TabsTrigger>
              </TabsList>
              <TabsContent value="javascript">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-72 font-mono text-sm border rounded p-3"
                />
              </TabsContent>
              <TabsContent value="python">
                <div className="text-sm text-gray-600">Python execution will be enabled soon.</div>
              </TabsContent>
            </Tabs>

            <CodeRunner
              code={code}
              functionName={p.functionName}
              tests={p.tests}
              onResult={(s) => setResult({ passed: s.passed, total: s.total })}
            />
            <div className="flex items-center gap-2">
              <Button variant="default" disabled={!result || result.passed !== result.total} onClick={markSolved}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark as Solved
              </Button>
              {result && (
                <span className="text-sm text-gray-600">
                  {result.passed}/{result.total} tests passed
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
