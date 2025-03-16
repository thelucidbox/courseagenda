import { Router, type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertSyllabusSchema, 
  insertCourseEventSchema, 
  insertStudyPlanSchema, 
  insertStudySessionSchema,
  type InsertSyllabus,
  type InsertCourseEvent,
  type InsertStudyPlan,
  type InsertStudySession
} from "@shared/schema";
import multer from "multer";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { extractSyllabusInfo, extractInfoFromPDF } from "./services/gemini";

// Setup multer for file uploads
const upload = multer({ 
  dest: path.join(os.tmpdir(), 'syllabus-uploads'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = Router();
  
  // Authentication middleware (for demonstration, assumes userId = 1)
  apiRouter.use((req, res, next) => {
    // In a real app, you would get userId from session/token
    req.userId = 1;
    next();
  });

  // PDF upload endpoint
  apiRouter.post('/syllabi/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Create syllabus record with the uploaded status
      const syllabusData: InsertSyllabus = {
        userId: req.userId as number,
        filename: req.file.originalname,
        textContent: 'Processing with Gemini Vision...',
        status: 'uploaded'
      };

      const syllabus = await storage.createSyllabus(syllabusData);
      
      // Process the PDF file with Gemini Vision API in the background
      // We'll inform the client the syllabus is being processed and they can check back later
      const processAndUpdateSyllabus = async () => {
        try {
          console.log(`Processing uploaded PDF with Gemini Vision: ${req.file?.path}`);
          
          // Extract information using Gemini Vision API
          const extractedInfo = await extractInfoFromPDF(req.file!.path, syllabus.id);
          
          // Process extracted text content from pages (if available)
          let extractedText = '';
          if (req.body.textContent && req.body.textContent.length > 0) {
            extractedText = req.body.textContent;
          } else {
            // Use a placeholder if client didn't provide text content
            extractedText = 'Analyzed directly by Gemini Vision API';
          }
          
          // Update syllabus with extracted information
          await storage.updateSyllabusInfo(syllabus.id, {
            courseCode: extractedInfo.courseCode,
            courseName: extractedInfo.courseName,
            instructor: extractedInfo.instructor,
            term: extractedInfo.term,
            textContent: extractedText,
            status: 'processed'
          });
          
          // Create course events
          for (const event of extractedInfo.events) {
            await storage.createCourseEvent(event);
          }
          
          console.log(`Successfully processed PDF with Gemini Vision. Found ${extractedInfo.events.length} events.`);
        } catch (error) {
          console.error('Error processing PDF with Gemini Vision:', error);
          await storage.updateSyllabusInfo(syllabus.id, {
            status: 'error',
            textContent: `Error processing with Gemini Vision: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        } finally {
          // Remove temp file after processing
          try {
            if (req.file?.path && fs.existsSync(req.file.path)) {
              fs.unlinkSync(req.file.path);
            }
          } catch (error) {
            console.error('Error removing temp file:', error);
          }
        }
      };
      
      // Start background processing
      processAndUpdateSyllabus();
      
      // Respond immediately to the client
      return res.status(201).json({
        ...syllabus,
        message: 'Syllabus uploaded and is being processed with Gemini Vision API'
      });
    } catch (error) {
      // Clean up temp file if there was an error
      if (req.file?.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (error) {
          console.error('Error removing temp file:', error);
        }
      }
      
      console.error('Upload error:', error);
      return res.status(500).json({ message: 'Failed to upload and process syllabus' });
    }
  });

  // Get all syllabi for logged-in user
  apiRouter.get('/syllabi', async (req, res) => {
    try {
      const syllabi = await storage.getSyllabiByUser(req.userId as number);
      return res.status(200).json(syllabi);
    } catch (error) {
      console.error('Error fetching syllabi:', error);
      return res.status(500).json({ message: 'Failed to fetch syllabi' });
    }
  });

  // Get specific syllabus
  apiRouter.get('/syllabi/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const syllabus = await storage.getSyllabus(id);
      
      if (!syllabus) {
        return res.status(404).json({ message: 'Syllabus not found' });
      }
      
      return res.status(200).json(syllabus);
    } catch (error) {
      console.error('Error fetching syllabus:', error);
      return res.status(500).json({ message: 'Failed to fetch syllabus' });
    }
  });

  // Extract info from syllabus using Gemini AI
  apiRouter.post('/syllabi/:id/extract', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const syllabus = await storage.getSyllabus(id);
      
      if (!syllabus) {
        return res.status(404).json({ message: 'Syllabus not found' });
      }
      
      // Get the syllabus text content
      const textContent = syllabus.textContent || '';
      
      // Use Gemini AI to extract information from the syllabus
      console.log('Extracting information from syllabus using Gemini AI...');
      const extractedInfo = await extractSyllabusInfo(textContent, id);
      
      // Update syllabus with extracted course information
      const updatedSyllabus = await storage.updateSyllabusInfo(id, {
        courseCode: extractedInfo.courseCode,
        courseName: extractedInfo.courseName,
        instructor: extractedInfo.instructor,
        term: extractedInfo.term,
        status: 'processed'
      });
      
      // Create course events
      const createdEvents = [];
      
      for (const event of extractedInfo.events) {
        const createdEvent = await storage.createCourseEvent(event);
        createdEvents.push(createdEvent);
      }
      
      return res.status(200).json({
        syllabus: updatedSyllabus,
        events: createdEvents
      });
    } catch (error) {
      console.error('Extraction error:', error);
      return res.status(500).json({ message: 'Failed to extract information from syllabus using Gemini AI' });
    }
  });

  // Handle calendar permissions for a syllabus
  apiRouter.post('/syllabi/:id/calendar-permissions', async (req, res) => {
    try {
      const syllabusId = Number(req.params.id);
      const { provider } = req.body;
      
      if (!provider) {
        return res.status(400).json({ message: 'Calendar provider is required' });
      }
      
      // Update syllabus with calendar provider info
      // This would typically involve OAuth flow with the provider
      // For now, we'll just update a flag in the syllabus data
      const updatedSyllabus = await storage.updateSyllabusInfo(syllabusId, {
        calendarProvider: provider,
        calendarIntegrated: true
      });
      
      if (!updatedSyllabus) {
        return res.status(404).json({ message: 'Syllabus not found' });
      }
      
      return res.status(200).json({ success: true, provider });
    } catch (error) {
      console.error('Error setting calendar permissions:', error);
      return res.status(500).json({ message: 'Failed to set calendar permissions' });
    }
  });

  // Get course events for a syllabus
  apiRouter.get('/syllabi/:id/events', async (req, res) => {
    try {
      const syllabusId = Number(req.params.id);
      const events = await storage.getCourseEvents(syllabusId);
      return res.status(200).json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      return res.status(500).json({ message: 'Failed to fetch course events' });
    }
  });

  // Create a study plan
  apiRouter.post('/study-plans', async (req, res) => {
    try {
      const validatedData = insertStudyPlanSchema.parse(req.body);
      
      const studyPlan = await storage.createStudyPlan({
        ...validatedData,
        userId: req.userId as number
      });
      
      return res.status(201).json(studyPlan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid study plan data', errors: error.errors });
      }
      console.error('Error creating study plan:', error);
      return res.status(500).json({ message: 'Failed to create study plan' });
    }
  });

  // Get study plans for a user
  apiRouter.get('/study-plans', async (req, res) => {
    try {
      const studyPlans = await storage.getStudyPlansByUser(req.userId as number);
      return res.status(200).json(studyPlans);
    } catch (error) {
      console.error('Error fetching study plans:', error);
      return res.status(500).json({ message: 'Failed to fetch study plans' });
    }
  });

  // Get a specific study plan
  apiRouter.get('/study-plans/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const studyPlan = await storage.getStudyPlan(id);
      
      if (!studyPlan) {
        return res.status(404).json({ message: 'Study plan not found' });
      }
      
      return res.status(200).json(studyPlan);
    } catch (error) {
      console.error('Error fetching study plan:', error);
      return res.status(500).json({ message: 'Failed to fetch study plan' });
    }
  });

  // Create study sessions for a study plan
  apiRouter.post('/study-plans/:id/sessions', async (req, res) => {
    try {
      const studyPlanId = Number(req.params.id);
      const studyPlan = await storage.getStudyPlan(studyPlanId);
      
      if (!studyPlan) {
        return res.status(404).json({ message: 'Study plan not found' });
      }
      
      const validatedData = insertStudySessionSchema.parse(req.body);
      
      const studySession = await storage.createStudySession({
        ...validatedData,
        studyPlanId
      });
      
      return res.status(201).json(studySession);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid study session data', errors: error.errors });
      }
      console.error('Error creating study session:', error);
      return res.status(500).json({ message: 'Failed to create study session' });
    }
  });

  // Get study sessions for a study plan
  apiRouter.get('/study-plans/:id/sessions', async (req, res) => {
    try {
      const studyPlanId = Number(req.params.id);
      const sessions = await storage.getStudySessions(studyPlanId);
      return res.status(200).json(sessions);
    } catch (error) {
      console.error('Error fetching study sessions:', error);
      return res.status(500).json({ message: 'Failed to fetch study sessions' });
    }
  });

  // Update calendar integration status
  apiRouter.post('/study-plans/:id/calendar-integration', async (req, res) => {
    try {
      const studyPlanId = Number(req.params.id);
      const { provider, courseSchedule } = req.body;
      
      if (!provider) {
        return res.status(400).json({ message: 'Calendar provider is required' });
      }
      
      const studyPlan = await storage.getStudyPlan(studyPlanId);
      
      if (!studyPlan) {
        return res.status(404).json({ message: 'Study plan not found' });
      }
      
      // Get the associated syllabus for course schedule information
      const syllabus = await storage.getSyllabus(studyPlan.syllabusId);
      
      if (!syllabus) {
        return res.status(404).json({ message: 'Associated syllabus not found' });
      }
      
      // Update syllabus with course schedule information if provided
      if (courseSchedule) {
        await storage.updateSyllabusInfo(syllabus.id, {
          firstDayOfClass: courseSchedule.firstDayOfClass,
          lastDayOfClass: courseSchedule.lastDayOfClass,
          meetingDays: courseSchedule.meetingDays,
          meetingTimeStart: courseSchedule.meetingTimeStart,
          meetingTimeEnd: courseSchedule.meetingTimeEnd
        });
      }
      
      // Get study sessions
      const studySessions = await storage.getStudySessions(studyPlanId);
      
      // In a real app, we would:
      // 1. Use the provider to determine which calendar service to use
      // 2. Use the study sessions and course schedule to create calendar events
      // 3. Authenticate with the calendar service
      // 4. Create events in the calendar
      
      // For this demo, we'll mark the study plan as integrated
      const updatedStudyPlan = await storage.updateStudyPlan(studyPlanId, {
        calendarIntegrated: true
      });
      
      // For each study session, we would create a calendar event
      // Here we're just simulating by adding a calendarEventId
      for (const session of studySessions) {
        if (!session.calendarEventId) {
          await storage.updateStudySession(session.id, {
            calendarEventId: `cal-${provider}-${Date.now()}-${session.id}`
          });
        }
      }
      
      // If course schedule is provided, we would also create recurring events for class meetings
      // This would involve creating events for each meeting day between firstDayOfClass and lastDayOfClass
      
      return res.status(200).json({ 
        studyPlan: updatedStudyPlan, 
        sessions: studySessions,
        message: `Successfully integrated with ${provider} calendar` 
      });
    } catch (error) {
      console.error('Error updating calendar integration:', error);
      return res.status(500).json({ message: 'Failed to update calendar integration' });
    }
  });

  // Register API routes
  app.use('/api', apiRouter);

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}

// Helper function to extract event data from syllabus text content
// This is a simplified version - in production this would use NLP
function extractEvents(text: string, eventType: string): Array<{
  title: string;
  description: string;
  type: string;
  date: Date;
}> {
  const events = [];
  const eventTypePatterns = {
    assignment: /(?:assignment|homework|project)/i,
    exam: /(?:exam|midterm|final|test)/i,
    quiz: /(?:quiz|quizzes)/i
  };

  // Match pattern based on eventType
  const pattern = eventTypePatterns[eventType as keyof typeof eventTypePatterns];
  
  // Simple regex to find dates with potential assignment info
  // Format: Assignment/Project/Exam/etc. name/title - MM/DD/YYYY or Month Day, Year
  const dateRegex = new RegExp(`(${pattern.source}[^\\n.]*?)(?:due|on|date)?[:\\s-]?\\s*(?:(\\d{1,2}[\\/\\-]\\d{1,2}[\\/\\-]\\d{2,4})|(January|February|March|April|May|June|July|August|September|October|November|December)\\s+\\d{1,2}(?:st|nd|rd|th)?(?:,)?\\s+\\d{4})`, 'gi');
  
  let match;
  while ((match = dateRegex.exec(text)) !== null) {
    const title = match[1].trim();
    let dateStr = match[2] || match[3]; // Either MM/DD/YYYY or Month Day, Year
    
    // Try to parse the date
    let date;
    try {
      date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        // If direct parsing fails, try to handle MM/DD/YYYY format
        const dateParts = dateStr.split(/[\/\-]/);
        // Assuming MM/DD/YYYY format
        if (dateParts.length === 3) {
          const month = parseInt(dateParts[0]) - 1; // JS months are 0-indexed
          const day = parseInt(dateParts[1]);
          let year = parseInt(dateParts[2]);
          // Handle 2-digit years
          if (year < 100) {
            year += year < 50 ? 2000 : 1900;
          }
          date = new Date(year, month, day);
        }
      }
      
      // If we have a valid date, add the event
      if (!isNaN(date.getTime())) {
        events.push({
          title,
          description: `Extracted from syllabus - ${title}`,
          type: eventType,
          date
        });
      }
    } catch (e) {
      // Skip invalid dates
      console.error("Error parsing date:", e);
    }
  }
  
  return events;
}

// Type definition for Express Request with userId
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}
