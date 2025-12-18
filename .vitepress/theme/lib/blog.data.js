import ogs from "open-graph-scraper";
import fs from "fs";
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
  let result;
  try {
    result = (await ogs({ url })).result;
  } catch (e) {
    console.error("OGS error for url:", url, e);
    return {}
  }

  if (result.ogImage && result.ogImage[0] && result.ogImage[0].url.startsWith("/")) {
    let hostname = new URL(result.requestUrl).hostname;
    let path = result.ogImage[0].url;
    result.ogImage[0].url = new URL("https://" + hostname + path)?.href;
  }

  return result;
}

function loadStaticBlogData() {
  try {
    const staticDataPath = path.join(__dirname, "blog-static.json");
    const staticData = JSON.parse(fs.readFileSync(staticDataPath, "utf8"));
    console.log("Using static blog data from:", staticDataPath);
    return staticData.posts;
  } catch (error) {
    console.warn("Static blog data not found or invalid, falling back to dynamic fetch");
    return null;
  }
}

export default {
  async load() {
    // Try to use static data first (fallback for when GitHub Actions IP is blocked)
    const staticPosts = loadStaticBlogData();
    if (staticPosts && staticPosts.length > 0) {
      return { posts: staticPosts };
    }

    // Fallback to dynamic fetching
    try {
      return {
        posts: await Promise.all(
          urls.slice(0, 4).map(url => fetch_og_data(url)),
        ),
      };
    } catch (error) {
      console.error("Failed to fetch blog data dynamically:", error);
      // Return empty posts array as final fallback
      return { posts: [] };
    }
  },
};
