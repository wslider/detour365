const verseImage = document.getElementById('verseImage');
const verseText = document.getElementById('verseText');
const verseReference = document.getElementById('verseReference');

export async function displayVerseOfTheDay() {
    const today = new Date();
    const month = today.getMonth() + 1; // getMonth() is zero-based
    const day = today.getDate();
    
    const dateStr = today.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric'
    });

    try {
        const response = await fetch('data/daily.json');
        if (!response.ok) {
            throw new Error(`Failed to load daily.json: ${response.status}`);
        }
        const data = await response.json();
        const verseData = data.find(entry => entry.date === dateStr);
        if (!verseData) {
            verseText.textContent = " Lean not on your own understanding, but in all your ways submit to him, and he will make your paths straight. Proverbs 3:5-6";
            verseReference.textContent = "Proverbs 3:5-6";
            verseImage.src = "https://wslider.github.io/detour365/images/tartoosh-sunset-trail.jpeg";
            verseImage.alt = "Proverbs 3:5-6";
            return;
        }
        verseText.textContent = verseData.text; 
        verseReference.textContent = verseData.reference;
        verseImage.src = "https://wslider.github.io/detour365/images/tartoosh-sunset-trail.jpeg";
        verseImage.alt = `${verseData.reference} - ${verseData.text}`;

    }
    catch (error) {
        console.error("Error fetching verse of the day:", error);
        verseText.textContent = "Unable to load verse of the day.";
    }

}


export async function generateShareableVerseImage() {
    // Get the current verse from the page
    const currentVerseText = document.getElementById('verseText').innerText.trim();
    const currentReference = document.getElementById('verseReference').innerText.trim();

    if (!currentVerseText || currentVerseText.includes("Loading")) {
        alert("Verse is still loading. Please try again in a moment.");
        return;
    }

    // Populate the hidden share card
    document.getElementById('share-verse-text').innerText = currentVerseText;
    document.getElementById('share-verse-reference').innerText = currentReference;

    const card = document.getElementById('verse-share-card');
    card.style.display = 'block';

    try {
        // Generate high-quality image
        const canvas = await html2canvas(card, {
            scale: 2,                    // Higher quality
            logging: false,
            backgroundColor: null
        });

        // Hide the card again
        card.style.display = 'none';

        // === DOWNLOAD ===
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        link.download = `detour365-verse-${date}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        // === SHARE (especially good on mobile) ===
        if (navigator.canShare && navigator.canShare({ files: [] })) {
            canvas.toBlob(async (blob) => {
                const file = new File([blob], `detour365-verse-${date}.png`, { type: 'image/png' });

                try {
                    await navigator.share({
                        files: [file],
                        title: "Verse of the Day",
                        text: `${currentVerseText}\n\n${currentReference}\n\n#detour365 #verseoftheday`
                    });
                } catch (err) {
                    console.log("Share was cancelled or failed.");
                }
            });
        }

    } catch (error) {
        console.error("Error generating image:", error);
        alert("Sorry, there was a problem creating the image.");
        card.style.display = 'none';
    }
}

