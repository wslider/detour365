import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

const API_KEY = process.env.D365_YOUTUBE_API_KEY;
const CHANNEL_ID = "UCgfVr2t5RBmkkuaWeKbWEvQ";
const UPLOADS_PLAYLIST_ID = "UU" + CHANNEL_ID.slice(2);
const OUT_FILE = "data/youtube.json";

if (!API_KEY) {
  console.error("Missing YOUTUBE_API_KEY");
  process.exit(1);
}

function toVideo(item) {
  const id = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
  const title = item.snippet?.title || "";
  if (!id || title === "Deleted video" || title === "Private video") return null;

  return {
    id,
    title,
    publishedAt: item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt || "",
    description: item.snippet?.description || "",
    thumbnail: item.snippet?.thumbnails?.high?.url
      || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  };
}

async function fetchPage(pageToken = "") {
  const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("playlistId", UPLOADS_PLAYLIST_ID);
  url.searchParams.set("maxResults", "50");
  url.searchParams.set("key", API_KEY);
  if (pageToken) url.searchParams.set("pageToken", pageToken);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube API ${res.status}: ${await res.text()}`);
  return res.json();
}

async function loadExisting() {
  if (!existsSync(OUT_FILE)) return [];
  const raw = JSON.parse(await readFile(OUT_FILE, "utf8"));
  return Array.isArray(raw.videos) ? raw.videos : [];
}

async function fetchNewVideos(existingIds) {
  const collected = [];
  let pageToken = "";

  do {
    const data = await fetchPage(pageToken);
    const pageVideos = (data.items || []).map(toVideo).filter(Boolean);

    for (const video of pageVideos) {
      if (existingIds.has(video.id)) return collected;
      collected.push(video);
    }

    pageToken = data.nextPageToken || "";
  } while (pageToken);

  return collected;
}

async function main() {
  const existing = await loadExisting();
  const existingIds = new Set(existing.map((v) => v.id));
  const fresh = await fetchNewVideos(existingIds);
  const videos = existingIds.size === 0 ? fresh : [...fresh, ...existing];

  await mkdir("data", { recursive: true });
  await writeFile(
    OUT_FILE,
    JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        channelId: CHANNEL_ID,
        count: videos.length,
        videos,
      },
      null,
      2
    ) + "\n"
  );

  console.log(`Added ${fresh.length} video(s). Total: ${videos.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

