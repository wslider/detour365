import { navBarLinks } from "./utils.js";
import { updateFooter } from "./utils.js"; 


document.getElementById('topNavBar').addEventListener('click', navBarLinks);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        updateFooter();
        setInterval(updateFooter, 24 * 60 * 60 * 1000); // Update every day
    } );
} else {
    updateFooter();
    setInterval(updateFooter, 24 * 60 * 60 * 1000); // Update every day
};  