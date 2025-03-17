import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "../shared/schema";
import { log } from "./vite";

// For migrations and queries
const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });

// For migrations
export async function runMigrations() {
  try {
    log("Running migrations...", "database");
    await migrate(drizzle(migrationClient), { migrationsFolder: "migrations" });
    log("Migrations completed successfully", "database");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// For queries
const queryClient = postgres(process.env.DATABASE_URL!);
export const db = drizzle(queryClient, { schema });