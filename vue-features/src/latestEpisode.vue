<script>

// importing necessary Vue functions
import { ref, onMounted, computed } from 'vue'; 

// reactive state variables
const episode = ref(null);
const loading = ref(true);
const error = ref(null);

//computed property & helper function to format description 
const shortDescription = computed(() => {
    if (!episode.value || !episode.value.description) {
        return '';
    }
    const plainText = episode.value.description.replace(/<[^>]+>/g, '').trim();

    return plainText.length > 180 ? plainText.slice(0, 177) + '...' : plainText;
});

//helper function to format date
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    catch {
        return dateStr;
    }
}

//lifecycle hook - runs on component mount
//fetch latest episode data on component mount
onMounted(async () => {
    try {
        const rssUrl = 'https://anchor.fm/s/593de1b4/podcast/rss';
        const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`; 
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        };
        const data = await response.json();
        if (data.status === 'ok' && data.items?.length > 0) {
            episode.value = data.items[0]  // latest episode
            console.log('Fetched episode:', episode.value)
        }
        else {
            throw new Error('No episodes found in feed.');
        }

    }
    catch (err) {
    error.value = err.message || 'Something went wrong loading the episode'
    console.error('Fetch error:', err);
    }
    finally {
        loading.value = false;
    }
});
</script>

<template>
    <div v-if="loading" class="loading">
        Loading latest Detour 365 episode...
    </div>
    <div v-else-if="error" class="error">
        Error loading episode: {{ error }}
    </div>
    <div v-else-if="episode" class="episodeCard container">
        <h2>Latest Episode: {{ episode.title }}</h2>
        <p class="date">{{ formatDate(episode.pubDate) }}</p>
        <p>{{ episode.description }}</p>


        <!-- Episode image if available, fallback to logo otherwise -->
    <img
      v-if="episode.image && (episode.image.url || episode.image)"
      :src="episode.image.url || episode.image"
      :alt="`Cover art for ${episode.title}`"
      class="episodeImage image"
      loading="lazy"
    />

    <img
      v-else
      src="/images/detour365-logo-square.jpg"  
      alt="Detour 365 Logo (fallback)"
      class="episodeImage image"
      loading="lazy"
    />

    <a :href="episode.link" target="_blank">Click to Listen</a>
    </div>
    <div v-else class="noEpisode">
        No episode data available.
    </div>
</template>

<style scoped>
</style>