// thisWeek.js

// Import Bible reference parser directly via CDN (ESM - no npm needed)
import { bcv_parser } from 'https://cdn.jsdelivr.net/npm/bible-passage-reference-parser@3/esm/bcv_parser.js';
import * as enLang from 'https://cdn.jsdelivr.net/npm/bible-passage-reference-parser@3/esm/lang/en.js';

const epDate = document.getElementById('epDate');
const epTitle = document.getElementById('epTitle');
const epPassage = document.getElementById('epPassage');
const epSeries = document.getElementById('epSeries');
const epFullPassage = document.getElementById('epFullPassage');

// Your Cloudflare Worker proxy URL 
const workerProxy = 'https://detour365.wslider2000.workers.dev/?url=';

const bibleID = '7142879509583d59-04'; // WEBBE

function getSaturdayOfCurrentWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun ... 6=Sat
    let saturday = new Date(today);
    saturday.setDate(today.getDate() + (6 - dayOfWeek));
    if (dayOfWeek === 6) saturday = today; // Already Saturday → use today

    const yearSat = saturday.getFullYear();
    const monthSat = saturday.toLocaleString('default', { month: 'long' });
    const daySat = String(saturday.getDate()).padStart(2, '0'); // "07"

    return `${yearSat} ${monthSat} ${daySat}`;
}

export async function displayThisWeek() {
    try {
        // Loading state
        epDate.textContent = 'Loading episode...';
        epTitle.textContent = '';
        epPassage.textContent = '';
        epSeries.textContent = '';
        epFullPassage.textContent = '';

        // Fetch podcast JSON
        const response = await fetch('data/podcast.json');
        if (!response.ok) {
            throw new Error(`Failed to load podcast.json: ${response.status}`);
        }
        const data = await response.json();

        const targetDate = getSaturdayOfCurrentWeek();
        const episode = data.find(ep => ep.date === targetDate);

        if (!episode) {
            epDate.textContent = 'No episode scheduled for this Saturday.';
            return;
        }

        // Display episode metadata with clean labels
        epDate.textContent = episode.date;
        epTitle.textContent = episode.title;
        epPassage.textContent = episode.passage ? `Passage: ${episode.passage}` : 'No passage listed';
        epSeries.textContent = episode.series ? `Series: ${episode.series}` : 'Standalone';

        // Fetch full passage text via Worker proxy
        if (episode.passage) {
            // Parse reference to OSIS format (e.g. "Gen.8.1-Gen.8.22")
            const parser = new bcv_parser(enLang);
            const parsed = parser.parse(episode.passage);
            let osis = parsed.osis();

            // Uppercase book codes for API.Bible (GEN, PSA, etc.)
            osis = osis.replace(/([A-Za-z]+)\./g, (m, book) => book.toUpperCase() + '.');

            // Build API.Bible passage URL
            const baseUrl = `https://rest.api.bible/v1/bibles/${bibleID}/passages/${osis}?` +
                'content-type=text' +
                '&include-notes=false' +
                '&include-titles=true' +
                '&include-chapter-numbers=false' +
                '&include-verse-numbers=true' +
                '&include-verse-spans=false' +
                '&use-org-id=false';

            // Call your Worker proxy
            const proxyUrl = workerProxy + encodeURIComponent(baseUrl);

            const passageRes = await fetch(proxyUrl);

            if (!passageRes.ok) {
                throw new Error(`Passage fetch failed: ${passageRes.status} ${passageRes.statusText}`);
            }

            const passageData = await passageRes.json();
            const text = passageData.data?.content?.trim() || '(Full passage text unavailable)';

            epFullPassage.textContent = text;
        } else {
            epFullPassage.textContent = '(No passage reference provided)';
        }

    } catch (error) {
        console.error('Error in displayThisWeek:', error);
        epDate.textContent = 'Error loading episode';
        epFullPassage.textContent = `Could not load passage: ${error.message}`;
    }
}
