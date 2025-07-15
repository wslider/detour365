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