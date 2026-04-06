"use client"

import { useState } from "react"
import { useResume } from "@/contexts/resume-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

export function ExperienceForm() {
  const { resumeData, addExperience, updateExperience, deleteExperience } = useResume()
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddExperience = (formData: FormData) => {
    const experience = {
      company: formData.get("company") as string,
      position: formData.get("position") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      current: formData.get("current") === "on",
      description: formData.get("description") as string,
    }
    addExperience(experience)
    setShowAddForm(false)
  }

  return (
    <div className="space-y-4">
      {resumeData.experiences.map((exp) => (
        <Card key={exp.id} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{exp.position}</CardTitle>
                <p className="text-sm text-gray-600">{exp.company}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteExperience(exp.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Company</Label>
                <Input value={exp.company} onChange={(e) => updateExperience(exp.id, { company: e.target.value })} />
              </div>
              <div>
                <Label>Position</Label>
                <Input value={exp.position} onChange={(e) => updateExperience(exp.id, { position: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="month"
                  value={exp.startDate}
                  onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="month"
                  value={exp.endDate}
                  onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                  disabled={exp.current}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`current-${exp.id}`}
                checked={exp.current}
                onCheckedChange={(checked) =>
                  updateExperience(exp.id, { current: checked as boolean, endDate: checked ? "" : exp.endDate })
                }
              />
              <Label htmlFor={`current-${exp.id}`}>Currently working here</Label>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={exp.description}
                onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {showAddForm ? (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <form action={handleAddExperience} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" name="company" required />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input id="position" name="position" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" name="startDate" type="month" required />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" name="endDate" type="month" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="current" name="current" />
                <Label htmlFor="current">Currently working here</Label>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Add Experience</Button>
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
          Add Experience
        </Button>
      )}
    </div>
  )
}
