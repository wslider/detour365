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
            verseImage.src = "/images/tartoosh-sunset-trail.jpeg";
            verseImage.alt = "Proverbs 3:5-6";
            return;
        }
        verseText.textContent = verseData.text; 
        verseReference.textContent = verseData.reference;
        verseImage.src = "/images/tartoosh-sunset-trail.jpeg";
        verseImage.alt = `${verseData.reference} - ${verseData.text}`;

    }
    catch (error) {
        console.error("Error fetching verse of the day:", error);
        verseText.textContent = "Unable to load verse of the day.";
    }

}

