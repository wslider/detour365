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
        mainImage.src='https://images.fineartamerica.com/images/artworkimages/mediumlarge/1/paths-to-the-top-william-slider.jpg';
        mainImage.alt='mountain with path starting at the base forking into two hiking paths to the top';
    }
    else if (hour <19) {
        mainImage.src='https://images.fineartamerica.com/images/artworkimages/mediumlarge/1/smoky-mountain-sunset-from-clingmans-dome-william-slider.jpg';
        mainImage.alt='sunset in the smoky mountains viewed from Clingmans Dome';
    }
    else {
        mainImage.src='https://images.fineartamerica.com/images/artworkimages/mediumlarge/3/night-forest-silhouettes-william-slider.jpg';
        mainImage.alt-'night sky over silhouettes of evergreen trees';
    }
}

updateMainImage(); 

setInterval(updateMainImage, 60000);