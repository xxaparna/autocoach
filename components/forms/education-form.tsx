"use client"

import { useState } from "react"
import { useResume } from "@/contexts/resume-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

export function EducationForm() {
  const { resumeData, addEducation, updateEducation, deleteEducation } = useResume()
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddEducation = (formData: FormData) => {
    const education = {
      school: formData.get("school") as string,
      degree: formData.get("degree") as string,
      field: formData.get("field") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      gpa: formData.get("gpa") as string,
    }
    addEducation(education)
    setShowAddForm(false)
  }

  return (
    <div className="space-y-4">
      {resumeData.education.map((edu) => (
        <Card key={edu.id} className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  {edu.degree} in {edu.field}
                </CardTitle>
                <p className="text-sm text-gray-600">{edu.school}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteEducation(edu.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>School</Label>
                <Input value={edu.school} onChange={(e) => updateEducation(edu.id, { school: e.target.value })} />
              </div>
              <div>
                <Label>Degree</Label>
                <Input value={edu.degree} onChange={(e) => updateEducation(edu.id, { degree: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Field of Study</Label>
                <Input value={edu.field} onChange={(e) => updateEducation(edu.id, { field: e.target.value })} />
              </div>
              <div>
                <Label>GPA (Optional)</Label>
                <Input
                  value={edu.gpa || ""}
                  onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
                  placeholder="3.8"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="month"
                  value={edu.startDate}
                  onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="month"
                  value={edu.endDate}
                  onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {showAddForm ? (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <form action={handleAddEducation} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="school">School</Label>
                  <Input id="school" name="school" required />
                </div>
                <div>
                  <Label htmlFor="degree">Degree</Label>
                  <Input id="degree" name="degree" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="field">Field of Study</Label>
                  <Input id="field" name="field" required />
                </div>
                <div>
                  <Label htmlFor="gpa">GPA (Optional)</Label>
                  <Input id="gpa" name="gpa" placeholder="3.8" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" name="startDate" type="month" required />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" name="endDate" type="month" required />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Add Education</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" onClick={() => setShowAddForm(true)} className="w-full border-dashed">
          <Plus className="w-4 h-4 mr-2" />
          Add Education
        </Button>
      )}
    </div>
  )
}
