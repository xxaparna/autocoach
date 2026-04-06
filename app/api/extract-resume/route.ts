import { type NextRequest, NextResponse } from "next/server"

// Force Node.js runtime to ensure Node APIs available for pdf parsing
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const nameLower = (file.name || "").toLowerCase()
    const type = file.type || ""

    if (type === "text/plain" || nameLower.endsWith(".txt")) {
      const text = await file.text()
      return NextResponse.json({ text })
    }

    // PDF: handled on client using pdfjs-dist to avoid server bundler conflicts
    if (type === "application/pdf" || nameLower.endsWith(".pdf") || type === "application/octet-stream") {
      return NextResponse.json(
        { error: "PDF parsing is handled on client. Please retry; the UI will extract text automatically." },
        { status: 415 },
      )
    }

    // DOCX parsing
    if (
      type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      nameLower.endsWith(".docx")
    ) {
      // Convert uploaded file to Buffer for mammoth
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const mammothModule = await import("mammoth")
      const { value } = await mammothModule.extractRawText({ buffer })
      const text = (value || "").trim()
      if (!text) return NextResponse.json({ error: "No text extracted from DOCX" }, { status: 422 })
      return NextResponse.json({ text })
    }

    // Legacy .doc not supported reliably without external tools
    if (type === "application/msword" || nameLower.endsWith(".doc")) {
      return NextResponse.json(
        { error: ".doc files are not supported. Please convert to PDF or DOCX." },
        { status: 415 },
      )
    }

    return NextResponse.json(
      { error: "Unsupported file type. Supported: PDF (.pdf), DOCX (.docx), and TXT (.txt)." },
      { status: 400 },
    )
  } catch (error) {
    console.error("File extraction error:", error)
    return NextResponse.json({ error: "Failed to extract text from file" }, { status: 500 })
  }
}

