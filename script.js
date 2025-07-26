// custom css style sheet for time of day
function updateCssTheme (){
    const now = new Date();
    const hour = now.getHours();
    linkElement = document.getElementById('customCssStyle');
    if (hour >= 6 && hour <= 15) {linkElement.href='styles.css';
    }
    else if (hour <19) {linkElement.href='evening.css';} 
    else {linkElement.href='night.css'}
}

updateCssTheme(); 

setInterval(updateCssTheme, 60000); 

function updateMainImage (){
    const now = new Date();
    const hour = now.getHours();
    const mainImage = document.getElementById('mainImage'); 
     if (hour >= 6 && hour <= 15) { 
        mainImage.src='hurricane-ridge-olymipic.jpg';
        mainImage.alt='image of hurricane ridge in Olympic National Park';
    }
    else if (hour <19) {
        mainImage.src='tartoosh-sunset-trail.jpeg';
        mainImage.alt='mountain trail at sunset';
    }
    else {
        mainImage.src='20220805_223032-01.jpeg';
        mainImage.alt-'night sky over Mount Rainier';
    }
}

updateMainImage(); 

setInterval(updateMainImage, 60000);