import { GoogleGenerativeAI } from '@google/generative-ai';
import { type CourseEvent, type InsertCourseEvent } from '@shared/schema';

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Get the generative model (defaults to Gemini Pro)
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

interface ExtractedSyllabusInfo {
  courseCode?: string;
  courseName?: string;
  instructor?: string;
  term?: string;
  events: InsertCourseEvent[];
}

/**
 * Extract course information and events from syllabus text using Gemini AI
 */
export async function extractSyllabusInfo(syllabusText: string, syllabusId: number): Promise<ExtractedSyllabusInfo> {
  try {
    const prompt = `
      You are a syllabus analyzer. Extract the following information from this syllabus:
      
      1. Course Code (e.g., CS101, MATH201)
      2. Course Name/Title
      3. Instructor Name
      4. Term/Semester (e.g., Fall 2023)
      5. All assignment deadlines, exams, and other important dates
      
      For each date/event, extract:
      - Type of event (assignment, exam, quiz, etc.)
      - Title of the event
      - Due date in YYYY-MM-DD format
      - Description (if available)
      
      Format your response as a valid JSON object with the following structure:
      {
        "courseCode": "string",
        "courseName": "string",
        "instructor": "string",
        "term": "string",
        "events": [
          {
            "eventType": "assignment|exam|quiz|project|other",
            "title": "string",
            "dueDate": "YYYY-MM-DD",
            "description": "string or null"
          }
        ]
      }
      
      If you can't find certain information, use null for that field. Try to be as accurate as possible with dates.
      
      Here's the syllabus text:
      ${syllabusText}
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to extract JSON from Gemini response');
      return { events: [] };
    }

    const jsonText = jsonMatch[0];
    const extractedData = JSON.parse(jsonText) as ExtractedSyllabusInfo;
    
    // Format the events with syllabusId
    const formattedEvents = extractedData.events.map(event => ({
      ...event,
      syllabusId,
      dueDate: new Date(event.dueDate),
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    return {
      courseCode: extractedData.courseCode || undefined,
      courseName: extractedData.courseName || undefined,
      instructor: extractedData.instructor || undefined,
      term: extractedData.term || undefined,
      events: formattedEvents
    };
  } catch (error) {
    console.error('Error extracting syllabus info with Gemini:', error);
    return { events: [] };
  }
}