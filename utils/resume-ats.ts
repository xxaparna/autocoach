export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-+.]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
}

export function extractKeywords(text: string): string[] {
  const tokens = tokenize(text)
  const common = new Set([
    "and",
    "or",
    "with",
    "the",
    "a",
    "an",
    "to",
    "in",
    "of",
    "for",
    "on",
    "at",
    "by",
    "as",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "it",
    "this",
    "that",
    "from",
    "using",
    "use",
    "used",
  ])
  const freq: Record<string, number> = {}
  tokens.forEach((t) => {
    if (common.has(t)) return
    freq[t] = (freq[t] || 0) + 1
  })
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100)
    .map(([k]) => k)
}

export function computeAtsScore(resumeText: string, jobText?: string) {
  const resume = resumeText || ""
  const job = jobText || ""
  const resumeKW = new Set(extractKeywords(resume))
  const jobKW = job ? extractKeywords(job) : new Set<string>([])
  const matched: string[] = []
  const missing: string[] = []
  jobKW.forEach((k) => {
    if (resumeKW.has(k)) matched.push(k)
    else missing.push(k)
  })
  // Formatting heuristics
  const hasSections = /(experience|education|skills|projects)/i.test(resume)
  const hasContact = /(email|phone|linkedin|github)/i.test(resume)
  const hasTablesOrImages = /(table|img|image)/i.test(resume)
  let score = job ? Math.round((matched.length / Math.max(1, matched.length + missing.length)) * 70) : 50
  score += hasSections ? 10 : -10
  score += hasContact ? 10 : 0
  score += hasTablesOrImages ? -10 : 0
  score = Math.max(0, Math.min(100, score))

  const recommendations: string[] = []
  if (!hasSections) recommendations.push("Add clear sections: Experience, Education, Skills, Projects.")
  if (!hasContact) recommendations.push("Include contact details: email, phone, LinkedIn/GitHub.")
  if (hasTablesOrImages) recommendations.push("Remove tables/images to improve ATS parsing.")
  if (job) {
    if (missing.length > 0)
      recommendations.push(`Add or demonstrate missing keywords: ${missing.slice(0, 10).join(", ")}.`)
    recommendations.push("Use action verbs and quantify achievements (e.g., 'Improved X by Y%').")
  }
  return { score, matched, missing, recommendations }
}
