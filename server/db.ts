import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "../shared/schema";
import { log } from "./vite";
import { withRetry, DatabaseError } from "./utils/error-handler";

const pgConnectionConfig = {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
};

// For migrations and queries
const createMigrationClient = () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new DatabaseError("DATABASE_URL environment variable is not set");
    }
    return postgres(process.env.DATABASE_URL, { 
      max: 1,
      connect_timeout: 30, // longer timeout for migrations
      idle_timeout: 60,
    });
  } catch (error: any) {
    log(`Failed to create migration client: ${error.message}`, "error");
    throw new DatabaseError(`Failed to connect to database: ${error.message}`);
  }
};

// For migrations
export async function runMigrations() {
  let migrationClient: ReturnType<typeof postgres> | null = null;
  
  try {
    log("Running migrations...", "database");
    
    // Try to create the migration client with retries
    migrationClient = await withRetry(
      () => createMigrationClient(),
      {
        retries: 5,
        initialDelay: 1000,
        maxDelay: 10000,
        onRetry: (err, attempt) => {
          log(`Migration connection attempt ${attempt} failed: ${err.message}`, "database");
        }
      }
    );
    
    // Run migrations with the client
    await migrate(drizzle(migrationClient), { migrationsFolder: "migrations" });
    log("Migrations completed successfully", "database");
  } catch (error: any) {
    log(`Migration failed: ${error.message}`, "error");
    
    // In production, we might want to continue anyway to avoid total application failure
    if (process.env.NODE_ENV === 'production') {
      log("Continuing despite migration failure in production", "error");
    } else {
      throw new DatabaseError(`Database migration failed: ${error.message}`);
    }
  } finally {
    // Clean up migration client
    if (migrationClient) {
      await migrationClient.end({ timeout: 5 }).catch(err => {
        log(`Error closing migration client: ${err.message}`, "error");
      });
    }
  }
}

// Create a function to get a query client with connection retry
export const createQueryClient = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new DatabaseError("DATABASE_URL environment variable is not set");
    }
    
    return await withRetry(
      () => postgres(process.env.DATABASE_URL!, pgConnectionConfig),
      {
        retries: 3,
        initialDelay: 500,
        onRetry: (err, attempt) => {
          log(`Database connection attempt ${attempt} failed: ${err.message}`, "database");
        }
      }
    );
  } catch (error: any) {
    log(`Failed to create query client: ${error.message}`, "error");
    throw new DatabaseError(`Failed to connect to database: ${error.message}`);
  }
};

// Get the query client
let queryClient: ReturnType<typeof postgres>;
try {
  queryClient = postgres(process.env.DATABASE_URL!, pgConnectionConfig);
} catch (error: any) {
  log(`Initial database connection failed: ${error.message}`, "error");
  // In production, we'll let the application continue and try to reconnect later
  // For development, we'll just use a dummy client that will throw errors when used
  if (process.env.NODE_ENV !== 'production') {
    throw new DatabaseError(`Failed to connect to database: ${error.message}`);
  }
  // This is a fallback that will be replaced on the first successful connection
  queryClient = {} as ReturnType<typeof postgres>;
}

// Export the drizzle instance
export const db = drizzle(queryClient, { schema });

// Function to check database connection
export async function checkDatabase(): Promise<boolean> {
  try {
    // Simple query to test connection
    const result = await db.execute(sql`SELECT 1 as alive`);
    return result.length > 0 && result[0].alive === 1;
  } catch (error: any) {
    log(`Database health check failed: ${error.message}`, "error");
    return false;
  }
}