// Import Bible reference parser (still needed only for potential future use or validation)
/*
import { bcv_parser } from 'https://cdn.jsdelivr.net/npm/bible-passage-reference-parser@3/esm/bcv_parser.js';
import * as enLang from 'https://cdn.jsdelivr.net/npm/bible-passage-reference-parser@3/esm/lang/en.js'; 
*/

// Note: Bible API fetching has been temporarily scrapped.
// We are now only pulling data from podcast.json and using DuckDuckGo !bg bang for passage links.

const epDate = document.getElementById('epDate');
const epTitle = document.getElementById('epTitle');
const epPassage = document.getElementById('epPassage');
const epSeries = document.getElementById('epSeries');
const epPassageLink = document.getElementById('episode-backup-link');
const epFullPassage = document.getElementById('epFullPassage');

function getSaturdayOfCurrentWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun ... 6=Sat
    let saturday = new Date(today);
    saturday.setDate(today.getDate() + (6 - dayOfWeek));
    if (dayOfWeek === 6) saturday = today; // Already Saturday → use today

    const yearSat = saturday.getFullYear();
    const monthSat = saturday.toLocaleString('default', { month: 'long' });
    const daySat = String(saturday.getDate()).padStart(2, '0');

    return `${yearSat} ${monthSat} ${daySat}`;
}

export async function displayThisWeek() {
    try {
        // Loading state
        epDate.textContent = '';
        epTitle.textContent = '';
        epPassage.textContent = '';
        epSeries.textContent = '';
        epFullPassage.textContent = '';

        // Fetch podcast JSON
        const response = await fetch('data/podcast.json');
        if (!response.ok) {
            throw new Error('Failed to load podcast data');
        }

        const data = await response.json();

        const targetDate = getSaturdayOfCurrentWeek();
        const episode = data.find(ep => ep.date === targetDate);

        if (!episode) {
            epDate.textContent = 'No episode scheduled for this Saturday.';
            return;
        }

        // Display basic episode info
        epDate.textContent = episode.date;
        epTitle.textContent = episode.title;
        epSeries.textContent = episode.series ? `Series: ${episode.series}` : 'Standalone';

        // Handle passage display and DuckDuckGo !bg link
        if (episode.passage) {
            epPassage.textContent = `Passage: ${episode.passage}`;

            // Create DuckDuckGo !bg bang link (goes directly to Bible Gateway)
            const searchQuery = encodeURIComponent(episode.passage);
            epPassageLink.href = `https://duckduckgo.com/?q=!bg+${searchQuery}`;
            epPassageLink.target = "_blank";
            epPassageLink.rel = "noopener";
            epPassageLink.style.display = "inline";
            
            // Optional: Make link text more user-friendly
            epPassageLink.textContent = `Read ${episode.passage}`;
        } else {
            epPassage.textContent = 'No passage listed';
            epPassageLink.href = "#";
            epPassageLink.style.display = "none";
            epFullPassage.textContent = '(No passage reference provided)';
        }

    } catch (error) {
        console.error('Error in displayThisWeek:', error);
    }
}