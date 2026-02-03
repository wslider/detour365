async function fetchLatestEpisode() {
    const url = "https://anchor.fm/s/593de1b4/podcast/rss";
    try {
        const response = await fetch(url);
        const data = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "application/xml");
        const items = xmlDoc.getElementsByTagName("item");
        if (items.length > 0) {
            const latestItem = items[0];
            const title = latestItem.getElementsByTagName("title")[0].textContent;
            const pubDate = latestItem.getElementsByTagName("pubDate")[0].textContent;
            const link = latestItem.getElementsByTagName("link")[0].textContent;
            const episodeImage = latestItem.getElementsByTagName("itunes:image")[0].getAttribute("href");
            return { title, pubDate, link, episodeImage };
        }
    } catch (error) {
        console.error("Error fetching or parsing RSS feed:", error);
    }
    return null;
}

export async function displayLatestEpisode() {
    const latestEpisodeContainer = document.getElementById("latestEpisodes");
    const backupImageSrc = "/images/detour365-logo-square.jpeg";
    if (!latestEpisodeContainer) return;
    const latestEpisodeData = await fetchLatestEpisode();
    if (latestEpisodeData) {
        latestEpisodeContainer.innerHTML = `
            <h2>Latest Episode</h2>
            <h3><a href="${latestEpisodeData.link}" target="_blank" rel="noopener" style="color: white; cursor:pointer;">${latestEpisodeData.title}</a></h3>
            <p>Published on: ${new Date(latestEpisodeData.pubDate).toLocaleDateString()}</p>
            <img class="episodeImage" src="${latestEpisodeData.episodeImage || backupImageSrc}" alt="Episode Image" style="width: clamp(90%, 300px, 500px);" 

/>`      
        latestEpisodeContainer.style.display = "flex";
        latestEpisodeContainer.style.flexDirection = "column";
        latestEpisodeContainer.style.alignItems = "center";
        latestEpisodeContainer.style.textAlign = "center";
        latestEpisodeContainer.style.justifyContent = "center";
        latestEpisodeContainer.style.gap = "1vh";
        ;
    }
    else {
        latestEpisodeContainer.innerHTML = "<p>Unable to load the latest episode at this time.</p>";
    }
}