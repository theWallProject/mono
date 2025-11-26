const fs = require("fs");
const path = require("path");
const prettier = require("prettier");

const sourceFile = path.join(__dirname, "../results/4_final/ALL.json");
const targetDir = path.join(__dirname, "../../addon/src/db");
const targetFile = path.join(targetDir, "ALL.json");

// Check if source file exists
if (!fs.existsSync(sourceFile)) {
  console.warn(
    `Warning: Source file ${sourceFile} does not exist. Skipping copy.`,
  );
  process.exit(0);
}

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`Created directory: ${targetDir}`);
}

// Read, format, and write the file
(async () => {
  try {
    // Read the source file
    const jsonContent = fs.readFileSync(sourceFile, "utf-8");

    // Parse JSON to validate it's valid
    const jsonData = JSON.parse(jsonContent);

    // Format with prettier (async in newer versions)
    const formatted = await prettier.format(JSON.stringify(jsonData), {
      parser: "json",
      printWidth: 80,
      tabWidth: 2,
    });

    // Write the formatted content to target file
    fs.writeFileSync(targetFile, formatted, "utf-8");
    console.log(`Copied and formatted: ${sourceFile} -> ${targetFile}`);
  } catch (error) {
    console.error(`Error copying/formatting file: ${error.message}`);
    process.exit(1);
  }
})();
