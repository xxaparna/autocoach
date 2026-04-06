"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Play } from "lucide-react"

type Test = { input: any[]; expected: any }

export function CodeRunner({
  code,
  functionName,
  tests,
  onResult,
}: {
  code: string
  functionName: string
  tests: Test[]
  onResult?: (summary: { passed: number; total: number; details: string[] }) => void
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [running, setRunning] = useState(false)
  const [summary, setSummary] = useState<{ passed: number; total: number; details: string[] } | null>(null)

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.__runner_result) {
        const res = e.data.__runner_result
        setRunning(false)
        setSummary(res)
        onResult?.(res)
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [onResult])

  const run = () => {
    setRunning(true)
    setSummary(null)
    const iframe = iframeRef.current
    if (!iframe) return
    const srcdoc = `
<!doctype html>
<html>
  <body>
    <script>
      function safeRun() {
        const results = []
        try {
          // User code
          ${code}

          const fn = (typeof ${functionName} === 'function') ? ${functionName} : null;
          if (!fn) throw new Error('Function ${functionName} not found');

          const tests = ${JSON.stringify(tests)};
          let passed = 0;
          const details = [];
          const deepEqual = (a,b) => JSON.stringify(a) === JSON.stringify(b);

          for (const t of tests) {
            let out;
            let ok = false;
            let err = null;
            try {
              out = fn.apply(null, t.input);
              ok = deepEqual(out, t.expected);
            } catch (e) { err = '' + e; }
            if (ok) { passed++; details.push('✅ ' + JSON.stringify(t.input) + ' -> ' + JSON.stringify(out)); }
            else {
              details.push('❌ ' + JSON.stringify(t.input) + ' -> ' + JSON.stringify(out) + ' (expected ' + JSON.stringify(t.expected) + ')' + (err ? ' Error: ' + err : ''));
            }
          }
          parent.postMessage({ __runner_result: { passed, total: tests.length, details } }, '*');
        } catch (e) {
          parent.postMessage({ __runner_result: { passed: 0, total: ${tests.length}, details: ['Error: ' + e] } }, '*');
        }
      }
      safeRun();
    <\/script>
  </body>
</html>`
    iframe.srcdoc = srcdoc
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button onClick={run} disabled={running}>
          {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
          Run Tests
        </Button>
        {summary && (
          <Badge variant={summary.passed === summary.total ? "secondary" : "destructive"}>
            {summary.passed}/{summary.total} passed
          </Badge>
        )}
      </div>
      {summary && (
        <div className="p-3 bg-gray-50 border rounded text-sm whitespace-pre-wrap">{summary.details.join("\n")}</div>
      )}
      <iframe ref={iframeRef} title="runner" className="hidden" sandbox="allow-scripts" />
    </div>
  )
}
