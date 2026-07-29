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

if (carousel && !carousel.querySelector('[href="./se7en/index.html"]')) {
  carousel.insertAdjacentHTML("beforeend", '<article class="movie-tile" data-level="intermediate" data-genre="mystery crime" data-platform="max"><a href="./se7en/index.html" class="movie-poster-link"><img src="assets/Se7en-poster.png" alt="Se7en movie poster"><span class="content-warning-tag">Violence warning</span><span class="play-overlay">&#9654;</span></a><div class="movie-meta"><h3>Se7en</h3><p><span>Intermediate</span> &middot; Mystery &middot; Crime &middot; Max</p></div></article>');
  if (filterStatus) filterStatus.textContent = "Showing all 9 lessons.";
}
if (carousel && !carousel.querySelector('[href="./devil-wears-prada/index.html"]')) {
  carousel.insertAdjacentHTML("beforeend", '<article class="movie-tile" data-level="intermediate" data-genre="romance comedy" data-platform="disney-plus"><a href="./devil-wears-prada/index.html" class="movie-poster-link"><img src="assets/devil-wears-prada-poster.webp" alt="The Devil Wears Prada movie poster"><span class="play-overlay">&#9654;</span></a><div class="movie-meta"><h3>The Devil Wears Prada</h3><p><span>Intermediate</span> &middot; Comedy &middot; Disney+</p></div></article>');
  if (filterStatus) filterStatus.textContent = "Showing all 10 lessons.";
}

if (carousel && !document.querySelector("#curated-movie-rows")) {
  const curatedRows = document.createElement("section");
  curatedRows.id = "curated-movie-rows";
  curatedRows.className = "curated-movie-rows";
  curatedRows.innerHTML = `
    <section class="curated-row"><div class="curated-row-heading"><h2>Great for debate</h2><p>Big choices, difficult values, and plenty to discuss.</p></div><div class="curated-poster-row">
      <a href="./odyssey/index.html" class="curated-movie-card"><img src="assets/the-odyssey-poster.webp" alt="The Odyssey movie poster"><span>The Odyssey</span></a>
      <a href="./devil-wears-prada/index.html" class="curated-movie-card"><img src="assets/devil-wears-prada-poster.webp" alt="The Devil Wears Prada movie poster"><span>The Devil Wears Prada</span></a>
      <a href="./eternity/index.html" class="curated-movie-card"><img src="assets/Eternity-poster.webp" alt="Eternity movie poster"><span>Eternity</span></a>
    </div></section>
    <section class="curated-row"><div class="curated-row-heading"><h2>Detective stories</h2><p>Follow the clues, question the suspects, and solve the case.</p></div><div class="curated-poster-row">
      <a href="./zootopia-2/index.html" class="curated-movie-card"><img src="assets/zootopia-2-logo.webp" alt="Zootopia 2 movie poster"><span>Zootopia 2</span></a>
      <a href="./sheep-detectives/index.html" class="curated-movie-card"><img src="assets/sheep-detectives-poster.png" alt="The Sheep Detectives movie poster"><span>The Sheep Detectives</span></a>
      <a href="./se7en/index.html" class="curated-movie-card" data-content-warning="violent"><img src="assets/Se7en-poster.png" alt="Se7en movie poster"><span>Se7en</span></a>
    </div></section>`;
  carousel.closest(".activity-shelf").insertAdjacentElement("afterend", curatedRows);
}

function applyMovieFilters() {
  let visibleCount = 0;
  document.querySelectorAll(".movie-tile[data-level]").forEach((tile) => {
    const matchesLevel = filterState.level === "all" || tile.dataset.level === filterState.level;
    const matchesGenre = filterState.genre === "all" || tile.dataset.genre.split(" ").includes(filterState.genre);
    const matchesPlatform = filterState.platform === "all" || tile.dataset.platform.split(" ").includes(filterState.platform);
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

const warningLinks = document.querySelectorAll("[data-content-warning='violent'], a[href='./se7en/index.html']");
if (warningLinks.length) {
  const warningDialog = document.createElement("dialog");
  warningDialog.className = "content-warning-dialog";
  warningDialog.innerHTML = `<div class="content-warning-dialog__body"><p class="eyebrow">Content note</p><h2>Alien: Romulus</h2><p>This movie includes intense and violent scenes. The lesson is recommended for adult learners.</p><div class="content-warning-dialog__actions"><button class="warning-cancel" type="button">Go back</button><a class="warning-continue" href="./alien-romulus/index.html">I understand, continue</a></div></div>`;
  document.body.appendChild(warningDialog);
  warningLinks.forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault();
    const isSe7en = link.getAttribute("href") === "./se7en/index.html";
    warningDialog.querySelector("h2").textContent = isSe7en ? "Se7en" : "Alien: Romulus";
    warningDialog.querySelector("p:not(.eyebrow)").textContent = isSe7en ? "This movie includes graphic violence, disturbing crime scenes, and adult themes. The lesson is recommended for adult learners." : "This movie includes intense and violent scenes. The lesson is recommended for adult learners.";
    warningDialog.querySelector(".warning-continue").href = link.href;
    warningDialog.showModal();
  }));
  warningDialog.querySelector(".warning-cancel").addEventListener("click", () => warningDialog.close());
  warningDialog.addEventListener("click", (event) => { if (event.target === warningDialog) warningDialog.close(); });
}
