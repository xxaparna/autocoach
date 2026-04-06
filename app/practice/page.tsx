"use client"

import { AppNavbar } from "@/components/app-navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useMemo, useState } from "react"

type Q = { id: string; type: "aptitude" | "coding"; question: string; options?: string[]; answer: string }

const sample: Q[] = [
  { id: "q1", type: "aptitude", question: "What is 35% of 240?", options: ["72", "84", "96", "120"], answer: "84" },
  {
    id: "q2",
    type: "aptitude",
    question: "If a train travels 90 km in 1.5 hours, its speed is?",
    options: ["45 km/h", "60 km/h", "75 km/h", "90 km/h"],
    answer: "60 km/h",
  },
  {
    id: "q3",
    type: "coding",
    question: "Time complexity to find an element in a balanced BST?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    answer: "O(log n)",
  },
]

export default function PracticePage() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [startTime] = useState<number>(Date.now())
  const [submitted, setSubmitted] = useState(false)

  const stats = useMemo(() => {
    const total = sample.length
    const correct = sample.filter((q) => answers[q.id] === q.answer).length
    const accuracy = Math.round((correct / total) * 100)
    const speed = Math.round((Date.now() - startTime) / 1000) // seconds
    return { total, correct, accuracy, speed }
  }, [answers, submitted, startTime])

  const submit = () => setSubmitted(true)

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Aptitude & Coding Practice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sample.map((q) => (
              <div key={q.id} className="border rounded p-3 bg-white">
                <div className="font-medium">{q.question}</div>
                <div className="mt-2 grid sm:grid-cols-2 gap-2">
                  {q.options?.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 border rounded p-2 cursor-pointer">
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => setAnswers({ ...answers, [q.id]: opt })}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                {submitted && (
                  <div className="mt-2 text-sm">
                    {answers[q.id] === q.answer ? "✅ Correct" : `❌ Correct: ${q.answer}`}
                  </div>
                )}
              </div>
            ))}
            {!submitted ? (
              <Button onClick={submit}>Submit</Button>
            ) : (
              <div className="text-sm text-gray-600">Results below</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Analytics</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-4">
            <Stat label="Questions" value={stats.total} />
            <Stat label="Correct" value={stats.correct} />
            <Stat label="Accuracy" value={`${stats.accuracy}%`} />
            <Stat label="Time" value={`${stats.speed}s`} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-4 border rounded bg-white">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}
