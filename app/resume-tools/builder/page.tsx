"use client"
import { AppNavbar } from "@/components/app-navbar"
import { ResumeEditor } from "@/components/resume-editor"
import { ResumePreview } from "@/components/resume-preview"
import { ResumeProvider } from "@/contexts/resume-context"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"

export default function BuilderPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="print:hidden">
        <AppNavbar />
      </div>
      <ResumeProvider>
        <div className="flex h-[calc(100vh-64px)] print:h-auto">
          <div className="w-full lg:w-1/2 border-r border-gray-200 overflow-y-auto print:hidden">
            <div className="flex items-center justify-between px-6 py-3 border-b bg-white">
              <h1 className="text-lg font-semibold">Resume Builder</h1>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => {
                  if (typeof window !== "undefined") window.print()
                }}
              >
                <FileDown className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
            <ResumeEditor />
          </div>
          <div className="hidden lg:block w-1/2 bg-white overflow-y-auto print:block print:w-full print:overflow-visible">
            <ResumePreview />
          </div>
        </div>
      </ResumeProvider>
    </div>
  )
}
