#!/usr/bin/env node

/**
 * Script to pre-fetch Open Graph data for blog posts
 * Run this locally when GitHub Actions IPs are blocked
 *
 * Usage: node scripts/fetch-blog-data.js
 */

import ogs from "open-graph-scraper";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const urls = [
  "https://github.com/SigmaHQ/sigmahq.github.io/",
  "https://www.nextron-systems.com/2023/03/13/private-sigma-rule-feed-in-valhalla-and-partnership-with-soc-prime/",
  "https://www.nextron-systems.com/2023/03/24/demystifying-sigma-log-sources/",
  "https://micahbabinski.medium.com/creating-a-sigma-backend-for-fun-and-no-profit-ed16d20da142",
];

async function fetch_og_data(url) {
  console.log(`Fetching OG data for: ${url}`);
  let result;
  try {
    result = (await ogs({ url })).result;
    console.log(`✓ Successfully fetched data for: ${url}`);
  } catch (e) {
    console.error(`✗ OGS error for url: ${url}`, e.message);
    return {
      error: e.message,
      url: url,
      timestamp: new Date().toISOString(),
    };
  }

  // Fix relative image URLs
  if (
    result.ogImage &&
    result.ogImage[0] &&
    result.ogImage[0].url.startsWith("/")
  ) {
    let hostname = new URL(result.requestUrl).hostname;
    let path = result.ogImage[0].url;
    result.ogImage[0].url = new URL("https://" + hostname + path)?.href;
  }

  return result;
}

async function main() {
  console.log("Starting Open Graph data fetch...");
  console.log(`Fetching data for ${urls.length} URLs`);

  try {
    const posts = await Promise.all(
      urls.slice(0, 4).map((url) => fetch_og_data(url)),
    );

    const blogData = {
      posts: posts,
      lastUpdated: new Date().toISOString(),
      generatedBy: "scripts/fetch-blog-data.js",
    };

    // Save to static data file
    const outputPath = path.join(
      __dirname,
      "../.vitepress/theme/lib/blog-static.json",
    );
    await fs.writeFile(outputPath, JSON.stringify(blogData, null, 2));

    console.log(`\n✓ Blog data saved to: ${outputPath}`);
    console.log(`✓ Successfully processed ${posts.length} URLs`);

    // Show summary
    const successCount = posts.filter((post) => !post.error).length;
    const errorCount = posts.filter((post) => post.error).length;

    console.log(`\nSummary:`);
    console.log(`  Successful: ${successCount}`);
    console.log(`  Failed: ${errorCount}`);

    if (errorCount > 0) {
      console.log(`\nFailed URLs:`);
      posts
        .filter((post) => post.error)
        .forEach((post) => {
          console.log(`  - ${post.url}: ${post.error}`);
        });
    }
  } catch (error) {
    console.error("Script failed:", error);
    process.exit(1);
  }
}

main();
