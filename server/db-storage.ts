import { 
  users, syllabi, courseEvents, studyPlans, studySessions, oauthTokens,
  type User, type InsertUser,
  type Syllabus, type InsertSyllabus,
  type CourseEvent, type InsertCourseEvent,
  type StudyPlan, type InsertStudyPlan,
  type StudySession, type InsertStudySession,
  type OAuthToken, type InsertOAuthToken
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { IStorage } from "./storage";
import session from "express-session";
import connectPg from "connect-pg-simple";

// Setup PostgreSQL session store
const PostgresSessionStore = connectPg(session);
const pgSessionStore = new PostgresSessionStore({
  conObject: {
    connectionString: process.env.DATABASE_URL,
  },
  createTableIfMissing: true
});

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = pgSessionStore;
  }

  // OAuth operations
  async createOAuthToken(insertToken: InsertOAuthToken): Promise<OAuthToken> {
    const [token] = await db.insert(oauthTokens)
      .values({
        ...insertToken,
        createdAt: new Date(),
        updatedAt: new Date(),
        refreshToken: insertToken.refreshToken ?? null,
        expiresAt: insertToken.expiresAt ?? null,
        scope: insertToken.scope ?? null
      })
      .returning();
    return token;
  }

  async getOAuthToken(userId: number, provider: string): Promise<OAuthToken | undefined> {
    const [token] = await db.select()
      .from(oauthTokens)
      .where(and(
        eq(oauthTokens.userId, userId),
        eq(oauthTokens.provider, provider)
      ));
    return token;
  }

  async updateOAuthToken(id: number, updates: Partial<InsertOAuthToken>): Promise<OAuthToken | undefined> {
    const [token] = await db.update(oauthTokens)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(oauthTokens.id, id))
      .returning();
    return token;
  }

  async deleteOAuthTokensByUserId(userId: number): Promise<void> {
    await db.delete(oauthTokens)
      .where(eq(oauthTokens.userId, userId));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.googleId, googleId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users)
      .values({
        ...insertUser,
        password: insertUser.password ?? null,
        displayName: insertUser.displayName ?? null,
        initials: insertUser.initials ?? null,
        email: insertUser.email ?? null,
        googleId: insertUser.googleId ?? null,
        profileImageUrl: insertUser.profileImageUrl ?? null,
        authProvider: insertUser.authProvider ?? null,
        role: insertUser.role ?? "user",
        createdAt: new Date(),
        subscriptionStatus: insertUser.subscriptionStatus ?? "free",
        subscriptionExpiry: insertUser.subscriptionExpiry ?? null
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users)
      .where(eq(users.id, id));
  }

  // Syllabus operations
  async createSyllabus(insertSyllabus: InsertSyllabus): Promise<Syllabus> {
    const [syllabus] = await db.insert(syllabi)
      .values({
        ...insertSyllabus,
        courseCode: insertSyllabus.courseCode ?? null,
        courseName: insertSyllabus.courseName ?? null,
        instructor: insertSyllabus.instructor ?? null,
        term: insertSyllabus.term ?? null,
        uploadedAt: new Date(),
        textContent: insertSyllabus.textContent ?? null,
        status: insertSyllabus.status ?? "uploaded",
        firstDayOfClass: insertSyllabus.firstDayOfClass ?? null,
        lastDayOfClass: insertSyllabus.lastDayOfClass ?? null,
        meetingDays: insertSyllabus.meetingDays ?? [],
        meetingTimeStart: insertSyllabus.meetingTimeStart ?? null,
        meetingTimeEnd: insertSyllabus.meetingTimeEnd ?? null,
        calendarProvider: insertSyllabus.calendarProvider ?? null,
        calendarIntegrated: insertSyllabus.calendarIntegrated ?? false
      })
      .returning();
    return syllabus;
  }

  async getSyllabus(id: number): Promise<Syllabus | undefined> {
    const [syllabus] = await db.select()
      .from(syllabi)
      .where(eq(syllabi.id, id));
    return syllabus;
  }

  async getSyllabiByUser(userId: number): Promise<Syllabus[]> {
    return await db.select()
      .from(syllabi)
      .where(eq(syllabi.userId, userId));
  }

  async updateSyllabusStatus(id: number, status: string): Promise<Syllabus | undefined> {
    const [syllabus] = await db.update(syllabi)
      .set({ status })
      .where(eq(syllabi.id, id))
      .returning();
    return syllabus;
  }

  async updateSyllabusInfo(id: number, info: Partial<InsertSyllabus>): Promise<Syllabus | undefined> {
    const [syllabus] = await db.update(syllabi)
      .set(info)
      .where(eq(syllabi.id, id))
      .returning();
    return syllabus;
  }

  async getAllSyllabi(): Promise<Syllabus[]> {
    return await db.select().from(syllabi);
  }

  async deleteSyllabus(id: number): Promise<void> {
    await db.delete(syllabi)
      .where(eq(syllabi.id, id));
  }

  // Course events operations
  async createCourseEvent(insertEvent: InsertCourseEvent): Promise<CourseEvent> {
    const [event] = await db.insert(courseEvents)
      .values({
        ...insertEvent,
        createdAt: new Date(),
        description: insertEvent.description ?? null
      })
      .returning();
    return event;
  }

  async getCourseEvents(syllabusId: number): Promise<CourseEvent[]> {
    return await db.select()
      .from(courseEvents)
      .where(eq(courseEvents.syllabusId, syllabusId));
  }

  async deleteCourseEvent(id: number): Promise<void> {
    await db.delete(courseEvents)
      .where(eq(courseEvents.id, id));
  }

  // Study plan operations
  async createStudyPlan(insertPlan: InsertStudyPlan): Promise<StudyPlan> {
    const [plan] = await db.insert(studyPlans)
      .values({
        ...insertPlan,
        createdAt: new Date(),
        description: insertPlan.description ?? null,
        calendarIntegrated: insertPlan.calendarIntegrated ?? null
      })
      .returning();
    return plan;
  }

  async getStudyPlan(id: number): Promise<StudyPlan | undefined> {
    const [plan] = await db.select()
      .from(studyPlans)
      .where(eq(studyPlans.id, id));
    return plan;
  }

  async getStudyPlansBySyllabus(syllabusId: number): Promise<StudyPlan[]> {
    return await db.select()
      .from(studyPlans)
      .where(eq(studyPlans.syllabusId, syllabusId));
  }

  async getStudyPlansByUser(userId: number): Promise<StudyPlan[]> {
    return await db.select()
      .from(studyPlans)
      .where(eq(studyPlans.userId, userId));
  }

  async updateStudyPlan(id: number, updates: Partial<InsertStudyPlan>): Promise<StudyPlan | undefined> {
    const [plan] = await db.update(studyPlans)
      .set(updates)
      .where(eq(studyPlans.id, id))
      .returning();
    return plan;
  }

  async deleteStudyPlan(id: number): Promise<void> {
    await db.delete(studyPlans)
      .where(eq(studyPlans.id, id));
  }

  // Study session operations
  async createStudySession(insertSession: InsertStudySession): Promise<StudySession> {
    const [session] = await db.insert(studySessions)
      .values({
        ...insertSession,
        description: insertSession.description ?? null,
        calendarEventId: insertSession.calendarEventId ?? null,
        location: insertSession.location ?? null,
        eventType: insertSession.eventType ?? null,
        relatedEventId: insertSession.relatedEventId ?? null
      })
      .returning();
    return session;
  }

  async getStudySessions(studyPlanId: number): Promise<StudySession[]> {
    return await db.select()
      .from(studySessions)
      .where(eq(studySessions.studyPlanId, studyPlanId));
  }

  async updateStudySession(id: number, updates: Partial<InsertStudySession>): Promise<StudySession | undefined> {
    const [session] = await db.update(studySessions)
      .set(updates)
      .where(eq(studySessions.id, id))
      .returning();
    return session;
  }

  async deleteStudySession(id: number): Promise<void> {
    await db.delete(studySessions)
      .where(eq(studySessions.id, id));
  }
}