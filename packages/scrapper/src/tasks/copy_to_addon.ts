import fs from "fs";
import path from "path";
import { log } from "../helper";
import { DBFileNames } from "../scrapperTypes";

const sourceFolder = path.join(__dirname, `../../results/4_final`);
const targetFolder = path.join(__dirname, `../../../addon/src/db/`);

export const run = () => {
  log(`Copying files from ${sourceFolder} to ${targetFolder}`);

  // Check if source folder exists
  if (!fs.existsSync(sourceFolder)) {
    throw new Error(`Source folder does not exist: ${sourceFolder}`);
  }

  // Ensure target directory exists
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
    log(`Created directory: ${targetFolder}`);
  }

  const files = fs.readdirSync(sourceFolder);
  log(`Found ${files.length} files to copy`);

  for (const file of files) {
    const sourcePath = path.join(sourceFolder, file);

    if (!fs.statSync(sourcePath).isFile()) {
      log(`Skipping non-file: ${sourcePath}`);
      continue;
    }

    const targetPath = path.join(targetFolder, file);

    // Copy file directly (file is already formatted by prettier in final.ts)
    fs.copyFileSync(sourcePath, targetPath);
    log(`Copied: ${sourcePath} -> ${targetPath}`);
  }

  log(`Finished copying files`);
};

// If this file is run directly, execute the run function
if (require.main === module) {
  try {
    run();
    log("Copy to addon completed successfully");
    process.exit(0);
  } catch (error) {
    log(`Error in copy to addon: ${error}`);
    console.error("Error in copy to addon:", error);
    process.exit(1);
  }
}
