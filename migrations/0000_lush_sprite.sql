CREATE TABLE "course_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"syllabus_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"event_type" text NOT NULL,
	"due_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"provider" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"expires_at" timestamp,
	"scope" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"syllabus_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"calendar_integrated" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "study_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"study_plan_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"calendar_event_id" text,
	"location" text,
	"event_type" text,
	"related_event_id" integer
);
--> statement-breakpoint
CREATE TABLE "syllabi" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"filename" text NOT NULL,
	"course_code" text,
	"course_name" text,
	"instructor" text,
	"term" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"text_content" text,
	"status" text DEFAULT 'uploaded' NOT NULL,
	"first_day_of_class" timestamp,
	"last_day_of_class" timestamp,
	"meeting_days" text[],
	"meeting_time_start" text,
	"meeting_time_end" text,
	"calendar_provider" text,
	"calendar_integrated" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text,
	"display_name" text,
	"initials" text,
	"email" text,
	"google_id" text,
	"profile_image_url" text,
	"auth_provider" text,
	"role" text DEFAULT 'user',
	"created_at" timestamp DEFAULT now(),
	"subscription_status" text DEFAULT 'free',
	"subscription_expiry" timestamp,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
