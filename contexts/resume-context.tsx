"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  location: string
  website: string
  summary: string
}

export interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

export interface Education {
  id: string
  school: string
  degree: string
  field: string
  startDate: string
  endDate: string
  gpa?: string
}

export interface Skill {
  id: string
  name: string
  level: number
}

export interface ResumeData {
  personalInfo: PersonalInfo
  experiences: Experience[]
  education: Education[]
  skills: Skill[]
}

interface ResumeContextType {
  resumeData: ResumeData
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void
  addExperience: (experience: Omit<Experience, "id">) => void
  updateExperience: (id: string, experience: Partial<Experience>) => void
  deleteExperience: (id: string) => void
  addEducation: (education: Omit<Education, "id">) => void
  updateEducation: (id: string, education: Partial<Education>) => void
  deleteEducation: (id: string) => void
  addSkill: (skill: Omit<Skill, "id">) => void
  updateSkill: (id: string, skill: Partial<Skill>) => void
  deleteSkill: (id: string) => void
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined)

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: "John Doe",
      email: "john.doe@email.com",
      phone: "(555) 123-4567",
      location: "New York, NY",
      website: "linkedin.com/in/johndoe",
      summary:
        "Experienced software developer with a passion for creating innovative solutions and leading development teams.",
    },
    experiences: [
      {
        id: "1",
        company: "Tech Corp",
        position: "Senior Software Engineer",
        startDate: "2022-01",
        endDate: "",
        current: true,
        description:
          "Led development of web applications using React and Node.js. Mentored junior developers and improved team productivity by 30%.",
      },
    ],
    education: [
      {
        id: "1",
        school: "University of Technology",
        degree: "Bachelor of Science",
        field: "Computer Science",
        startDate: "2018-09",
        endDate: "2022-05",
        gpa: "3.8",
      },
    ],
    skills: [
      { id: "1", name: "JavaScript", level: 5 },
      { id: "2", name: "React", level: 5 },
      { id: "3", name: "Node.js", level: 4 },
      { id: "4", name: "Python", level: 4 },
    ],
  })

  const updatePersonalInfo = (info: Partial<PersonalInfo>) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...info },
    }))
  }

  const addExperience = (experience: Omit<Experience, "id">) => {
    const newExperience = { ...experience, id: Date.now().toString() }
    setResumeData((prev) => ({
      ...prev,
      experiences: [...prev.experiences, newExperience],
    }))
  }

  const updateExperience = (id: string, experience: Partial<Experience>) => {
    setResumeData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => (exp.id === id ? { ...exp, ...experience } : exp)),
    }))
  }

  const deleteExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((exp) => exp.id !== id),
    }))
  }

  const addEducation = (education: Omit<Education, "id">) => {
    const newEducation = { ...education, id: Date.now().toString() }
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, newEducation],
    }))
  }

  const updateEducation = (id: string, education: Partial<Education>) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu) => (edu.id === id ? { ...edu, ...education } : edu)),
    }))
  }

  const deleteEducation = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }))
  }

  const addSkill = (skill: Omit<Skill, "id">) => {
    const newSkill = { ...skill, id: Date.now().toString() }
    setResumeData((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill],
    }))
  }

  const updateSkill = (id: string, skill: Partial<Skill>) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.id === id ? { ...s, ...skill } : s)),
    }))
  }

  const deleteSkill = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== id),
    }))
  }

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        updatePersonalInfo,
        addExperience,
        updateExperience,
        deleteExperience,
        addEducation,
        updateEducation,
        deleteEducation,
        addSkill,
        updateSkill,
        deleteSkill,
      }}
    >
      {children}
    </ResumeContext.Provider>
  )
}

export function useResume() {
  const context = useContext(ResumeContext)
  if (context === undefined) {
    throw new Error("useResume must be used within a ResumeProvider")
  }
  return context
}
