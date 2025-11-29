/**
 * Copy database file from scraper to telegram-bot/db/
 * Run this before building the bot package.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE_NAME = "ALL.json";
const sourcePath = path.join(__dirname, `../../scrapper/results/4_final/${DB_FILE_NAME}`);
const targetPath = path.join(__dirname, `../db/${DB_FILE_NAME}`);

export const run = (): void => {
  console.log(`Copying database from ${sourcePath} to ${targetPath}`);

  // Check if source file exists
  if (!fs.existsSync(sourcePath)) {
    throw new Error(
      `Source database file does not exist: ${sourcePath}\n` +
        `Please run the scraper first to generate the database.`
    );
  }

  // Ensure target directory exists
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`Created directory: ${targetDir}`);
  }

  try {
    // Copy file directly (file is already formatted by prettier in final.ts)
    fs.copyFileSync(sourcePath, targetPath);

    // Verify the file was written
    if (fs.existsSync(targetPath)) {
      const stats = fs.statSync(targetPath);
      console.log(
        `Successfully copied database (${stats.size} bytes)`
      );
    } else {
      throw new Error(`File was not written to ${targetPath}`);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error(`Error copying database: ${errorMessage}`);
    throw error;
  }
};

// Run if executed directly
try {
  run();
  console.log("Database copy completed successfully");
  process.exit(0);
} catch (error) {
  console.error("Error copying database:", error);
  process.exit(1);
}

