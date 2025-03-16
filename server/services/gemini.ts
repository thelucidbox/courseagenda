import { GoogleGenerativeAI } from '@google/generative-ai';
import { type CourseEvent, type InsertCourseEvent } from '@shared/schema';

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY environment variable is not set.");
}

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Get the generative model (defaults to Gemini Pro)
const model = genAI.getGenerativeModel({ 
  model: 'gemini-pro',
  generationConfig: {
    temperature: 0.2, // Lower temperature for more factual responses
    maxOutputTokens: 8192
  }
});

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
      You are a syllabus analyzer designed to extract structured information from course syllabi for students.

      TASK:
      Carefully analyze the provided syllabus text and extract the following key information:

      1. Course Identification:
         - Course Code (e.g., CS101, MATH201, BIO-283)
         - Course Name/Title (full course name)
         - Instructor Name (including title if available)
         - Term/Semester (e.g., Fall 2023, Spring 2024, Summer 2024)

      2. Important Dates and Events:
         For each event you identify (assignments, exams, quizzes, projects, presentations, etc.):
         - Event Type (categorize as: assignment, exam, quiz, project, presentation, paper, or other)
         - Title (descriptive name of the event)
         - Due Date (in YYYY-MM-DD format)
         - Description (brief summary of what the event entails)

      IMPORTANT GUIDELINES:
      - Search throughout the entire text to find all relevant dates and events
      - Identify the specific date formats used in the syllabus (MM/DD/YYYY, Month Day Year, etc.)
      - Pay special attention to sections labeled "Schedule", "Due Dates", "Important Dates", "Course Calendar", etc.
      - Be careful to distinguish between class meeting dates and assignment due dates
      - For events where only a Month and Day are provided (without a year), infer the year based on the term/semester

      OUTPUT FORMAT:
      Return a valid, properly formatted JSON object with the following structure:
      {
        "courseCode": "string or null",
        "courseName": "string or null",
        "instructor": "string or null",
        "term": "string or null",
        "events": [
          {
            "eventType": "assignment|exam|quiz|project|presentation|paper|other",
            "title": "string",
            "dueDate": "YYYY-MM-DD",
            "description": "string or null"
          }
        ]
      }

      If information for any field cannot be found, use null for that field. Events should have at minimum a title and due date.
      Ensure the JSON is properly formatted with correct quotes, commas, and brackets.

      SYLLABUS TEXT:
      ${syllabusText}
    `;

    console.log('Sending syllabus text to Gemini AI for analysis...');
    
    // Call the Gemini API
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('Received response from Gemini AI, processing...');
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to extract JSON from Gemini response. Raw response:', text.substring(0, 200) + '...');
      return { events: [] };
    }

    const jsonText = jsonMatch[0];
    
    try {
      const extractedData = JSON.parse(jsonText) as ExtractedSyllabusInfo;
      
      // Log the extracted information
      console.log(`Successfully extracted course information: 
        - Course Code: ${extractedData.courseCode || 'Not found'}
        - Course Name: ${extractedData.courseName || 'Not found'}
        - Instructor: ${extractedData.instructor || 'Not found'}
        - Term: ${extractedData.term || 'Not found'}
        - Events found: ${extractedData.events?.length || 0}
      `);
      
      if (!extractedData.events || !Array.isArray(extractedData.events)) {
        console.error('No events array in Gemini response or events is not an array');
        extractedData.events = [];
      }
      
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
    } catch (jsonError) {
      console.error('Error parsing JSON from Gemini response:', jsonError);
      return { events: [] };
    }
  } catch (error) {
    console.error('Error extracting syllabus info with Gemini:', error);
    return { events: [] };
  }
}