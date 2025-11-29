#!/usr/bin/env node
/**
 * Helper script to read PORT from env file and execute Docker commands.
 * Usage: node scripts/docker-helper.js <command> <env-file>
 */

import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {execSync} from "node:child_process";

const [command, envFile] = process.argv.slice(2);

if (!command || !envFile) {
  console.error("Usage: node scripts/docker-helper.js <command> <env-file>");
  console.error("Commands: build, run");
  process.exit(1);
}

// Read PORT from env file (fail-fast if not found or empty)
const envPath = resolve(process.cwd(), envFile);
const port = readFileSync(envPath, "utf-8")
  .split("\n")
  .find((line) => line.startsWith("PORT="))
  ?.split("=")[1]
  ?.trim();

if (!port || port === "") {
  console.error(`PORT not found or empty in ${envFile}`);
  process.exit(1);
}

// Execute command
try {
  if (command === "build") {
    // Build from monorepo root
    const dockerfile = resolve(process.cwd(), "Dockerfile");
    const rootDir = resolve(process.cwd(), "../..");
    execSync(
      `docker build --build-arg PORT=${port} -f ${dockerfile} -t telegram-bot:prod ${rootDir}`,
      {stdio: "inherit", cwd: rootDir}
    );
  } else if (command === "run") {
    // Run container with port mapping from env file
    execSync(
      `docker run -d --name telegram-bot-prod --restart unless-stopped -p ${port}:${port} --env-file ${envPath} telegram-bot:prod`,
      {stdio: "inherit"}
    );
  } else {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
  }
} catch (error) {
  console.error(`Docker command failed:`, error.message);
  process.exit(1);
}
