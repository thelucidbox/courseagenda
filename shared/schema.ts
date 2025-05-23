import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// OAuth token storage
export const oauthTokens = pgTable("oauth_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  provider: text("provider").notNull(), // 'google', 'microsoft', etc.
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  scope: text("scope"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),  // Making password optional for OAuth users
  displayName: text("display_name"),
  initials: text("initials"),
  email: text("email").unique(),
  googleId: text("google_id").unique(),
  profileImageUrl: text("profile_image_url"),
  authProvider: text("auth_provider"), // 'google', 'email', etc.
  role: text("role").default("user"), // 'user' or 'admin'
  createdAt: timestamp("created_at").defaultNow(),
  // Subscription fields
  subscriptionStatus: text("subscription_status").default("free"), // 'free', 'premium', 'lifetime'
  subscriptionExpiry: timestamp("subscription_expiry"),
});

export const syllabi = pgTable("syllabi", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  filename: text("filename").notNull(),
  courseCode: text("course_code"),
  courseName: text("course_name"),
  instructor: text("instructor"),
  term: text("term"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  textContent: text("text_content"),
  status: text("status").notNull().default("uploaded"), // uploaded, processed, error
  // Course schedule fields
  firstDayOfClass: timestamp("first_day_of_class"),
  lastDayOfClass: timestamp("last_day_of_class"),
  meetingDays: text("meeting_days").array(),
  meetingTimeStart: text("meeting_time_start"),
  meetingTimeEnd: text("meeting_time_end"),
  // Calendar integration fields
  calendarProvider: text("calendar_provider"),
  calendarIntegrated: boolean("calendar_integrated").default(false),
});

export const courseEvents = pgTable("course_events", {
  id: serial("id").primaryKey(),
  syllabusId: integer("syllabus_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  eventType: text("event_type").notNull(), // assignment, exam, quiz, etc.
  dueDate: timestamp("due_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const studyPlans = pgTable("study_plans", {
  id: serial("id").primaryKey(),
  syllabusId: integer("syllabus_id").notNull(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  calendarIntegrated: boolean("calendar_integrated").default(false),
});

export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  studyPlanId: integer("study_plan_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  calendarEventId: text("calendar_event_id"),
  location: text("location"),
  // Added fields for connecting sessions to course events
  eventType: text("event_type"),
  relatedEventId: integer("related_event_id"),
});

// Insert schemas
export const insertOAuthTokenSchema = createInsertSchema(oauthTokens).pick({
  userId: true,
  provider: true,
  accessToken: true,
  refreshToken: true,
  expiresAt: true,
  scope: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  initials: true,
  email: true,
  googleId: true,
  profileImageUrl: true,
  authProvider: true,
  role: true,
  subscriptionStatus: true,
  subscriptionExpiry: true,
});

export const insertSyllabusSchema = createInsertSchema(syllabi).pick({
  userId: true,
  filename: true,
  courseCode: true,
  courseName: true,
  instructor: true,
  term: true,
  textContent: true,
  status: true,
  // Course schedule fields
  firstDayOfClass: true,
  lastDayOfClass: true,
  meetingDays: true,
  meetingTimeStart: true,
  meetingTimeEnd: true,
  // Calendar integration fields
  calendarProvider: true,
  calendarIntegrated: true,
});

export const insertCourseEventSchema = createInsertSchema(courseEvents).pick({
  syllabusId: true,
  title: true,
  description: true,
  eventType: true,
  dueDate: true,
});

export const insertStudyPlanSchema = createInsertSchema(studyPlans).pick({
  syllabusId: true,
  userId: true,
  title: true,
  description: true,
  calendarIntegrated: true,
});

export const insertStudySessionSchema = createInsertSchema(studySessions).pick({
  studyPlanId: true,
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  calendarEventId: true,
  location: true,
  eventType: true,
  relatedEventId: true,
});

// Types
export type OAuthToken = typeof oauthTokens.$inferSelect;
export type InsertOAuthToken = z.infer<typeof insertOAuthTokenSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Syllabus = typeof syllabi.$inferSelect;
export type InsertSyllabus = z.infer<typeof insertSyllabusSchema>;

export type CourseEvent = typeof courseEvents.$inferSelect;
export type InsertCourseEvent = z.infer<typeof insertCourseEventSchema>;

export type StudyPlan = typeof studyPlans.$inferSelect;
export type InsertStudyPlan = z.infer<typeof insertStudyPlanSchema>;

export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;

// Extended schemas for frontend validation
export const syllabusUploadSchema = z.object({
  file: z.instanceof(File).refine((file) => file.type === 'application/pdf', {
    message: 'File must be a PDF',
  }),
});

export const calendarIntegrationSchema = z.object({
  provider: z.enum(['google', 'microsoft', 'apple']),
  code: z.string().optional(), // OAuth authorization code
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  expiresAt: z.date().optional(),
  scope: z.string().optional(),
});

// Schema for course schedule information
export const courseScheduleSchema = z.object({
  firstDayOfClass: z.date(),
  lastDayOfClass: z.date(),
  meetingDays: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])),
  meetingTimeStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Meeting time must be in format HH:MM (24-hour)"
  }),
  meetingTimeEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Meeting time must be in format HH:MM (24-hour)"
  }),
});
