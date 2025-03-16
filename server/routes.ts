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
      
      // Create syllabus record without extracting text - client will handle this
      const syllabusData: InsertSyllabus = {
        userId: req.userId as number,
        filename: req.file.originalname,
        textContent: 'Uploaded. Text extraction pending.',
        status: 'uploaded'
      };

      const syllabus = await storage.createSyllabus(syllabusData);
      
      // Remove temp file
      fs.unlinkSync(req.file.path);
      
      return res.status(201).json(syllabus);
    } catch (error) {
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

  // Extract info from syllabus (in a real app, this would use NLP)
  apiRouter.post('/syllabi/:id/extract', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const syllabus = await storage.getSyllabus(id);
      
      if (!syllabus) {
        return res.status(404).json({ message: 'Syllabus not found' });
      }
      
      // Update syllabus with extracted course information
      // This is a simplified extraction that would be more sophisticated in production
      const textContent = syllabus.textContent || '';
      
      // Simple regex extraction for course information
      // In a real app, use NLP for more accurate extraction
      const courseCodeMatch = textContent.match(/(?:Course|Class) (?:Code|Number|ID)?\s*:?\s*([A-Z]{2,4}\s*\d{3,4}[A-Z0-9]*)/i);
      const courseNameMatch = textContent.match(/(?:Course|Class) (?:Title|Name)\s*:?\s*([^\n]+)/i);
      const instructorMatch = textContent.match(/(?:Professor|Instructor|Lecturer|Teacher|Faculty)\s*:?\s*([^\n]+)/i);
      const termMatch = textContent.match(/(?:Term|Semester|Quarter)\s*:?\s*([^\n]+)/i);
  
      // Extract dates for assignments, exams, etc.
      const assignments = extractEvents(textContent, 'assignment');
      const exams = extractEvents(textContent, 'exam');
      const quizzes = extractEvents(textContent, 'quiz');
      
      // Update syllabus with extracted info
      const updatedSyllabus = await storage.updateSyllabusInfo(id, {
        courseCode: courseCodeMatch?.[1]?.trim(),
        courseName: courseNameMatch?.[1]?.trim(),
        instructor: instructorMatch?.[1]?.trim(),
        term: termMatch?.[1]?.trim(),
        status: 'processed'
      });
      
      // Create course events for each extracted assignment, exam, quiz
      const allEvents = [...assignments, ...exams, ...quizzes];
      const createdEvents = [];
      
      for (const event of allEvents) {
        const eventData: InsertCourseEvent = {
          syllabusId: id,
          title: event.title,
          description: event.description,
          eventType: event.type,
          dueDate: event.date
        };
        
        const createdEvent = await storage.createCourseEvent(eventData);
        createdEvents.push(createdEvent);
      }
      
      return res.status(200).json({
        syllabus: updatedSyllabus,
        events: createdEvents
      });
    } catch (error) {
      console.error('Extraction error:', error);
      return res.status(500).json({ message: 'Failed to extract information from syllabus' });
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
      const studyPlan = await storage.getStudyPlan(studyPlanId);
      
      if (!studyPlan) {
        return res.status(404).json({ message: 'Study plan not found' });
      }
      
      // In a real app, this would integrate with Google Calendar API
      // For this demo, we'll just update the calendarIntegrated flag
      const updatedStudyPlan = await storage.updateStudyPlan(studyPlanId, {
        calendarIntegrated: true
      });
      
      return res.status(200).json(updatedStudyPlan);
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
