import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groqClient } from "@/services/groqClient"
import { getSession } from "@/lib/session"
import { connectDB } from "@/lib/db"
import { JobAnalysis } from "@/models/JobAnalysis"

// Ensure access to process.env and Node APIs
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { resume, jobDescription, role } = await request.json()

    if (!resume || !jobDescription) {
      return NextResponse.json({ error: "Resume and job description are required" }, { status: 400 })
    }

    // Check for API key
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Missing GROQ_API_KEY (set in .env.local)" }, { status: 401 })
    }

    const prompt = `
You are an expert HR analyst and career coach. Analyze the following resume against the job description and provide a comprehensive match analysis.

TARGET ROLE:
${role || "(not specified)"}

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

Please provide a detailed analysis in the following JSON format:
{
  "matchPercentage": <number between 0-100>,
  "matchedSkills": [<array of skills that match between resume and job>],
  "missingSkills": [<array of required skills missing from resume>],
  "recommendations": [<array of specific, actionable recommendations to improve the match>],
  "overallFeedback": "<brief overall assessment of the match>",
  "resumeStrengths": [<array of resume strengths relevant to this role>],
  "improvementAreas": [<array of areas where the resume could be improved for this role>]
}

Guidelines:
- Be thorough in skill extraction and matching
- Consider both hard and soft skills
- Look for relevant experience, not just exact keyword matches
- Provide specific, actionable recommendations
- Consider the seniority level and requirements
- Be constructive and helpful in feedback
- Match percentage should reflect overall fit, not just skill overlap
 - Return only valid JSON with no extra commentary or code fences
`

    let text: string
    try {
      const { text: responseText } = await groqClient.generateText({
        system: "You are an expert HR analyst and career coach. Analyze resumes against job descriptions.",
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        maxTokens: 2048,
      })
      text = responseText
    } catch (err: any) {
      const message = err?.message || "AI request failed"
      const details = err?.response?.data || err?.cause || null
      console.error('Groq API error:', { message, details })
      return NextResponse.json({ error: message, details }, { status: 502 })
    }

    // Parse the JSON response robustly (handle accidental wrappers)
    let analysisResult: any
    try {
      analysisResult = JSON.parse(text)
    } catch {
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) {
        return NextResponse.json({ error: "AI returned non-JSON response", raw: text }, { status: 502 })
      }
      try {
        analysisResult = JSON.parse(match[0])
      } catch (e) {
        return NextResponse.json({ error: "Failed to parse AI JSON", raw: text }, { status: 502 })
      }
    }

    // Save latest analysis for signed-in user (best-effort)
    try {
      const session = getSession()
      if (session) {
        await connectDB()
        await JobAnalysis.create({
          userId: session.uid,
          matchPercentage: Number(analysisResult.matchPercentage) || 0,
          matchedSkills: Array.isArray(analysisResult.matchedSkills) ? analysisResult.matchedSkills : [],
          missingSkills: Array.isArray(analysisResult.missingSkills) ? analysisResult.missingSkills : [],
          recommendations: Array.isArray(analysisResult.recommendations) ? analysisResult.recommendations : [],
          overallFeedback: String(analysisResult.overallFeedback || ""),
          resumeStrengths: Array.isArray(analysisResult.resumeStrengths) ? analysisResult.resumeStrengths : [],
          improvementAreas: Array.isArray(analysisResult.improvementAreas) ? analysisResult.improvementAreas : [],
        })
      }
    } catch {}

    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze resume and job description" }, { status: 500 })
  }
}

