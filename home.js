const carousel = document.querySelector("#poster-carousel");
document.querySelectorAll("[data-carousel-direction]").forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.carouselDirection === "next" ? 1 : -1;
    const tile = carousel.querySelector(".movie-tile");
    const distance = (tile?.getBoundingClientRect().width || 260) + 20;
    carousel.scrollBy({ left: distance * direction, behavior: "smooth" });
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".home-reveal").forEach((section) => revealObserver.observe(section));

const landingPosterPool = [
  { title: "Project Hail Mary", image: "assets/project-hail-mary-poster.png", href: "./project-hail-mary/index.html" },
  { title: "The Sheep Detectives", image: "assets/sheep-detectives-poster.png", href: "./sheep-detectives/index.html" },
  { title: "Zootopia 2", image: "assets/zootopia-2-logo.webp", href: "./zootopia-2/index.html" },
];

const backgroundCards = document.querySelectorAll(".saas-home .hero-card-back, .saas-home .hero-card-front");
if (backgroundCards.length === 2) {
  const selected = [...landingPosterPool].sort(() => Math.random() - 0.5).slice(0, 2);
  backgroundCards.forEach((card, index) => {
    const movie = selected[index];
    const image = card.querySelector("img");
    card.href = movie.href;
    image.src = movie.image;
    image.alt = `${movie.title} movie poster`;
  });
}

const filterState = { level: "all", genre: "all", platform: "all" };
const filterButtons = document.querySelectorAll(".movie-filter");
const movieTiles = document.querySelectorAll(".movie-tile[data-level]");
const filterStatus = document.querySelector("#filter-status");

function applyMovieFilters() {
  let visibleCount = 0;
  movieTiles.forEach((tile) => {
    const matchesLevel = filterState.level === "all" || tile.dataset.level === filterState.level;
    const matchesGenre = filterState.genre === "all" || tile.dataset.genre.split(" ").includes(filterState.genre);
    const matchesPlatform = filterState.platform === "all" || tile.dataset.platform === filterState.platform;
    const visible = matchesLevel && matchesGenre && matchesPlatform;
    tile.hidden = !visible;
    if (visible) visibleCount += 1;
  });
  if (filterStatus) filterStatus.textContent = visibleCount ? `Showing ${visibleCount} lesson${visibleCount === 1 ? "" : "s"}.` : "No lessons match these filters yet.";
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.dataset.filterGroup;
    filterState[group] = button.dataset.filterValue;
    document.querySelectorAll(`.movie-filter[data-filter-group="${group}"]`).forEach((item) => item.classList.toggle("active", item === button));
    applyMovieFilters();
  });
});
