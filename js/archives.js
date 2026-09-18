const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchOutput = document.getElementById('searchOutput');

const ytChannelId = 'UCgfVr2t5RBmkkuaWeKbWEvQ';

async function searchYouTube(query) {
    if (!query || query.trim() === '') {
        searchOutput.innerHTML = '<p>Please enter a search term.</p>';
        return;
    }

    searchOutput.innerHTML = `<p>Searching for "${query}"...</p>`;

    try {
        const response = await fetch('data/youtube.json');
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const data = await response.json();
        const items = data.videos || [];

        if (items.length === 0) {
            throw new Error('No videos found');
        }

        const searchLower = query.toLowerCase().trim();

        const results = items.filter(item => {
            const title = (item.title || '').toLowerCase();
            const desc = (item.description || '').toLowerCase();
            return title.includes(searchLower) || desc.includes(searchLower);
        });

        searchOutput.innerHTML = '';

        if (results.length === 0) {
            searchOutput.innerHTML = `<p>No matches found for "${query}".<br>Try: genesis, joseph, resurrection, palm, timestamps</p>`;
            return;
        }

        results.forEach(item => {
            const videoId = item.id;
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

searchButton.addEventListener("click", (event) => {
    event.preventDefault();
    searchAndDisplay();
});

searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        searchAndDisplay();
    }
});
