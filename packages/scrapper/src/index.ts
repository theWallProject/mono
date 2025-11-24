import { error, log } from "./helper";
import { run as scrap } from "./tasks/scrap";
import { run as mergeCB } from "./tasks/merge_cb";
import { run as mergeStatic } from "./tasks/merge_static";
import { run as genStatic } from "./tasks/gen_static";
import { run as genStaticBIT } from "./tasks/gen_buyIsraeliTech";
import { run as validate } from "./tasks/validate";
import { run as extractSocial } from "./tasks/extract_social";
import { run as extractWebsites } from "./tasks/extract_websites";
import { run as final } from "./tasks/final";
import { run as alternativesReport } from "./tasks/alternatives_report";
import { run as copyToAddon } from "./tasks/copy_to_addon";
import inquirer from "inquirer";

// Only register error handlers when this file is executed directly (not imported)
if (require.main === module) {
  process.on("unhandledRejection", (reason) => {
    // Ignore ExitPromptError from inquirer when process exits
    if (
      reason &&
      typeof reason === "object" &&
      (("name" in reason && reason.name === "ExitPromptError") ||
        ("constructor" in reason &&
          reason.constructor &&
          typeof reason.constructor === "function" &&
          "name" in reason.constructor &&
          reason.constructor.name === "ExitPromptError"))
    ) {
      return;
    }
    error("INDEX_ERROR Unhandled Rejection:", reason);
    throw new Error("INDEX_ERROR Unhandled Rejection");
  });

  process.on("uncaughtException", (err) => {
    error("INDEX_ERROR Uncaught Exception:", err);
    throw new Error("INDEX_ERROR Uncaught Exception");
  });
}

export const runUpdateSteps = async (options?: {
  shouldScrap?: boolean;
  shouldValidate?: boolean;
  shouldCopyToAddon?: boolean;
}) => {
  const opts = options || {};

  if (opts.shouldScrap) {
    log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Step 1: Scraping...");
    await scrap();
  }

  log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Step 2: Merging CB Results...");
  await mergeCB();

  log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Step 3: Prepare Manual Data...");
  await genStatic();

  log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Step 4: Prepare BuyIsTech Data...");
  await genStaticBIT();

  log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Step 5: Merging All Results...");
  const sorted = await mergeStatic();

  log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Step 6: Extracting Social Links...");
  await extractSocial(sorted);

  log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Step 7: Extracting Domains...");
  await extractWebsites(sorted);

  log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Step 8: Generate final DB file...");
  await final();

  log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Step 9: Show alternatives report...");
  await alternativesReport();

  if (opts.shouldCopyToAddon) {
    log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Step 10: Copy to Addon...");
    await copyToAddon();
  }

  if (opts.shouldValidate) {
    log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Step 11: Validating URLs...");
    await validate();
  }
};

const main = async () => {
  const answers = await inquirer.prompt([
    {
      type: "confirm",
      name: "shouldScrap",
      message: "Scrap?",
    },
    {
      type: "confirm",
      name: "shouldValidate",
      message: "Validate URLs?",
    },
    {
      type: "confirm",
      name: "shouldCopyToAddon",
      message: "Copy to Addon?",
    },
  ]);

  await runUpdateSteps({
    shouldScrap: answers.shouldScrap,
    shouldValidate: answers.shouldValidate,
    shouldCopyToAddon: answers.shouldCopyToAddon,
  });
};

// Only run main() if this file is executed directly (not imported)
if (require.main === module) {
  // process.stdin.once("data", () => log("done"));
  main();
}
