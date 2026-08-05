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
  { title: "The Odyssey", image: "assets/the-odyssey-poster.webp", href: "./odyssey/index.html" },
  { title: "Eternity", image: "assets/Eternity-poster.webp", href: "./eternity/index.html" },
  { title: "KPop Demon Hunters", image: "assets/kpop-demon-hunters-poster.webp", href: "./kpop-demon-hunters/index.html" },
  { title: "Moana 2", image: "assets/Moana-2-poster.webp", href: "./moana-2/index.html" },
  { title: "Alien: Romulus", image: "assets/alien-romulus-poster.webp", href: "./alien-romulus/index.html" },
  { title: "Se7en", image: "assets/Se7en-poster.png", href: "./se7en/index.html" },
  { title: "The Devil Wears Prada", image: "assets/devil-wears-prada-poster.webp", href: "./devil-wears-prada/index.html" },
  { title: "Forrest Gump", image: "assets/forrest-gump-poster.webp", href: "./forrest-gump/index.html" },
  { title: "Materialists", image: "assets/materialists-poster.webp", href: "./materialists/index.html" },
  { title: "The Housemaid", image: "assets/the-housemaid-poster.webp", href: "./the-housemaid/index.html" },
  { title: "F1: The Movie", image: "assets/f1-poster.webp", href: "./f1-the-movie/index.html" },
  { title: "Lilo & Stitch", image: "assets/lilo-and-stitch-poster.png", href: "./lilo-and-stitch/index.html" },
  { title: "Conclave", image: "assets/conclave-poster.webp", href: "./conclave/index.html" },
  { title: "The Wrong Paris", image: "assets/the-wrong-paris-poster.webp", href: "./the-wrong-paris/index.html" },
  { title: "Harry Potter and the Philosopher's Stone", image: "assets/harry-potter-1-poster.webp", href: "./harry-potter-philosophers-stone/index.html" },
  { title: "The Batman", image: "assets/batman-poster.webp", href: "./the-batman/index.html" },
  { title: "Frankenstein", image: "assets/frankenstein-poster.webp", href: "./frankenstein-easier/index.html" },
  { title: "Inside Out 2", image: "assets/inside-out-2-poster.webp", href: "./inside-out-2/index.html" },
  { title: "Superman", image: "assets/superman-poster.webp", href: "./superman-beginner/index.html" },
];

const backgroundCards = document.querySelectorAll(".saas-home .hero-card-back, .saas-home .hero-card-front");
if (backgroundCards.length === 2) {
  const featuredHref = document.querySelector(".saas-home .hero-card-main")?.getAttribute("href");
  const secondaryPosterPool = landingPosterPool.filter((movie) => movie.href !== featuredHref);
  const selected = secondaryPosterPool.sort(() => Math.random() - 0.5).slice(0, 2);
  backgroundCards.forEach((card, index) => {
    const movie = selected[index];
    const image = card.querySelector("img");
    card.href = movie.href;
    image.src = movie.image;
    image.alt = `${movie.title} movie poster`;
  });
}

const filterState = { level: "all", genre: "all", platform: "all" };
const levelFilterRow = document.querySelector('[data-filter-group="level"]')?.parentElement;
const genreFilterRow = document.querySelector('[data-filter-group="genre"]')?.parentElement;
const watchFilterRow = document.querySelector('[data-filter-group="platform"]')?.parentElement;
if (levelFilterRow) {
  const levels = [
    ["beginner", "Beginner"], ["elementary", "Elementary"],
    ["pre-intermediate", "Pre-Intermediate"], ["intermediate-plus", "Intermediate+"]
  ];
  levelFilterRow.innerHTML = '<span>Level</span><button class="movie-filter active" type="button" data-filter-group="level" data-filter-value="all">All levels</button>' + levels.map(([value, label]) => `<button class="movie-filter" type="button" data-filter-group="level" data-filter-value="${value}">${label}</button>`).join("");
}
if (genreFilterRow) {
  const genres = [
    ["action", "Action"], ["adventure", "Adventure"], ["animation", "Animation"], ["comedy", "Comedy"],
    ["crime", "Crime"], ["drama", "Drama"], ["family", "Family"], ["fantasy", "Fantasy"], ["history", "History"],
    ["horror", "Horror"], ["mystery", "Mystery"], ["romance", "Romance"],
    ["sci-fi", "Sci-fi"], ["sports", "Sports"], ["thriller", "Thriller"]
  ];
  genreFilterRow.innerHTML = '<span>Genre</span><button class="movie-filter active" type="button" data-filter-group="genre" data-filter-value="all">All genres</button>' + genres.map(([value, label]) => `<button class="movie-filter" type="button" data-filter-group="genre" data-filter-value="${value}">${label}</button>`).join("");
}
if (watchFilterRow) {
  const platforms = [
    ["apple-tv", "Apple TV"], ["cinemas", "Cinemas"], ["disney-plus", "Disney+"],
    ["max", "HBO Max"], ["netflix", "Netflix"], ["paramount-plus", "Paramount+"],
    ["prime-video", "Prime Video"]
  ];
  watchFilterRow.innerHTML = '<span>Watch on</span><button class="movie-filter active" type="button" data-filter-group="platform" data-filter-value="all">All platforms</button>' + platforms.map(([value, label]) => `<button class="movie-filter" type="button" data-filter-group="platform" data-filter-value="${value}">${label}</button>`).join("");
}
const filterButtons = document.querySelectorAll(".movie-filter");
const movieTiles = document.querySelectorAll(".movie-tile[data-level]");
const filterStatus = document.querySelector("#filter-status");

if (carousel && !carousel.querySelector('[href="./se7en/index.html"]')) {
  carousel.insertAdjacentHTML("beforeend", '<article class="movie-tile" data-level="intermediate" data-genre="mystery crime" data-platform="max"><a href="./se7en/index.html" class="movie-poster-link"><img src="assets/Se7en-poster.png" alt="Se7en movie poster"><span class="content-warning-tag">Violence warning</span><span class="play-overlay">&#9654;</span></a><div class="movie-meta"><h3>Se7en</h3><p><span>Intermediate</span> &middot; Mystery &middot; Crime &middot; Max</p></div></article>');
  if (filterStatus) filterStatus.textContent = "Showing all 9 lessons.";
}
if (carousel && !carousel.querySelector('[href="./devil-wears-prada/index.html"]')) {
  carousel.insertAdjacentHTML("beforeend", '<article class="movie-tile" data-level="intermediate" data-genre="romance comedy drama" data-platform="disney-plus"><a href="./devil-wears-prada/index.html" class="movie-poster-link"><img src="assets/devil-wears-prada-poster.webp" alt="The Devil Wears Prada movie poster"><span class="play-overlay">&#9654;</span></a><div class="movie-meta"><h3>The Devil Wears Prada</h3><p><span>Intermediate</span> &middot; Comedy &middot; Drama &middot; Disney+</p></div></article>');
  if (filterStatus) filterStatus.textContent = "Showing all 10 lessons.";
}
if (carousel && !carousel.querySelector('[href="./forrest-gump/index.html"]')) {
  carousel.insertAdjacentHTML("beforeend", '<article class="movie-tile" data-level="intermediate" data-genre="drama history" data-platform="paramount-plus"><a href="./forrest-gump/index.html" class="movie-poster-link"><img src="assets/forrest-gump-poster.webp" alt="Forrest Gump movie poster"><span class="play-overlay">&#9654;</span></a><div class="movie-meta"><h3>Forrest Gump</h3><p><span>Intermediate</span> &middot; Drama &middot; History &middot; Paramount+</p></div></article>');
  if (filterStatus) filterStatus.textContent = "Showing all 11 lessons.";
}
if (carousel && !carousel.querySelector('[href="./materialists/index.html"]')) {
  carousel.insertAdjacentHTML("beforeend", '<article class="movie-tile" data-level="intermediate" data-genre="romance drama" data-platform="max"><a href="./materialists/index.html" class="movie-poster-link"><img src="assets/materialists-poster.webp" alt="Materialists movie poster"><span class="play-overlay">&#9654;</span></a><div class="movie-meta"><h3>Materialists</h3><p><span>Intermediate</span> &middot; Romance &middot; Drama &middot; HBO Max</p></div></article>');
  if (filterStatus) filterStatus.textContent = "Showing all 12 lessons.";
}
if (carousel && !carousel.querySelector('[href="./the-housemaid/index.html"]')) {
  carousel.insertAdjacentHTML("beforeend", '<article class="movie-tile" data-level="intermediate" data-genre="mystery thriller" data-platform="prime-video"><a href="./the-housemaid/index.html" class="movie-poster-link" data-content-warning="disturbing"><img src="assets/the-housemaid-poster.webp" alt="The Housemaid movie poster"><span class="content-warning-tag">Adult content</span><span class="play-overlay">&#9654;</span></a><div class="movie-meta"><h3>The Housemaid</h3><p><span>Intermediate</span> &middot; Mystery &middot; Thriller &middot; Prime Video</p></div></article>');
  if (filterStatus) filterStatus.textContent = "Showing all 13 lessons.";
}
if (carousel && !carousel.querySelector('[href="./f1-the-movie/index.html"]')) {
  carousel.insertAdjacentHTML("beforeend", '<article class="movie-tile" data-level="intermediate" data-genre="drama sports" data-platform="apple-tv"><a href="./f1-the-movie/index.html" class="movie-poster-link"><img src="assets/f1-poster.webp" alt="F1: The Movie poster"><span class="play-overlay">&#9654;</span></a><div class="movie-meta"><h3>F1: The Movie</h3><p><span>Intermediate</span> &middot; Drama &middot; Sports &middot; Apple TV</p></div></article>');
  if (filterStatus) filterStatus.textContent = "Showing all 14 lessons.";
}
if (carousel && !carousel.querySelector('[href="./lilo-and-stitch/index.html"]')) {
  carousel.insertAdjacentHTML("beforeend", '<article class="movie-tile" data-level="elementary" data-genre="adventure comedy family" data-platform="disney-plus"><a href="./lilo-and-stitch/index.html" class="movie-poster-link"><img src="assets/lilo-and-stitch-poster.png" alt="Lilo and Stitch movie poster"><span class="play-overlay">&#9654;</span></a><div class="movie-meta"><h3>Lilo &amp; Stitch</h3><p><span>Elementary</span> &middot; Adventure &middot; Comedy &middot; Family &middot; Disney+</p></div></article>');
  if (filterStatus) filterStatus.textContent = "Showing all 15 lessons.";
}
if (carousel && !carousel.querySelector('[href="./conclave/index.html"]')) {
  carousel.insertAdjacentHTML("beforeend", '<article class="movie-tile" data-level="intermediate-plus" data-genre="drama mystery thriller" data-platform="max"><a href="./conclave/index.html" class="movie-poster-link"><img src="assets/conclave-poster.webp" alt="Conclave movie poster"><span class="play-overlay">&#9654;</span></a><div class="movie-meta"><h3>Conclave</h3><p><span>Intermediate+</span> &middot; Drama &middot; Mystery &middot; Thriller &middot; HBO Max</p></div></article>');
  if (filterStatus) filterStatus.textContent = "Showing all 16 lessons.";
}
if (carousel && !carousel.querySelector('[href="./the-wrong-paris/index.html"]')) {
  carousel.insertAdjacentHTML("beforeend", '<article class="movie-tile" data-level="pre-intermediate" data-genre="comedy romance" data-platform="netflix"><a href="./the-wrong-paris/index.html" class="movie-poster-link"><img src="assets/the-wrong-paris-poster.webp" alt="The Wrong Paris movie poster"><span class="play-overlay">&#9654;</span></a><div class="movie-meta"><h3>The Wrong Paris</h3><p><span>Pre-Intermediate</span> &middot; Comedy &middot; Romance &middot; Netflix</p></div></article>');
  if (filterStatus) filterStatus.textContent = "Showing all 17 lessons.";
}
if (carousel && !carousel.querySelector('[href="./harry-potter-philosophers-stone/index.html"]')) {
  carousel.insertAdjacentHTML("beforeend", '<article class="movie-tile" data-level="pre-intermediate" data-genre="adventure fantasy" data-platform="apple-tv max"><a href="./harry-potter-philosophers-stone/index.html" class="movie-poster-link"><img src="assets/harry-potter-1-poster.webp" alt="Harry Potter and the Philosopher\'s Stone movie poster"><span class="play-overlay">&#9654;</span></a><div class="movie-meta"><h3>Harry Potter and the Philosopher\'s Stone</h3><p><span>Pre-Intermediate</span> &middot; Adventure &middot; Fantasy &middot; Apple TV &middot; HBO Max</p></div></article>');
  if (filterStatus) filterStatus.textContent = "Showing all 18 lessons.";
}
if (carousel && !carousel.querySelector('[href="./the-batman/index.html"]')) {
  carousel.insertAdjacentHTML("beforeend", '<article class="movie-tile" data-level="intermediate-plus" data-genre="action crime" data-platform="max"><a href="./the-batman/index.html" class="movie-poster-link"><img src="assets/batman-poster.webp" alt="The Batman movie poster"><span class="play-overlay">&#9654;</span></a><div class="movie-meta"><h3>The Batman</h3><p><span>Intermediate+</span> &middot; Action &middot; Crime &middot; HBO Max</p></div></article>');
  if (filterStatus) filterStatus.textContent = "Showing all 19 lessons.";
}
if (carousel && !carousel.querySelector('[data-level-choice="frankenstein"]')) {
  carousel.insertAdjacentHTML("beforeend", '<article class="movie-tile" data-level="elementary intermediate-plus" data-genre="drama horror" data-platform="netflix"><a href="./frankenstein-easier/index.html" class="movie-poster-link" data-level-choice="frankenstein"><img src="assets/frankenstein-poster.webp" alt="Frankenstein movie poster"><span class="level-choice-tag">Two levels</span><span class="play-overlay">&#9654;</span></a><div class="movie-meta"><h3>Frankenstein</h3><p><span>Elementary / Intermediate+</span> &middot; Drama &middot; Horror &middot; Netflix</p></div></article>');
}
if (carousel && !carousel.querySelector('[href="./inside-out-2/index.html"]')) {
  carousel.insertAdjacentHTML("beforeend", '<article class="movie-tile" data-level="elementary" data-genre="animation family" data-platform="disney-plus"><a href="./inside-out-2/index.html" class="movie-poster-link"><img src="assets/inside-out-2-poster.webp" alt="Inside Out 2 movie poster"><span class="play-overlay">&#9654;</span></a><div class="movie-meta"><h3>Inside Out 2</h3><p><span>Elementary</span> &middot; Animation &middot; Family &middot; Disney+</p></div></article>');
}
if (carousel && !carousel.querySelector('[data-level-choice="superman"]')) {
  carousel.insertAdjacentHTML("beforeend", '<article class="movie-tile" data-level="beginner intermediate-plus" data-genre="action adventure" data-platform="max"><a href="./superman-beginner/index.html" class="movie-poster-link" data-level-choice="superman"><img src="assets/superman-poster.webp" alt="Superman movie poster"><span class="level-choice-tag">Two levels</span><span class="play-overlay">&#9654;</span></a><div class="movie-meta"><h3>Superman</h3><p><span>Beginner / Intermediate+</span> &middot; Action &middot; Adventure &middot; HBO Max</p></div></article>');
}
const movieLanguageLevels = {
  "./moana-2/index.html": ["elementary", "Elementary"],
  "./zootopia-2/index.html": ["elementary", "Elementary"],
  "./sheep-detectives/index.html": ["elementary", "Elementary"],
  "./kpop-demon-hunters/index.html": ["beginner", "Beginner"],
  "./forrest-gump/index.html": ["pre-intermediate", "Pre-Intermediate"],
  "./devil-wears-prada/index.html": ["pre-intermediate", "Pre-Intermediate"],
  "./eternity/index.html": ["pre-intermediate", "Pre-Intermediate"],
  "./f1-the-movie/index.html": ["pre-intermediate", "Pre-Intermediate"],
  "./materialists/index.html": ["pre-intermediate", "Pre-Intermediate"],
  "./the-housemaid/index.html": ["intermediate-plus", "Intermediate+"],
  "./alien-romulus/index.html": ["intermediate-plus", "Intermediate+"],
  "./project-hail-mary/index.html": ["intermediate-plus", "Intermediate+"],
  "./odyssey/index.html": ["intermediate-plus", "Intermediate+"],
  "./se7en/index.html": ["intermediate-plus", "Intermediate+"],
  "./lilo-and-stitch/index.html": ["elementary", "Elementary"],
  "./conclave/index.html": ["intermediate-plus", "Intermediate+"],
  "./the-wrong-paris/index.html": ["pre-intermediate", "Pre-Intermediate"],
  "./harry-potter-philosophers-stone/index.html": ["pre-intermediate", "Pre-Intermediate"],
  "./the-batman/index.html": ["intermediate-plus", "Intermediate+"],
  "./inside-out-2/index.html": ["elementary", "Elementary"]
};
Object.entries(movieLanguageLevels).forEach(([href, [value, label]]) => {
  const tile = carousel?.querySelector(`a[href="${href}"]`)?.closest(".movie-tile");
  if (!tile) return;
  tile.dataset.level = value;
  const displayedLevel = tile.querySelector(".movie-meta p span");
  if (displayedLevel) displayedLevel.textContent = label;
});
const movieGenreUpdates = {
  "./odyssey/index.html": ["adventure history", "Adventure &middot; History"],
  "./moana-2/index.html": ["animation family", "Animation &middot; Family"]
};
Object.entries(movieGenreUpdates).forEach(([href, [genres, label]]) => {
  const tile = carousel?.querySelector(`a[href="${href}"]`)?.closest(".movie-tile");
  if (!tile) return;
  tile.dataset.genre = genres;
  const meta = tile.querySelector(".movie-meta p");
  const level = meta?.querySelector("span")?.outerHTML || "";
  const platform = tile.dataset.platform === "cinemas" ? "Cinemas" : "Disney+";
  if (meta) meta.innerHTML = `${level} &middot; ${label} &middot; ${platform}`;
});
const moanaTile = carousel?.querySelector('a[href="./moana-2/index.html"]')?.closest(".movie-tile");
const f1Tile = carousel?.querySelector('a[href="./f1-the-movie/index.html"]')?.closest(".movie-tile");
const odysseyTile = carousel?.querySelector('a[href="./odyssey/index.html"]')?.closest(".movie-tile");
if (moanaTile) {
  moanaTile.dataset.level = "beginner elementary";
  const moanaLink = moanaTile.querySelector('a[href="./moana-2/index.html"]');
  if (moanaLink) {
    moanaLink.dataset.levelChoice = "moana";
    if (!moanaLink.querySelector(".level-choice-tag")) moanaLink.insertAdjacentHTML("afterbegin", '<span class="level-choice-tag">Two levels</span>');
  }
  const moanaMeta = moanaTile.querySelector(".movie-meta p");
  if (moanaMeta) moanaMeta.innerHTML = '<span>Beginner / Elementary</span> &middot; Animation &middot; Family &middot; Disney+';
}
if (f1Tile) {
  f1Tile.dataset.level = "beginner pre-intermediate";
  const f1Link = f1Tile.querySelector('a[href="./f1-the-movie/index.html"]');
  if (f1Link) {
    f1Link.dataset.levelChoice = "f1";
    if (!f1Link.querySelector(".level-choice-tag")) f1Link.insertAdjacentHTML("afterbegin", '<span class="level-choice-tag">Two levels</span>');
  }
  const f1Meta = f1Tile.querySelector(".movie-meta p");
  if (f1Meta) f1Meta.innerHTML = '<span>Beginner / Pre-Intermediate</span> &middot; Drama &middot; Sports &middot; Apple TV';
}
if (moanaTile && odysseyTile) {
  const positionMarker = document.createComment("movie-position");
  carousel.replaceChild(positionMarker, moanaTile);
  carousel.replaceChild(moanaTile, odysseyTile);
  carousel.replaceChild(odysseyTile, positionMarker);
}
const resetMainCarouselPosition = () => {
  if (carousel) carousel.scrollLeft = 0;
};
requestAnimationFrame(resetMainCarouselPosition);
setTimeout(resetMainCarouselPosition, 120);
window.addEventListener("pageshow", resetMainCarouselPosition);
if (carousel && !document.querySelector("#curated-movie-rows")) {
  const curatedRows = document.createElement("section");
  curatedRows.id = "curated-movie-rows";
  curatedRows.className = "curated-movie-rows";
  curatedRows.innerHTML = `
    <section class="curated-row debate-row"><div class="curated-row-heading"><h2>Great for debate</h2><div class="curated-row-action"><p>Big choices, difficult values, and plenty to discuss.</p><div class="curated-scroll-controls"><button class="curated-scroll-button" type="button" data-curated-scroll="debate" data-curated-direction="previous" aria-label="Scroll Great for debate movies to the left">&#8592;</button><button class="curated-scroll-button" type="button" data-curated-scroll="debate" data-curated-direction="next" aria-label="Scroll Great for debate movies to the right">&#8594;</button></div></div></div><div class="curated-poster-row" data-curated-row="debate">
      <a href="./forrest-gump/index.html" class="curated-movie-card"><img src="assets/forrest-gump-poster.webp" alt="Forrest Gump movie poster"><span>Forrest Gump</span></a>
      <a href="./odyssey/index.html" class="curated-movie-card"><img src="assets/the-odyssey-poster.webp" alt="The Odyssey movie poster"><span>The Odyssey</span></a>
      <a href="./devil-wears-prada/index.html" class="curated-movie-card"><img src="assets/devil-wears-prada-poster.webp" alt="The Devil Wears Prada movie poster"><span>The Devil Wears Prada</span></a>
      <a href="./eternity/index.html" class="curated-movie-card"><img src="assets/Eternity-poster.webp" alt="Eternity movie poster"><span>Eternity</span></a>
      <a href="./materialists/index.html" class="curated-movie-card"><img src="assets/materialists-poster.webp" alt="Materialists movie poster"><span>Materialists</span></a>
      <a href="./frankenstein-easier/index.html" class="curated-movie-card" data-level-choice="frankenstein"><img src="assets/frankenstein-poster.webp" alt="Frankenstein movie poster"><span>Frankenstein</span></a>
    </div></section>
    <section class="curated-row"><div class="curated-row-heading"><h2>Detective stories</h2><p>Follow the clues, question the suspects, and solve the case.</p></div><div class="curated-poster-row">
      <a href="./zootopia-2/index.html" class="curated-movie-card"><img src="assets/zootopia-2-logo.webp" alt="Zootopia 2 movie poster"><span>Zootopia 2</span></a>
      <a href="./sheep-detectives/index.html" class="curated-movie-card"><img src="assets/sheep-detectives-poster.png" alt="The Sheep Detectives movie poster"><span>The Sheep Detectives</span></a>
      <a href="./se7en/index.html" class="curated-movie-card" data-content-warning="violent"><img src="assets/Se7en-poster.png" alt="Se7en movie poster"><span>Se7en</span></a>
      <a href="./the-housemaid/index.html" class="curated-movie-card" data-content-warning="disturbing"><img src="assets/the-housemaid-poster.webp" alt="The Housemaid movie poster"><span>The Housemaid</span></a>
    </div></section>`;
  carousel.closest(".activity-shelf").insertAdjacentElement("afterend", curatedRows);
}

document.querySelectorAll("[data-curated-scroll]").forEach((button) => {
  button.addEventListener("click", () => {
    const row = document.querySelector(`[data-curated-row="${button.dataset.curatedScroll}"]`);
    const card = row?.querySelector(".curated-movie-card");
    if (!row || !card) return;
    const direction = button.dataset.curatedDirection === "previous" ? -1 : 1;
    row.scrollBy({ left: (card.getBoundingClientRect().width + 18) * 2 * direction, behavior: "smooth" });
  });
});

function applyMovieFilters() {
  let visibleCount = 0;
  document.querySelectorAll(".movie-tile[data-level]").forEach((tile) => {
    const matchesLevel = filterState.level === "all" || tile.dataset.level.split(" ").includes(filterState.level);
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

const warningLinks = document.querySelectorAll("[data-content-warning], a[href='./se7en/index.html'], a[href='./the-housemaid/index.html']");
if (warningLinks.length) {
  const warningDialog = document.createElement("dialog");
  warningDialog.className = "content-warning-dialog";
  warningDialog.innerHTML = `<div class="content-warning-dialog__body"><p class="eyebrow">Content note</p><h2>Alien: Romulus</h2><p>This movie includes intense and violent scenes. The lesson is recommended for adult learners.</p><div class="content-warning-dialog__actions"><button class="warning-cancel" type="button">Go back</button><a class="warning-continue" href="./alien-romulus/index.html">I understand, continue</a></div></div>`;
  document.body.appendChild(warningDialog);
  warningLinks.forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault();
    const isSe7en = link.getAttribute("href") === "./se7en/index.html";
    const isHousemaid = link.getAttribute("href") === "./the-housemaid/index.html";
    warningDialog.querySelector("h2").textContent = isHousemaid ? "The Housemaid" : isSe7en ? "Se7en" : "Alien: Romulus";
    warningDialog.querySelector("p:not(.eyebrow)").textContent = isHousemaid ? "This movie contains disturbing images and adult themes. The lesson is recommended for adult learners." : isSe7en ? "This movie includes graphic violence, disturbing crime scenes, and adult themes. The lesson is recommended for adult learners." : "This movie includes intense and violent scenes. The lesson is recommended for adult learners.";
    warningDialog.querySelector(".warning-continue").href = link.href;
    warningDialog.showModal();
  }));
  warningDialog.querySelector(".warning-cancel").addEventListener("click", () => warningDialog.close());
  warningDialog.addEventListener("click", (event) => { if (event.target === warningDialog) warningDialog.close(); });
}

const frankensteinLinks = document.querySelectorAll('[data-level-choice="frankenstein"], a[href="./frankenstein-easier/index.html"]');
if (frankensteinLinks.length) {
  const levelDialog = document.createElement("dialog");
  levelDialog.className = "content-warning-dialog level-choice-dialog";
  levelDialog.innerHTML = `<div class="content-warning-dialog__body"><p class="eyebrow">Choose your lesson</p><h2>Frankenstein</h2><p>The same movie is available at two language levels. Choose the lesson that feels right for you.</p><div class="level-choice-options"><a href="./frankenstein-easier/index.html"><small>More support</small><strong>Elementary</strong><span>Clearer wording and a fact-based bonus activity.</span></a><a href="./frankenstein-harder/index.html"><small>More challenge</small><strong>Intermediate+</strong><span>Richer language, advanced vocabulary, and an interview.</span></a></div><button class="warning-cancel" type="button">Go back</button></div>`;
  document.body.appendChild(levelDialog);
  frankensteinLinks.forEach((link) => link.addEventListener("click", (event) => { event.preventDefault(); levelDialog.showModal(); }));
  levelDialog.querySelector(".warning-cancel").addEventListener("click", () => levelDialog.close());
  levelDialog.addEventListener("click", (event) => { if (event.target === levelDialog) levelDialog.close(); });
}

const moanaLevelLinks = document.querySelectorAll('[data-level-choice="moana"], a[href="./moana-2/index.html"]');
if (moanaLevelLinks.length) {
  const moanaDialog = document.createElement("dialog");
  moanaDialog.className = "content-warning-dialog level-choice-dialog";
  moanaDialog.innerHTML = `<div class="content-warning-dialog__body"><p class="eyebrow">Choose your lesson</p><h2>Moana 2</h2><p>The same movie is available at two language levels. Choose the lesson that feels right for you.</p><div class="level-choice-options"><a href="./moana-2-beginner/index.html"><small>More support</small><strong>Beginner</strong><span>Simpler wording, familiar vocabulary, and a shorter reflection.</span></a><a href="./moana-2/index.html"><small>More challenge</small><strong>Elementary</strong><span>More detailed language, an interview, and deeper discussion.</span></a></div><button class="warning-cancel" type="button">Go back</button></div>`;
  document.body.appendChild(moanaDialog);
  moanaLevelLinks.forEach((link) => link.addEventListener("click", (event) => { event.preventDefault(); moanaDialog.showModal(); }));
  moanaDialog.querySelector(".warning-cancel").addEventListener("click", () => moanaDialog.close());
  moanaDialog.addEventListener("click", (event) => { if (event.target === moanaDialog) moanaDialog.close(); });
}

const f1LevelLinks = document.querySelectorAll('[data-level-choice="f1"], a[href="./f1-the-movie/index.html"]');
if (f1LevelLinks.length) {
  const f1Dialog = document.createElement("dialog");
  f1Dialog.className = "content-warning-dialog level-choice-dialog";
  f1Dialog.innerHTML = `<div class="content-warning-dialog__body"><p class="eyebrow">Choose your lesson</p><h2>F1: The Movie</h2><p>The same movie is available at two language levels. Choose the lesson that feels right for you.</p><div class="level-choice-options"><a href="./f1-the-movie-beginner/index.html"><small>More support</small><strong>Beginner</strong><span>Simpler wording, familiar vocabulary, and a shorter reflection.</span></a><a href="./f1-the-movie/index.html"><small>More challenge</small><strong>Pre-Intermediate</strong><span>More detailed language, British slang, and deeper discussion.</span></a></div><button class="warning-cancel" type="button">Go back</button></div>`;
  document.body.appendChild(f1Dialog);
  f1LevelLinks.forEach((link) => link.addEventListener("click", (event) => { event.preventDefault(); f1Dialog.showModal(); }));
  f1Dialog.querySelector(".warning-cancel").addEventListener("click", () => f1Dialog.close());
  f1Dialog.addEventListener("click", (event) => { if (event.target === f1Dialog) f1Dialog.close(); });
}

const supermanLevelLinks = document.querySelectorAll('[data-level-choice="superman"], a[href="./superman-beginner/index.html"]');
if (supermanLevelLinks.length) {
  const supermanDialog = document.createElement("dialog");
  supermanDialog.className = "content-warning-dialog level-choice-dialog";
  supermanDialog.innerHTML = `<div class="content-warning-dialog__body"><p class="eyebrow">Choose your lesson</p><h2>Superman</h2><p>The same movie is available at two language levels. Choose the lesson that feels right for you.</p><div class="level-choice-options"><a href="./superman-beginner/index.html"><small>More support</small><strong>Beginner</strong><span>Simpler language, present-tense practice, and a short advertisement.</span></a><a href="./superman-intermediate-plus/index.html"><small>More challenge</small><strong>Intermediate+</strong><span>Richer language, a detailed biography, and a deeper debate.</span></a></div><button class="warning-cancel" type="button">Go back</button></div>`;
  document.body.appendChild(supermanDialog);
  supermanLevelLinks.forEach((link) => link.addEventListener("click", (event) => { event.preventDefault(); supermanDialog.showModal(); }));
  supermanDialog.querySelector(".warning-cancel").addEventListener("click", () => supermanDialog.close());
  supermanDialog.addEventListener("click", (event) => { if (event.target === supermanDialog) supermanDialog.close(); });
}
