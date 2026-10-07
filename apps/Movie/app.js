const movies = Array.from({ length: 6 }, (_, index) => {
  const number = index + 1;
  return {
    id: `movie${number}`,
    title: `Movie ${number}`,
    file: `movies/movie${number}.mp4`,
    thumbnail: `thumbnail/movie${number}.png`,
  };
});

const grid = document.querySelector("#movie-grid");
const catalogView = document.querySelector("#catalog-view");
const playerView = document.querySelector("#player-view");
const player = document.querySelector("#movie-player");
const playerTitle = document.querySelector("#player-title");
const videoError = document.querySelector("#video-error");
const playerNote = document.querySelector("#player-note");

function openMovie(movie) {
  catalogView.hidden = true;
  playerView.hidden = false;
  playerTitle.textContent = movie.title;
  player.poster = movie.thumbnail;
  player.src = movie.file;
  videoError.hidden = true;
  playerNote.textContent = "Enjoy the show. Use “All movies” whenever you’re ready to leave.";
  document.title = `${movie.title} — Reel Room`;
  player.play().catch(() => {
    playerNote.textContent = "Press play to start your movie.";
  });
}

function renderCatalog() {
  grid.replaceChildren();
  movies.forEach((movie, index) => {
    const card = document.createElement("button");
    card.className = "movie-card";
    card.type = "button";
    card.setAttribute("aria-label", `Watch ${movie.title}`);

    const poster = document.createElement("span");
    poster.className = `poster poster-${index + 1}`;
    poster.setAttribute("aria-hidden", "true");

    const image = document.createElement("img");
    image.draggable = false;
    image.src = movie.thumbnail;
    image.alt = "";
    image.loading = "lazy";
    image.addEventListener("error", () => poster.classList.add("poster-fallback"), { once: true });
    poster.append(image);

    const playIcon = document.createElement("span");
    playIcon.className = "card-play";
    playIcon.setAttribute("aria-hidden", "true");
    playIcon.textContent = "▶";
    poster.append(playIcon);

    const details = document.createElement("span");
    details.className = "movie-details";
    const title = document.createElement("span");
    title.className = "movie-title";
    title.textContent = movie.title;
    const label = document.createElement("span");
    label.className = "movie-label";
    label.textContent = "SHORT FILM";
    details.append(title, label);
    card.append(poster, details);
    card.addEventListener("click", () => openMovie(movie));
    grid.append(card);
  });
}

function showCatalog() {
  player.pause();
  player.removeAttribute("src");
  player.load();
  playerView.hidden = true;
  catalogView.hidden = false;
  document.title = "Choose a movie — Reel Room";
}

renderCatalog();

const selectedMovie = new URLSearchParams(window.location.search).get("movie");
const movieToPlay = movies.find((movie) => movie.id === selectedMovie);
if (movieToPlay) {
  openMovie(movieToPlay);
} else {
  showCatalog();
}

player.addEventListener("error", () => {
  videoError.hidden = false;
});
