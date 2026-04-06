"use client"

import Link from "next/link"
import { AppNavbar } from "@/components/app-navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { problems } from "@/data/problems"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useMemo, useState } from "react"
import { Search, Star } from "lucide-react"

export default function CodingDashboard() {
  const [solved, setSolved] = useLocalStorage<string[]>("coding_solved", [])
  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<"All" | "Solved" | "Unsolved" | "New">("All")

  const list = useMemo(() => {
    let arr = problems
    if (tab === "Solved") arr = arr.filter((p) => solved.includes(p.slug))
    if (tab === "Unsolved") arr = arr.filter((p) => !solved.includes(p.slug))
    if (tab === "New") arr = arr.slice(-5)
    if (query.trim()) {
      const q = query.toLowerCase()
      arr = arr.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q),
      )
    }
    return arr
  }, [query, tab, solved])

  const solvedToday = solved.length

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-teal-600/90 text-white">
              <div className="max-w-7xl mx-auto px-6 py-6">
                <h1 className="text-3xl font-bold">Coding Problems</h1>
                <p className="text-white/90">Master algorithms and data structures through interactive challenges.</p>
                <div className="grid sm:grid-cols-3 gap-4 mt-4">
                  <Metric label="Problems" value={problems.length} />
                  <Metric label="Solved" value={solved.length} />
                  <Metric label="Daily Generations" value={3} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-4">
          <FeatureCard title="JavaScript & Python" desc="Solve problems with syntax highlighting." />
          <FeatureCard title="Track Progress" desc="Mark problems as solved and track your journey." />
          <FeatureCard title="Top Rated Problems" desc="Challenge yourself with our highest-rated tasks." />
        </div>

        {problems.find((p) => p.daily) && (
          <Card>
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
              <div>
                <div className="text-sm text-gray-600">Question of the Day</div>
                <div className="text-xl font-semibold">{problems.find((p) => p.daily)?.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">Medium</Badge>
                  <span className="text-gray-500">Linked List • Merge</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Solved Today</div>
                  <div className="text-2xl font-bold">{solvedToday}</div>
                </div>
                <Link href={`/coding/${problems.find((p) => p.daily)!.slug}`}>
                  <Button>Start Solving</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Search problems by title or tag..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList>
              <TabsTrigger value="All">All</TabsTrigger>
              <TabsTrigger value="Solved">Solved</TabsTrigger>
              <TabsTrigger value="Unsolved">Unsolved</TabsTrigger>
              <TabsTrigger value="New">New</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">#</th>
                  <th className="text-left p-3">Title</th>
                  <th className="text-left p-3">Difficulty</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-left p-3">Tags</th>
                  <th className="text-left p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => {
                  const isSolved = solved.includes(p.slug)
                  return (
                    <tr key={p.slug} className="border-t">
                      <td className="p-3">{isSolved ? "✅" : "-"}</td>
                      <td className="p-3">{p.id}</td>
                      <td className="p-3 font-medium">{p.title}</td>
                      <td className="p-3">
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
                      </td>
                      <td className="p-3 text-gray-700">{p.category}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {p.tags.map((t) => (
                            <Badge key={t} variant="secondary">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <Link href={`/coding/${p.slug}`}>
                          <Button size="sm" variant="outline" className="bg-transparent">
                            Solve
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-gray-600">{desc}</CardContent>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-teal-700/40 rounded-lg p-4">
      <div className="text-teal-100 text-sm">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}
