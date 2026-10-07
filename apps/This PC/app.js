const directoryInput = document.querySelector("#directory-input");
const photosInput = document.querySelector("#photos-input");
const pcView = document.querySelector("#pc-view");
const photosView = document.querySelector("#photos-view");
const folderView = document.querySelector("#folder-view");
const photoGrid = document.querySelector("#photo-grid");
const photoEmpty = document.querySelector("#photo-empty");
const folderGrid = document.querySelector("#folder-grid");
const folderEmpty = document.querySelector("#folder-empty");
const folderNotice = document.querySelector("#folder-notice");
const searchInput = document.querySelector("#search-input");
const photoUrls = [];
let currentView = "pc";
let lastFolderName = "";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unit = units[0];
  for (let index = 1; value >= 1024 && index < units.length; index += 1) {
    value /= 1024;
    unit = units[index];
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${unit}`;
}

function getBrowserName() {
  const brands = navigator.userAgentData?.brands;
  const brand = brands?.find((item) => !/Not.A.Brand/i.test(item.brand));
  if (brand) return `${brand.brand} ${brand.version}`;
  const ua = navigator.userAgent;
  const match = ua.match(/(Edg|OPR|Chrome|CriOS|Firefox|FxiOS|Version|Safari)\/([\d.]+)/);
  if (!match) return "Not reported";
  const name = { Edg: "Edge", OPR: "Opera", Chrome: "Chrome", CriOS: "Chrome", Firefox: "Firefox", FxiOS: "Firefox", Version: "Safari", Safari: "Safari" }[match[1]];
  return `${name} ${match[2].split(".")[0]}`;
}

function getPlatform() {
  const platform = navigator.userAgentData?.platform || navigator.platform || "";
  if (/win/i.test(platform)) return `Windows (${platform})`;
  if (/mac/i.test(platform)) return `macOS (${platform})`;
  if (/android/i.test(platform)) return "Android";
  if (/iphone|ipad|ipod/i.test(platform)) return "iOS";
  if (/linux/i.test(platform)) return `Linux (${platform})`;
  return platform || "Not reported by browser";
}

function updateDeviceInfo() {
  document.querySelector("#platform-value").textContent = getPlatform();
  document.querySelector("#browser-value").textContent = getBrowserName();
  document.querySelector("#screen-value").textContent =
    `${window.screen.width} × ${window.screen.height} px` +
    (window.devicePixelRatio > 1 ? ` (${window.devicePixelRatio}× display scale)` : "");
  document.querySelector("#cpu-value").textContent = navigator.hardwareConcurrency
    ? `${navigator.hardwareConcurrency} logical processors`
    : "Not reported";
  document.querySelector("#memory-value").textContent = navigator.deviceMemory
    ? `About ${navigator.deviceMemory} GB`
    : "Not reported";
  document.querySelector("#time-value").textContent =
    new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date());
}

async function updateStorageInfo() {
  const caption = document.querySelector("#storage-caption");
  const amount = document.querySelector("#storage-amount");
  const fill = document.querySelector("#storage-fill");
  if (!navigator.storage?.estimate) {
    caption.textContent = "Storage estimate is not available in this browser.";
    amount.textContent = "Not reported";
    fill.style.width = "0%";
    return;
  }
  try {
    const { usage, quota } = await navigator.storage.estimate();
    if (typeof usage !== "number" || typeof quota !== "number" || quota <= 0) {
      caption.textContent = "Storage estimate is not available for this site.";
      amount.textContent = "Not reported";
      fill.style.width = "0%";
      return;
    }
    const percent = Math.min(100, (usage / quota) * 100);
    caption.textContent = `${formatBytes(usage)} used of ${formatBytes(quota)} browser storage`;
    amount.textContent = `${percent.toFixed(1)}% used`;
    fill.style.width = `${percent}%`;
  } catch {
    caption.textContent = "Storage estimate is not available in this browser.";
    amount.textContent = "Not reported";
    fill.style.width = "0%";
  }
}

function setView(view, label) {
  currentView = view;
  searchInput.value = "";
  pcView.hidden = view !== "pc";
  photosView.hidden = view !== "photos";
  folderView.hidden = view !== "folder";
  document.querySelector("#address-label").textContent = label || (view === "pc" ? "This PC" : view === "photos" ? "This PC  ›  Photos" : `This PC  ›  ${lastFolderName}`);
  searchInput.placeholder = view === "photos" ? "Search Photos" : view === "folder" ? `Search ${lastFolderName}` : "Search This PC";
  folderNotice.hidden = true;
  document.querySelectorAll(".nav-item[data-view]").forEach((item) => {
    const active = item.dataset.view === (view === "folder" ? "pc" : view);
    item.classList.toggle("active", active);
    if (active) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });
  if (view === "pc") {
    document.querySelector("#status-count").textContent = "6 folders";
  } else if (view === "photos") {
    document.querySelector("#status-count").textContent = `${photoGrid.children.length} ${photoGrid.children.length === 1 ? "photo" : "photos"}`;
  } else {
    document.querySelector("#status-count").textContent = `${folderGrid.children.length} ${folderGrid.children.length === 1 ? "item" : "items"}`;
  }
  applySearch();
}

function selectDirectory(input) {
  input.value = "";
  input.click();
}

function isImage(file) {
  return file.type.startsWith("image/") || /\.(avif|bmp|gif|jpe?g|png|webp)$/i.test(file.name);
}

function renderPhotos(files) {
  photoGrid.replaceChildren();
  const images = [...files].filter(isImage).sort((a, b) =>
    (a.webkitRelativePath || a.name).localeCompare(b.webkitRelativePath || b.name, undefined, { numeric: true, sensitivity: "base" }),
  );
  photoUrls.forEach((url) => URL.revokeObjectURL(url));
  photoUrls.length = 0;

  images.forEach((file) => {
    const card = document.createElement("article");
    card.className = "photo-card";
    const image = document.createElement("img");
    image.draggable = false;
    const url = URL.createObjectURL(file);
    photoUrls.push(url);
    image.src = url;
    image.alt = file.name;
    image.loading = "lazy";
    image.addEventListener("error", () => {
      image.classList.add("broken-image");
      image.removeAttribute("src");
    }, { once: true });
    const caption = document.createElement("div");
    caption.className = "photo-caption";
    const name = document.createElement("strong");
    name.textContent = file.name;
    const size = document.createElement("span");
    size.textContent = formatBytes(file.size);
    caption.append(name, size);
    card.append(image, caption);
    photoGrid.append(card);
  });

  photoEmpty.hidden = images.length > 0;
  photoGrid.hidden = images.length === 0;
  document.querySelector("#photos-subheading").textContent = images.length
    ? `${images.length} ${images.length === 1 ? "photo" : "photos"} selected from your local folder.`
    : "Browse photos from your local photos folder.";
  document.querySelector("#status-count").textContent = `${images.length} ${images.length === 1 ? "photo" : "photos"}`;
  if (files.length && !images.length) {
    photoEmpty.querySelector("h2").textContent = "No images in this folder";
    photoEmpty.querySelector("p").textContent = "Choose a folder containing JPG, PNG, GIF, WebP, BMP, or AVIF images.";
  } else {
    photoEmpty.querySelector("h2").textContent = "Your photo gallery is ready";
    photoEmpty.querySelector("p").innerHTML = 'Choose the <strong>photos</strong> folder to display the images you add there.';
  }
}

function renderFolderFiles(files) {
  folderGrid.replaceChildren();
  const visibleFiles = [...files].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }),
  );
  visibleFiles.forEach((file) => {
    const row = document.createElement("article");
    row.className = "file-row";
    const icon = document.createElement("span");
    icon.className = "file-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = isImage(file) ? "▣" : file.type.startsWith("video/") ? "▷" : "▤";
    const name = document.createElement("strong");
    name.textContent = file.name;
    const type = document.createElement("span");
    type.textContent = file.type || "File";
    const size = document.createElement("span");
    size.textContent = formatBytes(file.size);
    row.append(icon, name, type, size);
    folderGrid.append(row);
  });
  folderGrid.hidden = visibleFiles.length === 0;
  folderEmpty.hidden = visibleFiles.length > 0;
  document.querySelector("#folder-subheading").textContent =
    `${visibleFiles.length} ${visibleFiles.length === 1 ? "item" : "items"} · selected from your device`;
  document.querySelector("#status-count").textContent = `${visibleFiles.length} ${visibleFiles.length === 1 ? "item" : "items"}`;
}

function loadSelectedFolder(files) {
  if (!files.length) return;
  const relativePath = files[0].webkitRelativePath;
  lastFolderName = relativePath ? relativePath.split("/")[0] : "Selected folder";
  document.querySelector("#folder-title").textContent = lastFolderName;
  setView("folder");
  renderFolderFiles(files);
}

function showFolderPickerError() {
  folderNotice.textContent = "Your browser can’t open a folder picker here. Try opening this page in a browser that supports folder selection, or use Choose photos folder.";
  folderNotice.hidden = false;
}

async function choosePhotosFolder() {
  if ("showDirectoryPicker" in window) {
    try {
      const directory = await window.showDirectoryPicker({ mode: "read" });
      const files = [];
      for await (const entry of directory.values()) {
        if (entry.kind === "file") files.push(await entry.getFile());
      }
      setView("photos");
      renderPhotos(files);
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
      showFolderPickerError();
      return;
    }
  }
  selectDirectory(photosInput);
}

photosInput.addEventListener("change", () => {
  if (!photosInput.files.length) return;
  setView("photos");
  renderPhotos(photosInput.files);
});

directoryInput.addEventListener("change", () => {
  loadSelectedFolder(directoryInput.files);
});

document.querySelector("#open-photos-button").addEventListener("click", () => {
  setView("photos");
  choosePhotosFolder();
});
document.querySelector("#choose-photos-button").addEventListener("click", choosePhotosFolder);
document.querySelector("#empty-choose-button").addEventListener("click", choosePhotosFolder);
document.querySelector("#select-folder-button").addEventListener("click", () => selectDirectory(directoryInput));

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.view === "home" || button.dataset.view === "pc") setView("pc");
    if (button.dataset.view === "photos") {
      setView("photos");
      if (!photoGrid.children.length) choosePhotosFolder();
    }
  });
});

document.querySelectorAll("[data-folder]").forEach((button) => {
  button.addEventListener("click", () => {
    lastFolderName = button.dataset.folder;
    document.querySelector("#folder-title").textContent = lastFolderName;
    setView("folder");
    selectDirectory(directoryInput);
  });
});

document.querySelector("#up-button").addEventListener("click", () => setView("pc"));
document.querySelector("#back-button").addEventListener("click", () => setView("pc"));
document.querySelector("#forward-button").addEventListener("click", () => {
  if (currentView === "pc") setView("photos");
});

function applySearch() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  if (currentView === "pc") {
    let shown = 0;
    document.querySelectorAll(".folder-card, .spec-card, .drive-card").forEach((card) => {
      const matches = card.textContent.toLocaleLowerCase().includes(query);
      card.hidden = !matches;
      if (matches) shown += 1;
    });
    document.querySelector("#status-count").textContent = query ? `${shown} results` : "6 folders";
    return;
  }
  const cards = currentView === "photos" ? photoGrid.children : folderGrid.children;
  let shown = 0;
  [...cards].forEach((card) => {
    const matches = card.textContent.toLocaleLowerCase().includes(query);
    card.hidden = !matches;
    if (matches) shown += 1;
  });
  const noun = currentView === "photos" ? "photo" : "item";
  document.querySelector("#status-count").textContent = query
    ? `${shown} ${shown === 1 ? noun : `${noun}s`}`
    : `${cards.length} ${cards.length === 1 ? noun : `${noun}s`}`;
}

searchInput.addEventListener("input", applySearch);

updateDeviceInfo();
updateStorageInfo();
window.setInterval(updateDeviceInfo, 60_000);
