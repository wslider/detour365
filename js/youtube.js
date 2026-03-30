const channelId = 'UCgfVr2t5RBmkkuaWeKbWEvQ';

async function loadLatestVideo() {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // Check if we actually got videos
    if (!data.items || data.items.length === 0) {
      throw new Error('No videos found in the channel feed');
    }

    const videoUrl = data.items[0].link;
    // Better extraction of video ID (more robust)
    const videoId = videoUrl.split('v=')[1]?.split('&')[0];

    if (!videoId) {
      throw new Error('Could not extract video ID from the feed');
    }

    // Load the video into a simple iframe
    const playerElement = document.getElementById('player');
    if (playerElement) {
      playerElement.src = `https://www.youtube.com/embed/${videoId}`;
      console.log('Latest video loaded successfully:', videoId);
    } else {
      console.error('Player element not found in the DOM');
    }

  } catch (error) {
    console.error('Failed to load latest video:', error.message);
    
    // Display Fallback Video 
    const playerContainer = document.getElementById('player-container') || document.getElementById('player');
    if (playerContainer) {
      playerContainer.innerHTML = `
        <iframe class="iframe" id="player"
                src="https://www.youtube.com/embed/bjblCJsMDXo?si=ME7e-hU6Y3tfewBJ" 
                title="YouTube video player" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen>
        </iframe>`;
    }
  }
}

// Run the function when the page loads
window.onload = loadLatestVideo;