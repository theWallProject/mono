/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

function extractDomain(url) {
  try {
    const { hostname } = new URL(
      url.startsWith("http") ? url : "https://" + url,
    );
    return `https://${hostname}`;
  } catch {
    return url;
  }
}

/**
 * Processes a JSON report file, removing rows where the 'result' field is equal to 200,
 * and overwrites the original file with the filtered data.
 *
 * @param {string} filePath - The path to the JSON file.
 * @returns {Promise<void>} - A promise that resolves when the processing is complete.
 */
async function filterReport(filePath) {
  try {
    // Read the JSON file
    const rawData = fs.readFileSync(filePath);
    const data = JSON.parse(rawData);

    // Lines to REMOVE
    const filteredData = data
      .filter((row) => {
        if (row.result === 200) {
          return false;
        }

        if (row.result === row.url) {
          return false;
        }

        if (extractDomain(row.result).endsWith(".il")) {
          return false;
        }

        if (typeof row.result === "string") {
          if (
            row.result.split("https://")[1] &&
            row.result.split("https://")[1] === row.url.split("https://www.")[1]
          ) {
            return false;
          }

          if (
            row.result.split("https://www.")[1] &&
            row.result.split("https://www.")[1] === row.url.split("https://")[1]
          ) {
            return false;
          }
        }

        return true;

        // return  &&
        //   row.result !== row.url &&
        //   typeof row.result === "string"
        //   ? !row.result.startsWith("/")
        //   : true;
      })
      .map((row) => {
        const { url, result } = row;
        return {
          ...row,
          url: extractDomain(url),
          result: extractDomain(result),
        };
      });

    // Sort the filtered data
    const sortedData = filteredData.sort((a, b) => {
      // First sort by result
      if (typeof a.result === "number" && typeof b.result === "number") {
        if (a.result !== b.result) return a.result - b.result;
      } else {
        const resultComp = String(a.result).localeCompare(String(b.result));
        if (resultComp !== 0) return resultComp;
      }

      // Then sort by error if it exists
      if (a.error && b.error) return a.error.localeCompare(b.error);
      if (a.error) return -1;
      if (b.error) return 1;
      return 0;
    });

    // Write the sorted and filtered data back to the original file
    fs.writeFileSync(filePath, JSON.stringify(sortedData, null, 2)); // Use null, 2 for pretty printing

    console.log("The JSON file was filtered and overwritten successfully");
  } catch (err) {
    console.error(err);
  }
}

const filePath = path.join(
  __dirname,
  "../results/2_merged/report_websites.json",
); // Adjust the path as per your repo structure

filterReport(filePath).catch((err) => console.error(err));
