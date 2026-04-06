import { type NextRequest, NextResponse } from "next/server"
import { groqClient } from "@/services/groqClient"
import {
  buildHeuristicPlan,
  type Preferences,
  type ExamDate,
  type SyllabusItem,
  type WeeklyPlan,
} from "@/utils/planner"

// Uses AI SDK to generate a plan if possible; falls back to heuristic on failure. [^1]
export async function POST(req: NextRequest) {
  try {
    const { syllabus, preferences, exams } = (await req.json()) as {
      syllabus: SyllabusItem[]
      preferences: Preferences
      exams: ExamDate[]
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Missing GROQ_API_KEY in environment" }, { status: 500 })
    }

    const system = `You are AutoCoach, an expert academic planner. Create efficient, adaptive study plans. 
    - You MUST respond with valid JSON only, no markdown formatting or additional text.
    - The response MUST be a single JSON object with the exact structure specified below.`;

    const prompt = `Syllabus (array of {subject, topic, hours}): 
${JSON.stringify(syllabus, null, 2)}

Preferences: ${JSON.stringify(preferences)}
Exam Dates: ${JSON.stringify(exams)}

TASK: Create a strict deadline-driven study plan starting from the current date. Ensure all topics are completed before their respective exam dates.

RULES (MUST FOLLOW):
1. STRICT DEADLINES: All topics must be completed at least 1 day before their exam date.
2. DAILY HOURS: Do not exceed dailyHours limit (${preferences.dailyHours} hours/day).
3. PRIORITIZATION:
   - Subjects with earlier exam dates get higher priority
   - Focus on weakTopics and focusSubjects first
   - Distribute difficult topics across multiple days
4. TASK BREAKDOWN:
   - Split topics longer than dailyHours into smaller chunks
   - Include buffer days before exams for revision
   - Balance subjects to prevent burnout

IMPORTANT: Your response MUST be a valid JSON object with the following exact structure. Do not include any other text or markdown formatting:

EXAMPLE RESPONSE:
{
  "tasks": [
    {
      "id": "unique-id-1",
      "date": "2025-01-01",
      "subject": "Mathematics",
      "topic": "Calculus",
      "hours": 2
    }
  ],
  "summary": {
    "totalHours": 2,
    "subjects": {
      "Mathematics": 2
    }
  }
}`

    try {
      console.log('Generating study plan with prompt:', prompt);
      
      // Use the singleton instance of GroqClient
      const response = await groqClient.generateText({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        maxTokens: 2000
      });
      
      console.log('Raw response from Groq:', response);
      
      // Parse the response
      let parsed;
      try {
        // Handle both string and object responses
        const responseText = typeof response === 'string' ? response : response?.text || JSON.stringify(response);
        
        // Clean the response to ensure it's valid JSON
        const jsonMatch = responseText.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
        const jsonString = jsonMatch ? jsonMatch[1] : responseText;
        
        parsed = JSON.parse(jsonString);
        
        // Validate the response structure
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Invalid response format: expected an object');
        }
        
        if (!Array.isArray(parsed.tasks) || !parsed.tasks.length) {
          throw new Error('No tasks generated in the response');
        }
        
        // Validate task structure
        const requiredTaskFields = ['id', 'date', 'subject', 'topic', 'hours'];
        for (const [index, task] of parsed.tasks.entries()) {
          if (!task || typeof task !== 'object') {
            throw new Error(`Task at index ${index} is not a valid object`);
          }
          
          for (const field of requiredTaskFields) {
            if (!(field in task)) {
              throw new Error(`Task at index ${index} is missing required field: ${field}`);
            }
          }
        }
        
        // Validate task dates against exam deadlines
        if (exams?.length) {
          const examMap = new Map(exams.map(e => [e.subject, new Date(e.date)]));
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Compare dates only, ignore time
          
          for (const task of parsed.tasks) {
            const taskDate = new Date(task.date);
            taskDate.setHours(0, 0, 0, 0); // Compare dates only
            
            const examDate = examMap.get(task.subject);
            if (examDate) {
              const examDateOnly = new Date(examDate);
              examDateOnly.setDate(examDateOnly.getDate() - 1); // Allow until day before exam
              examDateOnly.setHours(0, 0, 0, 0);
              
              if (taskDate > examDateOnly) {
                throw new Error(`Task scheduled after deadline for ${task.subject}: ${task.date} (exam on ${examDate.toISOString().split('T')[0]})`);
              }
            }
            
            if (taskDate < today) {
              throw new Error(`Task scheduled in the past: ${task.date} (today is ${today.toISOString().split('T')[0]})`);
            }
            
            // Validate hours
            if (typeof task.hours !== 'number' || task.hours <= 0) {
              throw new Error(`Invalid hours value for task: ${task.hours}`);
            }
          }
        }
        
        // Validate summary
        if (!parsed.summary || typeof parsed.summary !== 'object') {
          throw new Error('Missing or invalid summary in response');
        }
        
        if (typeof parsed.summary.totalHours !== 'number' || parsed.summary.totalHours <= 0) {
          throw new Error('Invalid total hours in summary');
        }
        
        console.log('Successfully parsed and validated study plan');
        return NextResponse.json(parsed);
        
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        console.error('Response that caused error:', response);
        throw new Error(`Failed to generate valid study plan: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
      }
      
    } catch (error) {
      console.error('Error in generate-plan endpoint:', error);
      console.log('Falling back to heuristic plan due to error');
      try {
        const fallback = buildHeuristicPlan(syllabus, preferences, exams);
        return NextResponse.json(fallback);
      } catch (fallbackError) {
        console.error('Error generating fallback plan:', fallbackError);
        return NextResponse.json(
          { 
            error: 'Failed to generate study plan',
            details: error instanceof Error ? error.message : 'Unknown error',
            fallbackError: fallbackError instanceof Error ? fallbackError.message : 'Unknown fallback error'
          }, 
          { status: 500 }
        );
      }
    }
  } catch (e) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }
}
