"use client"

import { useState } from "react"

export default function GeminiDevTestPage() {
  const [apiKey, setApiKey] = useState("")
  const [query, setQuery] = useState("Return {\"ok\":true,\"from\":\"gemini-2.5-flash\"}")
  const [resume, setResume] = useState("Senior React developer, 5y exp. JS, TS, Next.js, Tailwind.")
  const [jd, setJd] = useState("Frontend Engineer with React/Next.js experience.")
  const [role, setRole] = useState("Frontend Engineer")
  const [out, setOut] = useState<string>("")

  const callTest = async () => {
    setOut("Running /api/gemini-test ...")
    try {
      const res = await fetch(`/api/gemini-test?q=${encodeURIComponent(query)}`, {
        headers: apiKey ? { "x-ggai-key": apiKey } : undefined,
      })
      const data = await res.json()
      setOut(JSON.stringify({ status: res.status, data }, null, 2))
    } catch (e: any) {
      setOut(`Error: ${e?.message || e}`)
    }
  }

  const callAnalyze = async () => {
    setOut("Running /api/analyze ...")
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-ggai-key": apiKey } : {}),
        },
        body: JSON.stringify({ resume, jobDescription: jd, role }),
      })
      const data = await res.json()
      setOut(JSON.stringify({ status: res.status, data }, null, 2))
    } catch (e: any) {
      setOut(`Error: ${e?.message || e}`)
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Gemini Dev Test</h1>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label>
          API Key (header x-ggai-key)
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Paste key to override env for testing"
            style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          />
        </label>

        <label>
          Test query for /api/gemini-test
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          />
        </label>
        <button onClick={callTest} style={{ padding: "8px 12px", border: "1px solid #111", borderRadius: 6 }}>
          Ping /api/gemini-test
        </button>

        <hr />

        <label>
          Resume (plain text)
          <textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            rows={4}
            style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          />
        </label>

        <label>
          Job Description (plain text)
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            rows={4}
            style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          />
        </label>

        <label>
          Role
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          />
        </label>

        <button onClick={callAnalyze} style={{ padding: "8px 12px", border: "1px solid #111", borderRadius: 6 }}>
          Call /api/analyze
        </button>

        <pre style={{ whiteSpace: "pre-wrap", background: "#111", color: "#0f0", padding: 12, borderRadius: 6, minHeight: 120 }}>
{out}
        </pre>
      </div>
    </div>
  )
}
