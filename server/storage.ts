import {
  users, syllabi, courseEvents, studyPlans, studySessions, oauthTokens,
  type User, type InsertUser,
  type Syllabus, type InsertSyllabus,
  type CourseEvent, type InsertCourseEvent,
  type StudyPlan, type InsertStudyPlan,
  type StudySession, type InsertStudySession,
  type OAuthToken, type InsertOAuthToken
} from "@shared/schema";

export interface IStorage {
  // OAuth operations
  createOAuthToken(token: InsertOAuthToken): Promise<OAuthToken>;
  getOAuthToken(userId: number, provider: string): Promise<OAuthToken | undefined>;
  updateOAuthToken(id: number, updates: Partial<InsertOAuthToken>): Promise<OAuthToken | undefined>;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Syllabus operations
  createSyllabus(syllabus: InsertSyllabus): Promise<Syllabus>;
  getSyllabus(id: number): Promise<Syllabus | undefined>;
  getSyllabiByUser(userId: number): Promise<Syllabus[]>;
  updateSyllabusStatus(id: number, status: string): Promise<Syllabus | undefined>;
  updateSyllabusInfo(id: number, info: Partial<InsertSyllabus>): Promise<Syllabus | undefined>;

  // Course events operations
  createCourseEvent(event: InsertCourseEvent): Promise<CourseEvent>;
  getCourseEvents(syllabusId: number): Promise<CourseEvent[]>;
  
  // Study plan operations
  createStudyPlan(plan: InsertStudyPlan): Promise<StudyPlan>;
  getStudyPlan(id: number): Promise<StudyPlan | undefined>;
  getStudyPlansBySyllabus(syllabusId: number): Promise<StudyPlan[]>;
  getStudyPlansByUser(userId: number): Promise<StudyPlan[]>;
  updateStudyPlan(id: number, updates: Partial<InsertStudyPlan>): Promise<StudyPlan | undefined>;

  // Study session operations
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  getStudySessions(studyPlanId: number): Promise<StudySession[]>;
  updateStudySession(id: number, updates: Partial<InsertStudySession>): Promise<StudySession | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private syllabi: Map<number, Syllabus>;
  private courseEvents: Map<number, CourseEvent>;
  private studyPlans: Map<number, StudyPlan>;
  private studySessions: Map<number, StudySession>;
  
  private userIdCounter: number;
  private syllabusIdCounter: number;
  private courseEventIdCounter: number;
  private studyPlanIdCounter: number;
  private studySessionIdCounter: number;

  private oauthTokens: Map<number, OAuthToken>;
  private oauthTokenIdCounter: number;

  constructor() {
    this.users = new Map();
    this.syllabi = new Map();
    this.courseEvents = new Map();
    this.studyPlans = new Map();
    this.studySessions = new Map();
    this.oauthTokens = new Map();
    
    this.userIdCounter = 1;
    this.syllabusIdCounter = 1;
    this.courseEventIdCounter = 1;
    this.studyPlanIdCounter = 1;
    this.studySessionIdCounter = 1;
    this.oauthTokenIdCounter = 1;

    // Add a sample user for development
    this.createUser({
      username: "testuser",
      password: "password",
      displayName: "John Smith",
      initials: "JS"
    });
  }

  // OAuth operations
  async createOAuthToken(insertToken: InsertOAuthToken): Promise<OAuthToken> {
    const id = this.oauthTokenIdCounter++;
    const token: OAuthToken = {
      ...insertToken,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      refreshToken: insertToken.refreshToken ?? null,
      expiresAt: insertToken.expiresAt ?? null,
      scope: insertToken.scope ?? null
    };
    this.oauthTokens.set(id, token);
    return token;
  }

  async getOAuthToken(userId: number, provider: string): Promise<OAuthToken | undefined> {
    return Array.from(this.oauthTokens.values()).find(
      token => token.userId === userId && token.provider === provider
    );
  }

  async updateOAuthToken(id: number, updates: Partial<InsertOAuthToken>): Promise<OAuthToken | undefined> {
    const token = this.oauthTokens.get(id);
    if (!token) return undefined;
    
    const updatedToken = { 
      ...token, 
      ...updates,
      updatedAt: new Date()
    };
    this.oauthTokens.set(id, updatedToken);
    return updatedToken;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.googleId === googleId
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      password: insertUser.password ?? null,
      displayName: insertUser.displayName ?? null,
      initials: insertUser.initials ?? null,
      email: insertUser.email ?? null,
      googleId: insertUser.googleId ?? null,
      profileImageUrl: insertUser.profileImageUrl ?? null,
      authProvider: insertUser.authProvider ?? null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Syllabus operations
  async createSyllabus(insertSyllabus: InsertSyllabus): Promise<Syllabus> {
    const id = this.syllabusIdCounter++;
    
    // Create syllabus with proper types
    const syllabus: Syllabus = {
      id,
      userId: insertSyllabus.userId,
      filename: insertSyllabus.filename,
      courseCode: insertSyllabus.courseCode ?? null,
      courseName: insertSyllabus.courseName ?? null,
      instructor: insertSyllabus.instructor ?? null,
      term: insertSyllabus.term ?? null,
      uploadedAt: new Date(),
      textContent: insertSyllabus.textContent ?? null,
      status: insertSyllabus.status ?? "uploaded",
      // Course schedule fields with defaults
      firstDayOfClass: insertSyllabus.firstDayOfClass ?? null,
      lastDayOfClass: insertSyllabus.lastDayOfClass ?? null,
      meetingDays: insertSyllabus.meetingDays ?? [],
      meetingTimeStart: insertSyllabus.meetingTimeStart ?? null,
      meetingTimeEnd: insertSyllabus.meetingTimeEnd ?? null,
      // Calendar integration fields
      calendarProvider: insertSyllabus.calendarProvider ?? null,
      calendarIntegrated: insertSyllabus.calendarIntegrated ?? false
    };
    this.syllabi.set(id, syllabus);
    return syllabus;
  }

  async getSyllabus(id: number): Promise<Syllabus | undefined> {
    return this.syllabi.get(id);
  }

  async getSyllabiByUser(userId: number): Promise<Syllabus[]> {
    return Array.from(this.syllabi.values()).filter(
      (syllabus) => syllabus.userId === userId
    ).sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()); // Latest first
  }

  async updateSyllabusStatus(id: number, status: string): Promise<Syllabus | undefined> {
    const syllabus = this.syllabi.get(id);
    if (!syllabus) return undefined;
    
    const updatedSyllabus = { ...syllabus, status };
    this.syllabi.set(id, updatedSyllabus);
    return updatedSyllabus;
  }

  async updateSyllabusInfo(id: number, info: Partial<InsertSyllabus>): Promise<Syllabus | undefined> {
    const syllabus = this.syllabi.get(id);
    if (!syllabus) return undefined;
    
    const updatedSyllabus = { ...syllabus, ...info };
    this.syllabi.set(id, updatedSyllabus);
    return updatedSyllabus;
  }

  // Course events operations
  async createCourseEvent(insertEvent: InsertCourseEvent): Promise<CourseEvent> {
    const id = this.courseEventIdCounter++;
    const event: CourseEvent = {
      ...insertEvent,
      id,
      createdAt: new Date(),
      description: insertEvent.description ?? null
    };
    this.courseEvents.set(id, event);
    return event;
  }

  async getCourseEvents(syllabusId: number): Promise<CourseEvent[]> {
    return Array.from(this.courseEvents.values())
      .filter(event => event.syllabusId === syllabusId)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()); // Sort by due date
  }

  // Study plan operations
  async createStudyPlan(insertPlan: InsertStudyPlan): Promise<StudyPlan> {
    const id = this.studyPlanIdCounter++;
    const plan: StudyPlan = {
      ...insertPlan,
      id,
      createdAt: new Date(),
      description: insertPlan.description ?? null,
      calendarIntegrated: insertPlan.calendarIntegrated ?? null
    };
    this.studyPlans.set(id, plan);
    return plan;
  }

  async getStudyPlan(id: number): Promise<StudyPlan | undefined> {
    return this.studyPlans.get(id);
  }

  async getStudyPlansBySyllabus(syllabusId: number): Promise<StudyPlan[]> {
    return Array.from(this.studyPlans.values())
      .filter(plan => plan.syllabusId === syllabusId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Latest first
  }

  async getStudyPlansByUser(userId: number): Promise<StudyPlan[]> {
    return Array.from(this.studyPlans.values())
      .filter(plan => plan.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Latest first
  }

  async updateStudyPlan(id: number, updates: Partial<InsertStudyPlan>): Promise<StudyPlan | undefined> {
    const plan = this.studyPlans.get(id);
    if (!plan) return undefined;
    
    const updatedPlan = { ...plan, ...updates };
    this.studyPlans.set(id, updatedPlan);
    return updatedPlan;
  }

  // Study session operations
  async createStudySession(insertSession: InsertStudySession): Promise<StudySession> {
    const id = this.studySessionIdCounter++;
    const session: StudySession = {
      ...insertSession,
      id,
      description: insertSession.description ?? null,
      calendarEventId: insertSession.calendarEventId ?? null,
      eventType: insertSession.eventType ?? null,
      relatedEventId: insertSession.relatedEventId ?? null
    };
    this.studySessions.set(id, session);
    return session;
  }

  async getStudySessions(studyPlanId: number): Promise<StudySession[]> {
    return Array.from(this.studySessions.values())
      .filter(session => session.studyPlanId === studyPlanId)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime()); // Sort by start time
  }

  async updateStudySession(id: number, updates: Partial<InsertStudySession>): Promise<StudySession | undefined> {
    const session = this.studySessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.studySessions.set(id, updatedSession);
    return updatedSession;
  }
}

export const storage = new MemStorage();
