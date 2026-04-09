// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchOutput = document.getElementById('searchOutput');

const ytChannelId = 'UCgfVr2t5RBmkkuaWeKbWEvQ';

async function searchYouTube(query) {
    if (!query) {
        searchOutput.innerHTML = '<p>Please enter a search term.</p>';
        return;
    }

    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${ytChannelId}`;
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    searchOutput.innerHTML = '<p>Searching...</p>'; // feedback

    try {
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            throw new Error('No videos found in the channel feed');
        }

        // Search in both title and description (case-insensitive)
        const results = data.items.filter(item => {
            const searchLower = query.toLowerCase();
            return (
                (item.title && item.title.toLowerCase().includes(searchLower)) ||
                (item.description && item.description.toLowerCase().includes(searchLower))
            );
        });

        // Clear previous results
        searchOutput.innerHTML = '';

        if (results.length === 0) {
            searchOutput.innerHTML = `<p>No videos found for "${query}".</p>`;
            return;
        }

        results.forEach(item => {
            const videoUrl = item.link; // rss2json gives full watch URL
            const videoId = videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('/').pop();

            if (!videoId) return;

            // Create a container div for better styling
            const videoDiv = document.createElement('div');
            videoDiv.className = 'video-result';
            videoDiv.style.marginBottom = '20px';

            const iframe = document.createElement('iframe');
            iframe.width = "560";
            iframe.height = "315";
            iframe.src = `https://www.youtube.com/embed/${videoId}`;
            iframe.title = item.title || "YouTube video";
            iframe.frameBorder = "0";
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
            iframe.allowFullscreen = true;

            const titleEl = document.createElement('h3');
            titleEl.textContent = item.title || 'Untitled';

            videoDiv.appendChild(titleEl);
            videoDiv.appendChild(iframe);
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

