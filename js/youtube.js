async function loadLatestVideo() {
  try {
    const response = await fetch('data/d365_yt_embeds.json');

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // videos are ordered newest-first
    if (!data || data.length === 0) {
      throw new Error('No videos found in youtube.json');
    }

    const embed_src = data[0].embed_src;

    if (!embed_src) {
      throw new Error('Could not extract embed_src from d365_yt_embeds.json');
    }

    const playerElement = document.getElementById('player');
    if (playerElement) {
      playerElement.src = embed_src;
      console.log('Latest video loaded successfully from d365_yt_embeds.json:', embed_src);
    } else {
      console.error('Player element not found in the DOM');
    }

  } catch (error) {
    console.error('Failed to load latest video from d365_yt_embeds.json: ', error.message);

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