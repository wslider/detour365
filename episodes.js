const RSS_URL = "https://anchor.fm/s/593de1b4/podcast/rss";
const PROXIES = [
  "https://api.allorigins.win/raw?url=",
  "https://corsproxy.io/?"
];


// grok reccomended fetch with retry *
async function fetchWithRetry(url, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok && res.status !== 408) throw new Error(res.status);
      return res;
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
    }
  }
}

async function loadEpisodes() {
  const container = document.getElementById("episodes");

  try {
    container.innerHTML = "<p>Loading episodes…</p>";

    let response;
    for (const proxy of PROXIES) {
      try {
        const url = proxy.includes("corsproxy.io") ? proxy + RSS_URL : proxy + encodeURIComponent(RSS_URL);
        response = await fetchWithRetry(url);
        break;
      } catch (_) {
        if (proxy === PROXIES[PROXIES.length - 1]) throw new Error("All proxies failed");
      }
    }

    const text = await response.text();
    const xml = new DOMParser().parseFromString(text, "application/xml");

    if (xml.querySelector("parsererror")) throw new Error("Invalid RSS");

    const items = xml.querySelectorAll("item");
                          
    // Filter: Only episodes where description contains "nathaniel" or "vlog" (any case)
    const filteredItems = Array.from(items).filter(item => {
      const desc = (item.querySelector("description")?.textContent || "").toLowerCase();
      return desc.includes("nathaniel" || "vlog");
    });

    if (filteredItems.length === 0) {
      container.innerHTML = "<p>No episodes available at the moment.</p>";
      return;
    }

    container.innerHTML = "<h2>Latest Episodes</h2>";

    filteredItems.forEach(item => {
      const title = item.querySelector("title")?.textContent?.trim() || "Untitled";
      const pubDate = item.querySelector("pubDate")?.textContent || "";
      const date = pubDate
        ? new Date(pubDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : "Date unknown";

      const rawDesc = item.querySelector("description")?.textContent || "";
      const cleanDesc = rawDesc.replace(/<[^>]*>/g, " ");

      const audioUrl = item.querySelector("enclosure")?.getAttribute("url") || "";
      const link = item.querySelector("link")?.textContent?.trim() || "#";
      const epImage = item.querySelector("image")?.getAttribute("href") || ""; 

      const div = document.createElement("div");
      div.className = "episode";
      div.innerHTML = `
        <h3>${title}</h3>
        <p><strong>${date}</strong></p>
        <img src="${epImage}" class="epImage"> 
        ${audioUrl ? `<audio controls src="${audioUrl}" class="audio"></audio>` : ""}
        <p>${cleanDesc.substring(0, 250)}${cleanDesc.length > 250 ? "…" : ""} 
           <a href="${link}" target="_blank">Read more →</a>
        </p>
        <a href="${link}" target="_blank">Listen on Anchor / Spotify</a>
      `;
      container.appendChild(div);
    });

  } catch (error) {
    container.innerHTML = `
      <p>Failed to load episodes.🛸</p>
      <p>Try refreshing in a few minutes.</p>
    `;
  }
}

document.addEventListener("DOMContentLoaded", loadEpisodes);