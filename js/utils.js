export function updateCustomCss () {
    const now=new Date();
    const hours=now.getHours();
    const customCssStyle = document.getElementById('customCssStyle');
    if (hours >= 6 && hours < 15) {
        customCssStyle.href = "css/daytime.css";
        
    }
    else if (hours >= 15 && hours < 20) {
        customCssStyle.href = "css/evening.css";
         }
    else {
        customCssStyle.href = "css/night.css";
    }
}

export function navBarLinks() {
    const myLinks = document.getElementById("myLinks");
    const currentDisplay = window.getComputedStyle(myLinks).display;
    const topNavBar = document.getElementById('topNavBar'); 

    if (currentDisplay === "block" || currentDisplay === "flex") {
        myLinks.style.display = "none";
    } else if (window.innerWidth < 768) {
        myLinks.style.display = "flex";
        myLinks.style.flexDirection = "column";
        topNavBar.style.display = "flex";
        topNavBar.style.flexDirection = "column"; 
    } else {
        myLinks.style.display = "flex";
        myLinks.style.flexDirection = "row";
        myLinks.style.justifyContent = "space-evenly"
        myLinks.style.gap = "2vw"
        topNavBar.style.display = "flex"; 
        topNavBar.style.flexDirection = "row"; 
        topNavBar.style.justifyContent = "flex-start";
        topNavBar.style.gap = "5vw"; 
        topNavBar.style.padding = "0 3vw 0 -1vw";
    }
}


export function updateFooter() {
    const footer = document.getElementById('footer');
    if (!footer) return; 

    const now = new Date();
    const footerYear = now.getFullYear();

    let footerMonth;
    switch (now.getMonth()){
    case 0:
        footerMonth = "January";
        break;
    case 1:
        footerMonth = "February";
        break;
    case 2:
        footerMonth = "March";
        break;
    case 3:
        footerMonth = "April";
        break;
    case 4:
        footerMonth = "May";
        break;
    case 5:
        footerMonth = "June";
        break;
    case 6:
        footerMonth = "July";
        break;
    case 7:
        footerMonth = "August";
        break;
    case 8:
        footerMonth = "September";
        break;
    case 9:
        footerMonth = "October";
        break;
    case 10:
        footerMonth = "November";
        break;
    case 11:
        footerMonth = "December";
        break;
    default:
        footerMonth = "";
        break;
    }

    footer.textContent = `William Slider - ${footerMonth} ${footerYear}`;
}