import { updateCustomCss } from "./utils.js";
import { navBarLinks } from "./utils.js";
import { updateFooter } from "./utils.js";
import { displayLatestEpisode } from "./latestEpisode.js";
import { displayVerseOfTheDay } from "./daily.js";
import { displayThisWeek } from "./thisWeek.js";    


document.getElementById('topNavBar').addEventListener('click', navBarLinks);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        updateCustomCss();
        setInterval(updateCustomCss, 30 * 60 * 1000); // Update every 30 minutes
        displayLatestEpisode();
        displayThisWeek();
        displayVerseOfTheDay();
        updateFooter();
        setInterval(updateFooter, 24 * 60 * 60 * 1000); // Update every day
    } );
} else {
    updateCustomCss();
    setInterval(updateCustomCss, 30 * 60 * 1000); // Update every 30 minutes
    displayLatestEpisode();
    displayThisWeek();
    displayVerseOfTheDay();
    updateFooter();
    setInterval(updateFooter, 24 * 60 * 60 * 1000); // Update every day
};  