import fs from "fs";
import path from "path";
import { log } from "../helper";

const sourceFolder = path.join(__dirname, `../../results/4_final`);
const targetFolder = path.join(__dirname, `../../../addon/src/db/`);

export const run = async () => {
  const files = fs.readdirSync(sourceFolder);

  for (const file of files) {
    const sourcePath = path.join(sourceFolder, file);

    if (!fs.statSync(sourcePath).isFile()) {
      throw new Error(`sourcePath ${sourcePath} is not a file`);
    }

    const targetPath = path.join(targetFolder, file);
    if (!fs.statSync(targetPath).isFile()) {
      throw new Error(`targetPath ${targetPath} is not a file`);
    }
    fs.copyFileSync(sourcePath, targetPath);
    log(`Copied: ${sourcePath} -> ${targetPath}`);
  }
};
