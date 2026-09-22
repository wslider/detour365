/* js/stats.js */

const total_youtube_views = document.getElementById('total_yt_views');

export async function display_views() {
    if (!total_youtube_views) return;

    try {
        const response = await fetch('data/d365_yt_stats.json');
        if (!response.ok) {
            throw new Error('Failed to load data');
        }

        const data = await response.json();
        const views = Number(data.viewCount).toLocaleString();
        total_youtube_views.textContent = `Total Youtube Views: ${views}`;
    } catch (error) {
        console.log(error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', display_views);
} else {
    display_views();
}