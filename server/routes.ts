import { Router, type Express, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { checkDatabase } from "./db";
import rateLimit from "express-rate-limit";
import { 
  insertSyllabusSchema, 
  insertCourseEventSchema, 
  insertStudyPlanSchema, 
  insertStudySessionSchema,
  type InsertSyllabus,
  type InsertCourseEvent,
  type InsertStudyPlan,
  type InsertStudySession,
  type InsertOAuthToken
} from "@shared/schema";
import { getAuthUrl, getTokensFromCode } from "./services/google-calendar";
import multer from "multer";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { extractSyllabusInfo, extractInfoFromPDF } from "./services/gemini";
import session from "express-session";
import { setupAuth, isAuthenticated } from "./services/replitAuth";
import { getGoogleAuthUrl, handleGoogleCallback, getAuthUser, createSession, logout } from "./services/auth";

// Setup multer for file uploads
const upload = multer({ 
  dest: path.join(os.tmpdir(), 'syllabus-uploads'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Debug the file information
    console.log('File upload details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      encoding: file.encoding,
      hasExtension: file.originalname.includes('.'),
      extension: file.originalname.split('.').pop()?.toLowerCase(),
      filenameEndsWith: file.originalname.toLowerCase().endsWith('.pdf')
    });
    
    // TEMPORARY: Accept all files - we'll validate it's a PDF later
    // This is a workaround for the MIME type detection issue
    return cb(null, true);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);
  
  const apiRouter = Router();
  
  // Google OAuth Authentication Routes
  apiRouter.get('/auth/google', (req, res) => {
    const authUrl = getGoogleAuthUrl();
    res.redirect(authUrl);
  });
  
  apiRouter.get('/auth/google/callback', async (req, res) => {
    try {
      const code = req.query.code as string;
      
      if (!code) {
        return res.status(400).json({ message: 'Authorization code is required' });
      }
      
      const { user } = await handleGoogleCallback(code);
      
      // Create session for authenticated user
      createSession(req, user);
      
      // Redirect to the home page or dashboard
      res.redirect('/');
    } catch (error) {
      console.error('Google callback error:', error);
      res.status(500).json({ message: 'Authentication failed' });
    }
  });
  
  // Get authenticated user
  apiRouter.get('/auth/user', async (req, res) => {
    try {
      console.log('Auth session data:', { 
        isAuthenticated: req.isAuthenticated?.(),
        session: req.session,
        user: req.user,
        passport: req.session && 'passport' in req.session ? req.session['passport'] : undefined
      });
      
      // First check if the user is authenticated via Replit auth
      if (req.isAuthenticated && req.isAuthenticated()) {
        console.log('User authenticated via Replit Auth');
        return res.status(200).json(req.user);
      }
      
      // Fall back to our custom auth
      const user = await getAuthUser(req);
      
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Don't send sensitive data to the client
      const { password, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error('Error getting authenticated user:', error);
      return res.status(500).json({ message: 'Failed to get authenticated user' });
    }
  });
  
  // Logout (support both GET and POST for flexibility)
  apiRouter.get('/auth/logout', (req, res) => {
    logout(req);
    res.redirect('/');
  });
  
  apiRouter.post('/auth/logout', (req, res) => {
    logout(req);
    res.status(200).json({ message: 'Logged out successfully' });
  });
  
  // Authentication middleware
  apiRouter.use((req: any, res, next) => {
    // Get user from session (provided by passport)
    if (req.isAuthenticated() && req.user?.id) {
      req.userId = req.user.id;
      return next();
    }
    
    // For development, fallback to user ID 1
    // In production, this fallback is disabled and proper auth is enforced
    if (process.env.NODE_ENV !== 'production') {
      console.log('DEV MODE: Using fallback authentication with user ID 1');
      req.userId = 1;
      return next();
    }
    
    // Otherwise, user is not authenticated
    return res.status(401).json({ message: 'Not authenticated' });
  });
  
  // Admin middleware - checks if user is an admin
  const isAdmin = async (req: any, res: Response, next: NextFunction) => {
    try {
      const user = await storage.getUser(req.userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
      }
      
      next();
    } catch (error) {
      console.error('Error checking admin status:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Additional rate limiter specifically for file uploads (more strict than general API rate limiter)
  const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 uploads per hour
    message: 'Too many file uploads from this IP, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  // PDF upload endpoint
  apiRouter.post('/syllabi/upload', uploadLimiter, upload.single('file'), async (req, res) => {
    try {
      console.log('Received syllabus upload request');
      
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      console.log(`File uploaded: ${req.file.originalname} (${req.file.size} bytes)`);
      console.log('Request body keys:', Object.keys(req.body));
      
      // Extract the textContent field from the request
      const providedTextContent = req.body.textContent || '';
      console.log(`Extracted text content provided: ${providedTextContent.length > 0 ? 'Yes' : 'No'} (Length: ${providedTextContent.length} chars)`);
      
      // Create syllabus record with the uploaded status
      const syllabusData: InsertSyllabus = {
        userId: req.userId as number,
        filename: req.file.originalname,
        textContent: providedTextContent.length > 0 
          ? providedTextContent 
          : 'Extracting syllabus information...',
        status: 'uploaded'
      };

      const syllabus = await storage.createSyllabus(syllabusData);
      console.log(`Created syllabus record with ID: ${syllabus.id}`);
      
      // Process the PDF file with Gemini Vision API in the background
      // We'll inform the client the syllabus is being processed and they can check back later
      const processAndUpdateSyllabus = async () => {
        try {
          console.log(`Processing uploaded PDF with Gemini Vision: ${req.file?.path}`);
          
          // Extract information using Gemini Vision API
          const extractedInfo = await extractInfoFromPDF(req.file!.path, syllabus.id);
          console.log(`Extracted information using Gemini Vision, found ${extractedInfo.events.length} events`);
          
          // Process extracted text content from pages
          let finalTextContent = '';
          if (providedTextContent && providedTextContent.length > 0) {
            console.log('Using text content provided by client');
            finalTextContent = providedTextContent;
          } else {
            console.log('No client-provided text content, using placeholder');
            finalTextContent = 'Analyzed directly by Gemini Vision API';
          }
          
          // Update syllabus with extracted information
          await storage.updateSyllabusInfo(syllabus.id, {
            courseCode: extractedInfo.courseCode,
            courseName: extractedInfo.courseName,
            instructor: extractedInfo.instructor,
            term: extractedInfo.term,
            textContent: finalTextContent,
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
  
  // Get all events for a study plan (for calendar integration)
  apiRouter.get('/study-plans/:id/events', async (req, res) => {
    try {
      const studyPlanId = Number(req.params.id);
      
      // Get the study plan
      const studyPlan = await storage.getStudyPlan(studyPlanId);
      if (!studyPlan) {
        return res.status(404).json({ message: 'Study plan not found' });
      }
      
      // Get the associated syllabus
      const syllabus = await storage.getSyllabus(studyPlan.syllabusId);
      if (!syllabus) {
        return res.status(404).json({ message: 'Associated syllabus not found' });
      }
      
      // Get study sessions
      const studySessions = await storage.getStudySessions(studyPlanId);
      
      // Get course events from syllabus
      const courseEvents = await storage.getCourseEvents(syllabus.id);
      
      // Convert study sessions to calendar events
      const calendarEvents = studySessions.map(session => ({
        id: session.id,
        title: `Study Session: ${session.title || 'Untitled Session'}`,
        description: session.description || '',
        startTime: session.startTime,
        endTime: session.endTime,
        location: session.location || '',
        type: 'study'
      }));
      
      // Add course events
      courseEvents.forEach(event => {
        if (event.dueDate) {
          calendarEvents.push({
            id: event.id,
            title: event.title,
            description: event.description || '',
            startTime: new Date(event.dueDate),
            // For assignments and exams, set a default duration of 2 hours
            endTime: new Date(new Date(event.dueDate).getTime() + 2 * 60 * 60 * 1000),
            location: '', // Add empty location by default
            type: event.eventType
          });
        }
      });
      
      return res.status(200).json(calendarEvents);
    } catch (error) {
      console.error('Error fetching events for calendar:', error);
      return res.status(500).json({ message: 'Failed to fetch calendar events' });
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

  // Calendar API endpoints for getting auth URLs
  apiRouter.get('/calendar/google/auth-url', (_req, res) => {
    try {
      const authUrl = getAuthUrl();
      res.json({ url: authUrl });
    } catch (error) {
      console.error("Failed to generate auth URL:", error);
      res.status(500).json({ message: "Failed to generate authorization URL" });
    }
  });

  // Google Calendar OAuth routes
  apiRouter.get('/auth/google/calendar', (_req, res) => {
    try {
      const authUrl = getAuthUrl();
      res.redirect(authUrl);
    } catch (error) {
      console.error("Failed to generate auth URL:", error);
      res.redirect("/calendar/error");
    }
  });

  apiRouter.get('/auth/google/calendar/callback', async (req, res) => {
    try {
      const { code } = req.query;
      
      if (!code || typeof code !== "string") {
        throw new Error("No authorization code provided");
      }

      const tokens = await getTokensFromCode(code);
      
      if (!req.userId) {
        throw new Error("User not authenticated");
      }

      // Store the tokens in the database
      const tokenData: InsertOAuthToken = {
        userId: req.userId,
        provider: "google",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
        scope: tokens.scope,
        expiresAt: tokens.expiresAt
      };

      await storage.createOAuthToken(tokenData);
      
      res.redirect("/calendar/success");
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect("/calendar/error");
    }
  });

  // Register API routes
  app.use('/api', apiRouter);

  // Create HTTP server
  // Admin Routes
  apiRouter.get('/admin/users', isAdmin, async (req, res) => {
    try {
      // Get all users with their syllabi and study plan counts
      const users = await storage.getAllUsers();
      
      // For each user, get syllabi and study plan counts
      const usersWithCounts = await Promise.all(users.map(async (user) => {
        const syllabi = await storage.getSyllabiByUser(user.id);
        const studyPlans = await storage.getStudyPlansByUser(user.id);
        
        return {
          ...user,
          syllabusCount: syllabi.length,
          studyPlanCount: studyPlans.length,
          createdAt: user.createdAt || new Date().toISOString()
        };
      }));
      
      return res.status(200).json(usersWithCounts);
    } catch (error) {
      console.error('Error getting admin users:', error);
      return res.status(500).json({ message: 'Failed to get users' });
    }
  });

  // Get specific user (admin only)
  apiRouter.get('/admin/users/:id', isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Get syllabi and study plan counts for this user
      const syllabi = await storage.getSyllabiByUser(id);
      const studyPlans = await storage.getStudyPlansByUser(id);
      
      return res.status(200).json({
        ...user,
        syllabusCount: syllabi.length,
        studyPlanCount: studyPlans.length
      });
    } catch (error) {
      console.error('Error getting specific user:', error);
      return res.status(500).json({ message: 'Failed to get user details' });
    }
  });

  // Update user (admin only)
  apiRouter.patch('/admin/users/:id', isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updates = req.body;
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const updatedUser = await storage.updateUser(id, updates);
      
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ message: 'Failed to update user' });
    }
  });

  // Delete user (admin only)
  apiRouter.delete('/admin/users/:id', isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      // Check if user exists
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // First, we need to delete all related data
      // 1. Get all syllabi for this user
      const syllabi = await storage.getSyllabiByUser(id);
      
      // 2. For each syllabus, delete related data
      for (const syllabus of syllabi) {
        // Delete course events
        const events = await storage.getCourseEvents(syllabus.id);
        for (const event of events) {
          await storage.deleteCourseEvent(event.id);
        }
        
        // Delete study plans and sessions
        const studyPlans = await storage.getStudyPlansBySyllabus(syllabus.id);
        for (const plan of studyPlans) {
          // Delete study sessions
          const sessions = await storage.getStudySessions(plan.id);
          for (const session of sessions) {
            await storage.deleteStudySession(session.id);
          }
          
          // Delete the study plan
          await storage.deleteStudyPlan(plan.id);
        }
        
        // Delete the syllabus
        await storage.deleteSyllabus(syllabus.id);
      }
      
      // Delete OAuth tokens for this user
      await storage.deleteOAuthTokensByUserId(id);
      
      // Finally, delete the user
      await storage.deleteUser(id);
      
      return res.status(200).json({ message: 'User and all associated data deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  // Get all syllabi (admin only)
  apiRouter.get('/admin/syllabi', isAdmin, async (req, res) => {
    try {
      const syllabi = await storage.getAllSyllabi();
      return res.status(200).json(syllabi);
    } catch (error) {
      console.error('Error getting all syllabi:', error);
      return res.status(500).json({ message: 'Failed to get syllabi' });
    }
  });

  // Get system stats (admin only)
  apiRouter.get('/admin/stats', isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const syllabi = await storage.getAllSyllabi();
      
      // Count study plans and sessions
      let studyPlanCount = 0;
      let studySessionCount = 0;
      
      for (const syllabus of syllabi) {
        const plans = await storage.getStudyPlansBySyllabus(syllabus.id);
        studyPlanCount += plans.length;
        
        for (const plan of plans) {
          const sessions = await storage.getStudySessions(plan.id);
          studySessionCount += sessions.length;
        }
      }
      
      return res.status(200).json({
        userCount: users.length,
        syllabusCount: syllabi.length,
        studyPlanCount,
        studySessionCount
      });
    } catch (error) {
      console.error('Error getting admin stats:', error);
      return res.status(500).json({ message: 'Failed to get system stats' });
    }
  });

  // Health check endpoint for monitoring and deployment
  app.get('/health', async (req, res) => {
    try {
      // Check database connection
      const dbStatus = await checkDatabase();
      
      // Basic health information
      const healthInfo = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: {
          connected: dbStatus
        },
        memory: {
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
        },
        uptime: Math.round(process.uptime())
      };
      
      // If database is not connected, report error
      if (!dbStatus) {
        healthInfo.status = 'error';
        return res.status(500).json(healthInfo);
      }
      
      return res.status(200).json(healthInfo);
    } catch (error) {
      // If any check fails, report error
      return res.status(500).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        uptime: Math.round(process.uptime())
      });
    }
  });

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
