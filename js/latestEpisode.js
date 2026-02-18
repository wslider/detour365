async function fetchLatestEpisode() {

  const rssUrl = "https://anchor.fm/s/593de1b4/podcast/rss";
  
  
  const proxyUrl = 'https://detour365-rss-proxy.wslider2000.workers.dev/' + '?url=' + encodeURIComponent(rssUrl);

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Proxy/RSS fetch failed: HTTP ${response.status}`);
    }
    
    const data = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "application/xml");
    
    // Check for parse errors
    if (xmlDoc.querySelector("parsererror")) {
      throw new Error("RSS XML parse error");
    }

    const items = xmlDoc.getElementsByTagName("item");
    if (items.length === 0) {
      throw new Error("No episodes found in RSS");
    }

    const latestItem = items[0];
    
    // Safe extraction with fallbacks
    const titleEl = latestItem.getElementsByTagName("title")[0];
    const pubDateEl = latestItem.getElementsByTagName("pubDate")[0];
    const linkEl = latestItem.getElementsByTagName("link")[0];
    const imageEl = latestItem.getElementsByTagName("itunes:image")[0];
    const enclosureEl = latestItem.getElementsByTagName("enclosure")[0];

    return {
      title: titleEl ? titleEl.textContent.trim() : "Untitled Episode",
      pubDate: pubDateEl ? pubDateEl.textContent : "",
      link: linkEl ? linkEl.textContent : "#",
      episodeImage: imageEl ? imageEl.getAttribute("href") : "",
      audioUrl: enclosureEl ? enclosureEl.getAttribute("url") : "",
    };
  } catch (error) {
    console.error("Error fetching/parsing Detour 365 RSS:", error);
    return null;
  }
}

export async function displayLatestEpisode() {
  const container = document.getElementById("latestEpisodes");
  if (!container) {
    console.warn("#latestEpisodes container not found");
    return;
  }

  const backupImage = "/images/detour365-logo-square.jpeg"; // your fallback

  container.innerHTML = '<p class="loading">Loading latest episode...</p>';

  const data = await fetchLatestEpisode();

  if (data && data.audioUrl) {
    const formattedDate = data.pubDate 
      ? new Date(data.pubDate).toLocaleDateString("en-US", { 
          year: "numeric", month: "long", day: "numeric" 
        }) 
      : "Date unavailable";

    container.innerHTML = `
      <h2>Latest Episode</h2>
      <h3>
        <a href="${data.link}" target="_blank" rel="noopener noreferrer" 
           style="color: white; text-decoration: underline; cursor: pointer;">
          ${data.title}
        </a>
      </h3>
      
      <img class="episodeImage" 
           src="${data.episodeImage || backupImage}" 
           alt="Cover for ${data.title}" 
           loading="lazy"
           style="width: clamp(225px, 50%, 500px); max-height: 500px; object-fit: cover; border-radius: 8px;"
           onerror="this.src='${backupImage}'; this.alt='Fallback podcast logo';"
      />
      <audio controls id="audioPlayer" style="width: 100%; max-width: 500px;">
        <source src="${data.audioUrl}" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>

      <p>Published: ${formattedDate}</p>

    `;

    // Apply flex styles (you can move to CSS file if preferred)
    Object.assign(container.style, {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      justifyContent: "center",
      gap: "1rem",
      padding: "1rem",
    });
  } else {
    container.innerHTML = `
      <p style="color: #ffcccc;">Unable to load the latest episode right now.<br>
      Please check back later or visit the podcast directly on Spotify/Anchor.</p>
      <a href="https://podcasters.spotify.com/pod/show/detour365" target="_blank" rel="noopener">
        Listen on Spotify →
      </a>
    `;
  }
}