const a = document.querySelector(".batt_p");
navigator.getBattery().then(battery => {
    function update() {
        a.innerHTML = Math.round(battery.level * 100) + "%";
    };
    update();
    battery.addEventListener("levelchange", update)
});



const currentTime = new Date();
const timeElement = document.getElementById("time");
const dateElement = document.querySelector(".date");
timeElement.innerHTML = currentTime.toLocaleTimeString();
setInterval(() => {
    const currentTime = new Date();
    timeElement.innerHTML = currentTime.toLocaleTimeString();
    dateElement.innerHTML = currentTime.toLocaleDateString();

}, 1000);

// write js code to toggle wifi and offilne icon on network change
const wifiIcon = document.querySelector(".wifi span");
window.addEventListener("online", () => {
    wifiIcon.innerHTML = "wifi";
});
window.addEventListener("offline", () => {
    wifiIcon.innerHTML = "wifi_off";
});

// write js code to toggle battery charging icon on battery charging change
const batteryIcon = document.querySelector(".battery span");
navigator.getBattery().then(battery => {
    function update() {
        if (battery.charging) {
            batteryIcon.innerHTML = "charger";
        } else {
            batteryIcon.innerHTML = "battery_full_alt";
        }
    };
    update();
    battery.addEventListener("chargingchange", update)
});

const apps = {
    "This PC": "./apps/This PC/index.html",
    "Chrome": "https://www.google.com/search?igu=1",
    "Google AI": "https://www.google.com/search?q=addeventlistener+double+click&sca_esv=b1f4eb556121911c&igu=1&sxsrf=APpeQns3iizrcGz6RsS_l1Uknbc6PxgorQ%3A1791387776327&source=hp&ei=gGjGarzOEuaX4-EP1eOM4Qc&iflsig=ABILxe8AAAAAasZ2kN3T7ngoL_Bsvaa722QRkvjQAeJr&udm=50&csuir=1&aep=107&mstk=AUtExfDdouHvIVEZlNZ0pbFaMIx46-brjaJbsicrbziy5lfU7aI64fNMjHIF0BElVsIL3FLxNBVM4_txxFpzNvOLFPKW_xQ7qncPlXCghXb3PLOM2Cbn1lpSJUJaJ6X7UZfOAJX7DfVBubH-mDAOtHZsqOo39ivI4E_LZc8&oq=&gs_lp=Egdnd3Mtd2l6IgAqEAgAGKIHGJ4GGPAFGOoCGCcyEBAjGKIHGJ4GGPAFGOoCGCcyEBAjGPAFGJ4GGKIHGOoCGCcyEBAjGKIHGJ4GGPAFGOoCGCcyEBAjGPAFGJ4GGKIHGOoCGCcyEBAjGPAFGJ4GGKIHGOoCGCdI5sYIUABYAHAAeACQAQCYAdcCoAGTBaoBAzMtMrgBAcgBAJgCAqACjwaoAgWYA6oDkgcFMy0xLjGgB5YqsgcFMy0xLjG4B48GwgcFNC0xLjHIB12ACAE&sclient=gws-wiz&cs=1",
    "Terminal": "./apps/Terminal/index.html",
    "Calculator": "./apps/Calculator/index.html",
    "Weather": "./apps/Weather/index.html",
    "Foodie": "./apps/Foodie/index.html",
    "Reel Room": "./apps/Movie/index.html",
}

document.querySelectorAll(".icon").forEach(icon => {
    icon.addEventListener("dblclick", () => {
        const appName = icon.querySelector("span").innerHTML;
        const appPath = apps[appName];
        const viewer = document.querySelector("viewer");
        const tbar = viewer.querySelector(".tbar");
        tbar.querySelector("img").src = icon.querySelector("img").src;
        tbar.querySelector("span").innerHTML = appName;
        viewer.style.display = "flex";
        viewer.querySelector("iframe").src = appPath;
    });
});

document.querySelectorAll("viewer .tbar span.material-symbols-outlined").forEach(close => {
    close.addEventListener("click", () => {
        const viewer = close.closest("viewer");
        viewer.style.display = "none";
        viewer.querySelector(".appimg").src = "";
        viewer.querySelector(".appname").innerHTML = "";
        viewer.querySelector("iframe").src = "";
    });
});

function blockMobileAndTablet() {
  const ua = navigator.userAgent;

  // 1. Detect Mobile
  const isMobile = /Mobi|Android|iPhone|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|obi[^s])/i.test(ua);
  
  // 2. Detect Tablet (including iPadOS desktop spoofing check)
  const isTablet = /Tablet|iPad|PlayBook|Nexus 7|Xoom|Kindle|Silk/i.test(ua) || 
                   (/Macintosh/i.test(ua) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2) ||
                   (window.matchMedia('(pointer: coarse)').matches && window.matchMedia('(min-width: 768px)').matches);

  // 3. If either condition is met, rewrite the body
  if (isMobile || isTablet) {
    // Force clean body styling to reset any site CSS margins/paddings
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden"; 

    // Replace body content with a modern, centered layout
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        width: 100vw;
        background-color: #f8f9fa;
        font-family: system-ui, -apple-system, sans-serif;
        color: #333333;
        text-align: center;
        padding: 20px;
        box-sizing: border-box;
      ">
        <div style="max-width: 450px; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <div style="font-size: 48px; margin-bottom: 20px;">🖥️</div>
          <h1 style="font-size: 24px; margin: 0 0 10px 0; color: #111111;">Desktop Only</h1>
          <p style="font-size: 16px; line-height: 1.5; color: #666666; margin: 0;">
            This website is optimized for larger screens and is currently unavailable on mobile or tablet devices. Please switch to a computer to view this page.
          </p>
        </div>
      </div>
    `;
  }
}

// Execute immediately when the script loads
blockMobileAndTablet();
