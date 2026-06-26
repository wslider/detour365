// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchOutput = document.getElementById('searchOutput');

const ytChannelId = 'UCgfVr2t5RBmkkuaWeKbWEvQ';

async function searchYouTube(query) {
    if (!query || query.trim() === '') {
        searchOutput.innerHTML = '<p>Please enter a search term.</p>';
        return;
    }

    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${ytChannelId}`;
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    searchOutput.innerHTML = `<p>Searching for "${query}"...</p>`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            throw new Error('No videos found');
        }

        // === TEMPORARY DEBUG - REMOVE LATER ===
        console.log("=== First item structure ===");
        console.log("media object:", JSON.stringify(data.items[0]?.media, null, 2));
        console.log("Has media.description?", !!data.items[0]?.media?.description);

        // Improved search
        const searchLower = query.toLowerCase().trim();

        const results = data.items.filter(item => {
            const title = (item.title || '').toLowerCase();

            let desc = '';
            if (item.media?.description) {
                desc = String(item.media.description).toLowerCase();
            } else if (item['media:description']) {
                desc = String(item['media:description']).toLowerCase();
            } else if (item.description) {
                desc = String(item.description).toLowerCase();
            }

            return title.includes(searchLower) || desc.includes(searchLower);
        });

        searchOutput.innerHTML = '';

        if (results.length === 0) {
            searchOutput.innerHTML = `<p>No matches found for "${query}".<br>Try: genesis, joseph, resurrection, palm, timestamps</p>`;
            return;
        }

        results.forEach(item => {
            let videoId = '';
            if (item.link) {
                videoId = item.link.split('v=')[1]?.split('&')[0] || item.link.split('/').pop();
            } else if (item.yt?.videoId || item['yt:videoId']) {
                videoId = item.yt?.videoId || item['yt:videoId'];
            }

            if (!videoId) return;

            const videoDiv = document.createElement('div');
            videoDiv.className = 'video-result';
            videoDiv.style.marginBottom = '30px';

            const titleEl = document.createElement('h3');
            titleEl.textContent = item.title || 'Untitled';

            const iframe = document.createElement('iframe');
            iframe.width = "100%";
            iframe.height = "315";
            iframe.src = `https://www.youtube.com/embed/${videoId}`;
            iframe.allowFullscreen = true;
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

            videoDiv.append(titleEl, iframe);
            searchOutput.appendChild(videoDiv);
        });

    } catch (error) {
        console.error('Search error:', error);
        searchOutput.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

function searchAndDisplay() {
    const searchTerm = searchInput.value.trim();
    searchYouTube(searchTerm);
}

// Event listener
searchButton.addEventListener("click", (event) => {
    event.preventDefault(); // not strictly needed for button but harmless
    searchAndDisplay();
});

// Optional: allow pressing Enter in the input
searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        searchAndDisplay();
    }
});


// fetch using clean input as search term 

// async fetch all matches from youtube rss

    // display embedded - for each: create a div element with iframe 

// async fetch  all matches from spotifty rss

    // display embedded - for each: create a div element

// async fetch from X (future)

    // display - for each create a div element

// call 

