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
    "Google AI": "https://www.google.com/search?sca_esv=b1f4eb556121911c&igu=1&sxsrf=APpeQns3iizrcGz6RsS_l1Uknbc6PxgorQ%3A1791387776327&ei=gGjGarzOEuaX4-EP1eOM4Qc&iflsig=ABILxe8AAAAAasZ2kN3T7ngoL_Bsvaa722QRkvjQAeJr&udm=50&oq=&gs_lp=Egdnd3Mtd2l6IgAqEAgAGKIHGJ4GGPAFGOoCGCcyEBAjGKIHGJ4GGPAFGOoCGCcyEBAjGPAFGJ4GGKIHGOoCGCcyEBAjGKIHGJ4GGPAFGOoCGCcyEBAjGPAFGJ4GGKIHGOoCGCcyEBAjGPAFGJ4GGKIHGOoCGCdI5sYIUABYAHAAeACQAQCYAdcCoAGTBaoBAzMtMrgBAcgBAJgCAqACjwaoAgWYA6oDkgcFMy0xLjGgB5YqsgcFMy0xLjG4B48GwgcFNC0xLjHIB12ACAE&sclient=gws-wiz&cs=1&zs=1",
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


