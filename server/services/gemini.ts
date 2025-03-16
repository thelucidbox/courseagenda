import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { type CourseEvent, type InsertCourseEvent } from '@shared/schema';
import * as fs from 'fs';

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY environment variable is not set.");
}

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Using LearnLM for education-focused analysis
// Use the version-less "gemini-2.0-pro-exp" to always get the latest experimental version
const textModel = genAI.getGenerativeModel({ 
  model: 'learnlm-1.5-pro-experimental',
  generationConfig: {
    temperature: 0.2, // Lower temperature for more factual responses
    maxOutputTokens: 8192
  }
});

// Get the multimodal model that can process files
// We'll use the education-optimized model for better syllabus analysis
const multimodalModel = genAI.getGenerativeModel({ 
  model: 'learnlm-1.5-pro-experimental',
  generationConfig: {
    temperature: 0.2,
    maxOutputTokens: 8192
  }
});

// Raw event from Gemini API - with string dates
interface ExtractedEvent {
  eventType: string;
  title: string;
  dueDate: string; // Date in string format before processing
  description?: string | null;
}

// Raw data from Gemini API
interface ExtractedSyllabusInfo {
  courseCode?: string | null;
  courseName?: string | null;
  instructor?: string | null;
  term?: string | null;
  events: ExtractedEvent[]; // Raw events before processing
}

// Processed data with properly converted dates, ready for database
interface ProcessedSyllabusInfo {
  courseCode?: string;
  courseName?: string;
  instructor?: string;
  term?: string;
  events: InsertCourseEvent[]; // Processed events with Date objects
}

// Helper function for error cases - returns empty result with correct type
function emptyResult(): ProcessedSyllabusInfo {
  return { events: [] };
}

/**
 * Extract course information and events from a PDF file using Gemini Vision
 */
export async function extractInfoFromPDF(filePath: string, syllabusId: number): Promise<ProcessedSyllabusInfo> {
  try {
    console.log(`Processing PDF file at ${filePath} with Gemini Vision...`);
    
    // Read the PDF file as buffer
    const fileBuffer = fs.readFileSync(filePath);
    
    // Check file size - Gemini Vision has a limit (~4MB for base64 encoded content)
    const fileSizeInMB = fileBuffer.length / (1024 * 1024);
    console.log(`PDF file size: ${fileSizeInMB.toFixed(2)} MB`);
    
    if (fileSizeInMB > 3.5) {
      console.warn(`PDF file is large (${fileSizeInMB.toFixed(2)} MB). Gemini Vision might not process the entire document.`);
    }
    
    // Convert buffer to base64
    const base64Data = fileBuffer.toString('base64');
    
    // Create file part for Gemini Vision
    const filePart: Part = {
      inlineData: {
        data: base64Data,
        mimeType: "application/pdf"
      }
    };
    
    const currentYear = new Date().getFullYear();
    const prompt = `
      You are a specialized academic syllabus analysis system for a cross-platform study planning application. Your primary function is to extract comprehensive and structured information from course syllabi PDFs that will be used to generate personalized study plans and calendar integrations.

      When analyzing each syllabus, thoroughly identify and extract the following key information:

      1. COURSE METADATA:
         - Course title, code, and section number
         - Instructor name, contact information, and office hours
         - Teaching assistant details (if present)
         - Course meeting times and locations (including both in-person and virtual options)
         - Term dates (start and end of semester/quarter)
         - Department and school/university name
         - Course website, online platform, or learning management system URLs
         - Required and recommended textbooks or materials with full citations

      2. CRITICAL DATES (WITH PRECISE DATE FORMATTING):
         - Extract ALL deadlines with their exact dates (MM/DD/YYYY)
         - If only day/month are provided without year, intelligently infer the most likely year based on term dates
         - For recurring events (e.g., "weekly quizzes every Friday"), generate the complete series of dates
         - Categorize dates by type: assignment due dates, exam dates, project deadlines, presentation dates
         - Identify course holidays, breaks, or days with no class
         - Note any conditional or tentative dates, flagging them accordingly
         - Extract add/drop deadlines and other administrative dates

      3. ASSIGNMENT DETAILS:
         - Categorize each assignment (homework, quiz, exam, project, paper, presentation, participation)
         - Extract point values or percentage weights for each assignment
         - Calculate cumulative grade impact for each assignment category
         - Identify assignment descriptions, requirements, and submission instructions
         - Note any prerequisites or dependencies between assignments
         - Extract grading criteria or rubrics when available
         - Identify estimated time commitment for major assignments when mentioned
         - Note any group/collaborative vs. individual work specifications

      4. COURSE CONTENT STRUCTURE:
         - Identify the full sequence of lecture topics with their corresponding dates
         - Extract reading assignments with source materials and page numbers
         - Map topics to their relevant assignments and assessments
         - Identify key concepts, learning objectives, and expected outcomes
         - Recognize module or unit structures that group related topics
         - Identify cumulative vs. non-cumulative exam coverage
         - Note any prerequisite knowledge or skills mentioned

      5. POLICY INFORMATION:
         - Extract attendance policies and requirements
         - Identify late submission and make-up work policies
         - Note any technology requirements or resources needed
         - Extract academic integrity policies and consequences
         - Identify accessibility/accommodations information
         - Extract communication policies and preferred contact methods
         - Note any specific study resource recommendations (tutoring, study groups, etc.)

      6. STUDY PLANNING INSIGHTS:
         - Identify high-stakes assignments or exams (by weight or explicit statement)
         - Recognize stated difficulty levels for topics or assignments when mentioned
         - Detect sequential topics that build on each other
         - Identify explicit study recommendations or tips from the instructor
         - Note review session dates or office hours specifically for exam preparation
      
      OUTPUT FORMAT:
      Return a valid, properly formatted JSON object with the following structure:
      {
        "courseCode": "string or null",
        "courseName": "string or null",
        "instructor": "string or null",
        "term": "string or null",
        "events": [
          {
            "eventType": "assignment|homework|quiz|exam|midterm|final|project|presentation|paper|reading|lab|discussion|other",
            "title": "string",
            "dueDate": "YYYY-MM-DD",
            "description": "string or null"
          }
        ]
      }
      
      If information for any field cannot be found, use null for that field. Events should have at minimum a title and due date.
      Ensure the JSON is properly formatted with correct quotes, commas, and brackets.
    `;
    
    // Call the Gemini Vision API with the PDF
    console.log('Sending PDF to Gemini Vision for analysis...');
    
    let result;
    try {
      result = await multimodalModel.generateContent([prompt, filePart]);
    } catch (apiError: any) {
      console.error('Gemini Vision API error:', apiError?.message || apiError);
      
      // If we get an error that might be related to file size/content, try with a more focused prompt
      if (fileSizeInMB > 1) {
        console.log('Attempting a second approach with a more focused prompt...');
        
        const fallbackPrompt = `
          Extract the key course information and important dates from this syllabus PDF.
          
          Return a JSON with:
          {
            "courseCode": "string or null",
            "courseName": "string or null",
            "instructor": "string or null",
            "term": "string or null",
            "events": [
              {
                "eventType": "assignment|homework|quiz|exam|midterm|final|project|presentation|paper|reading|lab|discussion|other",
                "title": "string",
                "dueDate": "YYYY-MM-DD",
                "description": "string or null"
              }
            ]
          }
          
          Focus only on the most important information and dates.
          Be specific with event types, using the most appropriate category from the list above.
          Include as much detail as possible in the description field, including point values, requirements, and topics covered.
        `;
        
        result = await multimodalModel.generateContent([fallbackPrompt, filePart]);
      } else {
        throw apiError; // Re-throw if it's not likely a file size issue
      }
    }
    
    const response = result.response;
    const text = response.text();
    
    console.log('Received response from Gemini Vision, processing...');
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to extract JSON from Gemini Vision response. Raw response:', text.substring(0, 200) + '...');
      return { events: [] };
    }
    
    const jsonText = jsonMatch[0];
    
    try {
      // Attempt to parse the JSON, cleaning it if necessary
      let cleanedJsonText = jsonText;
      // Sometimes Gemini adds additional backticks around JSON, let's clean that
      if (jsonText.startsWith('```json')) {
        cleanedJsonText = jsonText.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (jsonText.startsWith('```')) {
        cleanedJsonText = jsonText.replace(/^```/, '').replace(/```$/, '').trim();
      }
      
      const extractedData = JSON.parse(cleanedJsonText) as ExtractedSyllabusInfo;
      
      // Log the extracted information
      console.log(`Successfully extracted course information from PDF: 
        - Course Code: ${extractedData.courseCode || 'Not found'}
        - Course Name: ${extractedData.courseName || 'Not found'}
        - Instructor: ${extractedData.instructor || 'Not found'}
        - Term: ${extractedData.term || 'Not found'}
        - Events found: ${extractedData.events?.length || 0}
      `);
      
      if (!extractedData.events || !Array.isArray(extractedData.events)) {
        console.error('No events array in Gemini Vision response or events is not an array');
        extractedData.events = [];
      }
      
      // Format the events with syllabusId
      const formattedEvents = extractedData.events.map(event => {
        try {
          // Validate and fix date format if needed
          let dueDate: Date;
          
          if (!event.dueDate) {
            // If no date found, use current date as placeholder
            dueDate = new Date();
            console.warn(`No valid date found for event "${event.title}", using current date as placeholder`);
          } else {
            dueDate = new Date(event.dueDate);
            
            // If invalid date, try to parse with different formats
            if (isNaN(dueDate.getTime())) {
              try {
                // Try MM/DD/YYYY format
                const dateParts = event.dueDate.split(/[\/\-\.]/);
                if (dateParts.length === 3) {
                  const month = parseInt(dateParts[0]) - 1;
                  const day = parseInt(dateParts[1]);
                  const year = dateParts[2].length === 2 
                    ? parseInt(dateParts[2]) + (parseInt(dateParts[2]) > 50 ? 1900 : 2000)
                    : parseInt(dateParts[2]);
                  dueDate = new Date(year, month, day);
                }
              } catch (e) {
                console.warn(`Error parsing date format: ${e}`);
                dueDate = new Date(); // fallback to current date
              }
            }
          }
          
          return {
            eventType: event.eventType || 'other',
            title: event.title,
            description: event.description || null,
            syllabusId,
            dueDate: isNaN(dueDate.getTime()) ? new Date() : dueDate,
            createdAt: new Date(),
            updatedAt: new Date()
          };
        } catch (dateError) {
          console.error(`Error processing date for event "${event.title}":`, dateError);
          return {
            eventType: event.eventType || 'other',
            title: event.title,
            description: event.description || null,
            syllabusId,
            dueDate: new Date(), // Fallback to current date if there's an error
            createdAt: new Date(),
            updatedAt: new Date()
          };
        }
      });
      
      return {
        courseCode: extractedData.courseCode || undefined,
        courseName: extractedData.courseName || undefined,
        instructor: extractedData.instructor || undefined,
        term: extractedData.term || undefined,
        events: formattedEvents
      };
    } catch (jsonError) {
      console.error('Error parsing JSON from Gemini Vision response:', jsonError);
      console.error('Problematic JSON:', jsonText.substring(0, 200) + '...');
      return { events: [] };
    }
  } catch (error) {
    console.error('Error extracting syllabus info with Gemini Vision:', error);
    return { events: [] };
  }
}

/**
 * Extract course information and events from syllabus text using Gemini AI
 */
export async function extractSyllabusInfo(syllabusText: string, syllabusId: number): Promise<ProcessedSyllabusInfo> {
  try {
    const currentYear = new Date().getFullYear();
    const prompt = `
      You are a specialized academic syllabus analysis system for a cross-platform study planning application. Your primary function is to extract comprehensive and structured information from course syllabi PDFs that will be used to generate personalized study plans and calendar integrations.

      When analyzing each syllabus, thoroughly identify and extract the following key information:

      1. COURSE METADATA:
         - Course title, code, and section number
         - Instructor name, contact information, and office hours
         - Teaching assistant details (if present)
         - Course meeting times and locations (including both in-person and virtual options)
         - Term dates (start and end of semester/quarter)
         - Department and school/university name
         - Course website, online platform, or learning management system URLs
         - Required and recommended textbooks or materials with full citations

      2. CRITICAL DATES (WITH PRECISE DATE FORMATTING):
         - Extract ALL deadlines with their exact dates (MM/DD/YYYY)
         - If only day/month are provided without year, intelligently infer the most likely year based on term dates
         - For recurring events (e.g., "weekly quizzes every Friday"), generate the complete series of dates
         - Categorize dates by type: assignment due dates, exam dates, project deadlines, presentation dates
         - Identify course holidays, breaks, or days with no class
         - Note any conditional or tentative dates, flagging them accordingly
         - Extract add/drop deadlines and other administrative dates

      3. ASSIGNMENT DETAILS:
         - Categorize each assignment (homework, quiz, exam, project, paper, presentation, participation)
         - Extract point values or percentage weights for each assignment
         - Calculate cumulative grade impact for each assignment category
         - Identify assignment descriptions, requirements, and submission instructions
         - Note any prerequisites or dependencies between assignments
         - Extract grading criteria or rubrics when available
         - Identify estimated time commitment for major assignments when mentioned
         - Note any group/collaborative vs. individual work specifications

      4. COURSE CONTENT STRUCTURE:
         - Identify the full sequence of lecture topics with their corresponding dates
         - Extract reading assignments with source materials and page numbers
         - Map topics to their relevant assignments and assessments
         - Identify key concepts, learning objectives, and expected outcomes
         - Recognize module or unit structures that group related topics
         - Identify cumulative vs. non-cumulative exam coverage
         - Note any prerequisite knowledge or skills mentioned

      5. POLICY INFORMATION:
         - Extract attendance policies and requirements
         - Identify late submission and make-up work policies
         - Note any technology requirements or resources needed
         - Extract academic integrity policies and consequences
         - Identify accessibility/accommodations information
         - Extract communication policies and preferred contact methods
         - Note any specific study resource recommendations (tutoring, study groups, etc.)

      6. STUDY PLANNING INSIGHTS:
         - Identify high-stakes assignments or exams (by weight or explicit statement)
         - Recognize stated difficulty levels for topics or assignments when mentioned
         - Detect sequential topics that build on each other
         - Identify explicit study recommendations or tips from the instructor
         - Note review session dates or office hours specifically for exam preparation
      
      OUTPUT FORMAT:
      Return a valid, properly formatted JSON object with the following structure:
      {
        "courseCode": "string or null",
        "courseName": "string or null",
        "instructor": "string or null",
        "term": "string or null",
        "events": [
          {
            "eventType": "assignment|homework|quiz|exam|midterm|final|project|presentation|paper|reading|lab|discussion|other",
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
    const result = await textModel.generateContent(prompt);
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