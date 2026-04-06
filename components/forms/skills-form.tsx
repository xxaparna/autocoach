"use client"

import { useState } from "react"
import { useResume } from "@/contexts/resume-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

export function SkillsForm() {
  const { resumeData, addSkill, updateSkill, deleteSkill } = useResume()
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddSkill = (formData: FormData) => {
    const skill = {
      name: formData.get("name") as string,
      level: Number.parseInt(formData.get("level") as string) || 3,
    }
    addSkill(skill)
    setShowAddForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {resumeData.skills.map((skill) => (
          <Card key={skill.id} className="border-l-4 border-l-purple-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1 mr-4">
                  <Input
                    value={skill.name}
                    onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                    className="font-medium"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSkill(skill.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Proficiency Level</span>
                  <span>{skill.level}/5</span>
                </div>
                <Slider
                  value={[skill.level]}
                  onValueChange={(value) => updateSkill(skill.id, { level: value[0] })}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showAddForm ? (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <form action={handleAddSkill} className="space-y-4">
              <div>
                <Label htmlFor="name">Skill Name</Label>
                <Input id="name" name="name" placeholder="JavaScript" required />
              </div>
              <div>
                <Label htmlFor="level">Proficiency Level (1-5)</Label>
                <Input id="level" name="level" type="number" min="1" max="5" defaultValue="3" />
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Add Skill</Button>
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
          Add Skill
        </Button>
      )}
    </div>
  )
}
