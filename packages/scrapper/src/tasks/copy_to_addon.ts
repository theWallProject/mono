import fs from "fs";
import path from "path";
import { format } from "prettier";
import { log } from "../helper";
import { DBFileNames } from "@theWallProject/common";

const sourceFolder = path.join(__dirname, `../../results/4_final`);
const targetFolder = path.join(__dirname, `../../../addon/src/db/`);

export const run = async () => {
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

    // Special handling for ALL.json - format with prettier
    if (file === `${DBFileNames.ALL}.json`) {
      // Check if source file exists
      if (!fs.existsSync(sourcePath)) {
        log(
          `Warning: Source file ${sourcePath} does not exist. Skipping copy.`
        );
        continue;
      }

      try {
        log(`Reading source file: ${sourcePath}`);
        // Read the source file
        const jsonContent = fs.readFileSync(sourcePath, "utf-8");

        log(`Parsing JSON (${jsonContent.length} characters)`);
        // Parse JSON to validate it's valid
        const jsonData = JSON.parse(jsonContent);

        log(`Formatting with prettier...`);
        // Format with prettier
        const formatted = await format(JSON.stringify(jsonData), {
          parser: "json",
          printWidth: 80,
          tabWidth: 2,
        });

        log(`Writing to target file: ${targetPath}`);
        // Write the formatted content to target file (will overwrite if exists)
        // Use 'w' flag to ensure file is overwritten
        fs.writeFileSync(targetPath, formatted, { encoding: "utf-8", flag: "w" });
        
        // Verify the file was written
        if (fs.existsSync(targetPath)) {
          const stats = fs.statSync(targetPath);
          log(`Successfully copied and formatted: ${sourcePath} -> ${targetPath} (${stats.size} bytes)`);
        } else {
          throw new Error(`File was not written to ${targetPath}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        log(`Error copying/formatting ${file}: ${errorMessage}`);
        throw error;
      }
    } else {
      // For other files, just copy directly (will overwrite if exists)
      fs.copyFileSync(sourcePath, targetPath);
      log(`Copied: ${sourcePath} -> ${targetPath}`);
    }
  }
  
  log(`Finished copying files`);
};

// If this file is run directly, execute the run function
if (require.main === module) {
  run()
    .then(() => {
      log("Copy to addon completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      log(`Error in copy to addon: ${error}`);
      console.error("Error in copy to addon:", error);
      process.exit(1);
    });
}
