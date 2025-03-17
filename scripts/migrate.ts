import { runMigrations } from "../server/db";

async function main() {
  console.log("Starting database migrations...");
  await runMigrations();
  console.log("Migrations completed successfully!");
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});