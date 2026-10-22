async function loadLatestVideo() {
  try {
    const response = await fetch('data/youtube.json');

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // videos are ordered newest-first
    if (!data.videos || data.videos.length === 0) {
      throw new Error('No videos found in youtube.json');
    }

    const videoId = data.videos[0].id;

    if (!videoId) {
      throw new Error('Could not extract video ID from youtube.json');
    }

    const playerElement = document.getElementById('player');
    if (playerElement) {
      playerElement.src = `https://www.youtube.com/embed/${videoId}`;
      console.log('Latest video loaded successfully from youtube.json:', videoId);
    } else {
      console.error('Player element not found in the DOM');
    }

  } catch (error) {
    console.error('Failed to load latest video from youtube.json:', error.message);

    // Fallback embed
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

// Run when the page loads
window.onload = loadLatestVideo;