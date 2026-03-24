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
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('myLinks');

  if (!hamburger || !navLinks) return;

  function toggleMenu() {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    
    hamburger.setAttribute('aria-expanded', !isOpen);
    hamburger.classList.toggle('active');       // ← toggles X icon
    navLinks.classList.toggle('active');
  }

  function closeMenu() {
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.classList.remove('active');       // ← X goes back to hamburger
    navLinks.classList.remove('active');
  }

  hamburger.addEventListener('click', toggleMenu);

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      closeMenu();
    }
  });
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

    footer.textContent = `Detour 365 - ${footerMonth} ${footerYear}`;
}