const API_KEY = "dce60f5218296b51f6dbde1b4815c4ea";
const BASE_URL = "https://api.themoviedb.org/3";

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const resultsEl = document.getElementById("results");

searchBtn.addEventListener("click", () => {
  const q = searchInput.value.trim();
  if (!q) return showMessage("Enter a movie title");
  searchMovies(q);
});
searchInput.addEventListener("keypress", e => {
  if (e.key === "Enter") searchBtn.click();
});

function showMessage(msg) {
  resultsEl.innerHTML = `<div class="loading">${msg}</div>`;
}

async function searchMovies(query) {
  showMessage("Searching...");
  try {
    const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      return showMessage("No results found");
    }

    resultsEl.innerHTML = "";
    data.results.slice(0, 12).forEach(movie => {
      const el = document.createElement("div");
      el.className = "movie";
      el.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w342${movie.poster_path}" alt="${movie.title}" />
        <div class="movie-info">
          <h3>${movie.title}</h3>
          <p>${(movie.release_date || "").slice(0,4)}</p>
        </div>
      `;
      el.addEventListener("click", () => showTrailer(movie.id, movie.title));
      resultsEl.appendChild(el);
    });
  } catch (err) {
    console.error(err);
    showMessage("Error fetching movies");
  }
}

async function showTrailer(movieId, title) {
  try {
    const url = `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    const yt = data.results.find(v => v.site === "YouTube" && v.type === "Trailer");
    if (!yt) return showMessage("No trailer found for this movie");

    const trailerEl = document.createElement("div");
    trailerEl.className = "trailer";
    trailerEl.innerHTML = `
      <h2>${title} — Trailer</h2>
      <iframe src="https://www.youtube.com/embed/${yt.key}" allowfullscreen></iframe>
    `;

    // Insert trailer at top of results grid
    resultsEl.prepend(trailerEl);
    trailerEl.scrollIntoView({behavior:"smooth"});
  } catch (err) {
    console.error(err);
    showMessage("Error loading trailer");
  }
}
