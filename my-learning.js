(function () {
  const host = document.querySelector("#learning-content");
  const catalog = () => window.MYE_LEARNING_CATALOG;
  let client = null;
  let user = null;

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  const formatDate = (value) => new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));

  function signedOut() {
    host.innerHTML = `<section class="learning-signin"><p class="eyebrow">Your learning space</p><h1>Keep your movie lessons in one place.</h1><p>Sign in to save favorite movies, follow lesson progress, and continue learning across your devices.</p><button class="activity-link" data-open-auth type="button">Sign in <span aria-hidden="true">→</span></button></section>`;
  }

  function lessonCard(row) {
    const lesson = catalog().lesson(row.lesson_slug);
    if (!lesson) return "";
    const percent = row.total ? Math.min(100, Math.round(row.completed / row.total * 100)) : 0;
    const complete = percent === 100;
    return `<article class="learning-history-card"><img src="${lesson.poster}" alt="${escapeHtml(lesson.title)} movie poster" width="84" height="126"><div class="learning-history-main"><div class="learning-card-heading"><div><p>${escapeHtml(lesson.level)}</p><h3>${escapeHtml(lesson.title)}</h3></div><span class="learning-status ${complete ? "is-complete" : ""}">${complete ? "Completed" : "In progress"}</span></div><div class="learning-progress" role="progressbar" aria-label="${percent}% of ${escapeHtml(lesson.title)} lesson completed" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"><span style="width:${percent}%"></span></div><div class="learning-progress-copy"><strong>${row.completed} / ${row.total} activities</strong><span>${percent}% complete</span><span>Updated ${formatDate(row.updated_at)}</span></div><a class="learning-continue" href="${lesson.href}">${complete ? "Review lesson" : "Continue lesson"} <span aria-hidden="true">→</span></a></div></article>`;
  }

  function favoriteCard(movieSlug) {
    const movie = catalog().movie(movieSlug);
    if (!movie) return "";
    return `<article class="learning-favorite-card"><a href="${movie.href}"><img src="${movie.poster}" alt="${escapeHtml(movie.title)} movie poster"><span><strong>${escapeHtml(movie.title)}</strong><small>Open lesson</small></span></a><button type="button" data-favorite-movie="${movie.movieSlug}" aria-label="Remove ${escapeHtml(movie.title)} from favorites" aria-pressed="true"><span aria-hidden="true">♥</span></button></article>`;
  }

  async function renderDashboard() {
    if (!client || !user) { signedOut(); return; }
    if (!catalog()) { window.setTimeout(renderDashboard, 50); return; }
    host.innerHTML = `<section class="learning-loading"><p>Loading your movies…</p></section>`;
    const { data, error } = await client.from("lesson_progress").select("lesson_slug,completed,total,updated_at,state").eq("user_id", user.id).order("updated_at", { ascending: false });
    if (error) {
      host.innerHTML = `<section class="learning-signin"><p class="eyebrow">My Learning</p><h1>We couldn’t load your progress.</h1><p>Please refresh the page or try signing in again.</p></section>`;
      return;
    }
    const rows = data || [];
    const favoriteSlugs = rows.filter((row) => row.lesson_slug.startsWith("favorite:")).map((row) => row.lesson_slug.slice(9));
    const history = rows.filter((row) => !row.lesson_slug.startsWith("favorite:") && row.completed > 0 && row.total > 0 && catalog().lesson(row.lesson_slug));
    const completed = history.filter((row) => row.completed >= row.total).length;
    const inProgress = history.filter((row) => row.completed > 0 && row.completed < row.total).length;
    const activities = history.reduce((sum, row) => sum + row.completed, 0);
    host.innerHTML = `<section class="learning-hero"><div><p class="eyebrow">My Learning</p><h1>Your movies. <span>Your English progress.</span></h1><p>Return to lessons, revisit completed activities, and keep the movies you want to explore close at hand.</p></div><div class="learning-stats" aria-label="Learning summary"><article><strong>${completed}</strong><span>Lessons completed</span></article><article><strong>${inProgress}</strong><span>Lessons in progress</span></article><article><strong>${favoriteSlugs.length}</strong><span>Favorite movies</span></article><article><strong>${activities}</strong><span>Activities completed</span></article></div></section><section class="learning-section" aria-labelledby="favorites-title"><div class="learning-section-heading"><div><p class="eyebrow">Saved movies</p><h2 id="favorites-title">Your favorites</h2></div><a href="movies.html">Explore movies <span aria-hidden="true">→</span></a></div>${favoriteSlugs.length ? `<div class="learning-favorites">${favoriteSlugs.map(favoriteCard).join("")}</div>` : `<div class="learning-empty"><p>No favorites yet.</p><span>Select the heart on any movie poster to save it here.</span><a href="movies.html">Find a movie</a></div>`}</section><section class="learning-section" aria-labelledby="history-title"><div class="learning-section-heading"><div><p class="eyebrow">Recent activity</p><h2 id="history-title">Lesson history</h2></div></div>${history.length ? `<div class="learning-history">${history.map(lessonCard).join("")}</div>` : `<div class="learning-empty"><p>Your lesson history is waiting.</p><span>Answer an activity and your progress will appear here automatically.</span><a href="movies.html">Start a lesson</a></div>`}</section>`;
  }

  const onAuth = (event) => { client = event.detail.client; user = event.detail.user; renderDashboard(); };
  document.addEventListener("mye-auth-ready", onAuth);
  document.addEventListener("mye-auth-changed", onAuth);
  document.addEventListener("mye-favorites-changed", () => setTimeout(renderDashboard, 250));
})();
