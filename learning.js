(function () {
  if (window.__myeLearningReady) return;
  window.__myeLearningReady = true;
  const catalog = window.MYE_LEARNING_CATALOG;
  if (!catalog) return;
  let client = null;
  let user = null;
  let favorites = new Set();
  let syncTimer = 0;
  const pathParts = location.pathname.split("/").filter(Boolean);
  const currentSlug = pathParts.at(-1)?.endsWith(".html") ? pathParts.at(-2) : pathParts.at(-1);
  const currentLesson = catalog.lesson(currentSlug);

  const showNotice = (message) => {
    let notice = document.querySelector(".learning-toast");
    if (!notice) {
      notice = document.createElement("p");
      notice.className = "learning-toast";
      notice.setAttribute("aria-live", "polite");
      document.body.appendChild(notice);
    }
    notice.textContent = message;
    notice.classList.add("is-visible");
    clearTimeout(showNotice.timer);
    showNotice.timer = setTimeout(() => notice.classList.remove("is-visible"), 2800);
  };

  const movieFromLink = (link) => {
    const slug = catalog.slugFromHref(link.getAttribute("href") || "");
    return catalog.lesson(slug) || catalog.movie(slug);
  };

  function favoriteButton(movie, variant = "card") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `favorite-button favorite-button--${variant}`;
    button.dataset.favoriteMovie = movie.movieSlug;
    button.setAttribute("aria-label", `Save ${movie.title} to favorites`);
    button.innerHTML = `<span aria-hidden="true">♡</span>${variant === "lesson" ? "<b>Save movie</b>" : ""}`;
    return button;
  }

  function installFavoriteButtons() {
    document.querySelectorAll(".movie-tile").forEach((tile) => {
      if (tile.querySelector("[data-favorite-movie]")) return;
      const movie = movieFromLink(tile.querySelector("a[href]"));
      if (movie) tile.appendChild(favoriteButton(movie));
    });
    const hero = document.querySelector(".lesson-hero");
    if (hero && currentLesson && !hero.querySelector("[data-favorite-movie]")) hero.appendChild(favoriteButton(currentLesson, "lesson"));
    paintFavorites();
  }

  function paintFavorites() {
    document.querySelectorAll("[data-favorite-movie]").forEach((button) => {
      const active = favorites.has(button.dataset.favoriteMovie);
      button.classList.toggle("is-favorite", active);
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute("aria-label", `${active ? "Remove" : "Save"} ${catalog.movie(button.dataset.favoriteMovie)?.title || "movie"} ${active ? "from" : "to"} favorites`);
      button.querySelector("span").textContent = active ? "♥" : "♡";
      const label = button.querySelector("b");
      if (label) label.textContent = active ? "Saved" : "Save movie";
    });
  }

  async function loadFavorites() {
    if (!client || !user) { favorites = new Set(); paintFavorites(); return; }
    const { data, error } = await client.from("lesson_progress").select("lesson_slug").eq("user_id", user.id).like("lesson_slug", "favorite:%");
    if (!error) favorites = new Set((data || []).map((row) => row.lesson_slug.slice(9)));
    paintFavorites();
  }

  async function toggleFavorite(movieSlug) {
    if (!user || !client) {
      document.querySelector("[data-open-auth]")?.click();
      showNotice("Sign in to save favorite movies.");
      return;
    }
    const wasFavorite = favorites.has(movieSlug);
    if (wasFavorite) favorites.delete(movieSlug); else favorites.add(movieSlug);
    paintFavorites();
    const key = `favorite:${movieSlug}`;
    const operation = wasFavorite
      ? client.from("lesson_progress").delete().eq("user_id", user.id).eq("lesson_slug", key)
      : client.from("lesson_progress").upsert({ user_id: user.id, lesson_slug: key, state: { kind: "favorite", movie_slug: movieSlug }, completed: 0, total: 0 }, { onConflict: "user_id,lesson_slug" });
    const { error } = await operation;
    if (error) {
      if (wasFavorite) favorites.add(movieSlug); else favorites.delete(movieSlug);
      paintFavorites();
      showNotice("We could not update this favorite. Please try again.");
    } else {
      showNotice(wasFavorite ? "Removed from favorites." : "Saved to My Learning.");
      document.dispatchEvent(new CustomEvent("mye-favorites-changed", { detail: { movieSlug, favorite: !wasFavorite } }));
    }
  }

  function progressNumbers() {
    const label = document.querySelector("#progress-label, .progress-panel strong")?.textContent || "";
    const match = label.match(/(\d+)\s*\/\s*(\d+)/);
    return match ? { completed: Number(match[1]), total: Number(match[2]) } : null;
  }

  function localLessonState() {
    if (!currentLesson?.storageKey) return {};
    try { return JSON.parse(localStorage.getItem(currentLesson.storageKey) || "{}"); } catch { return {}; }
  }

  async function restoreRemoteProgress() {
    if (!currentLesson || !user || !client) return false;
    const { data } = await client.from("lesson_progress").select("state,completed,total").eq("user_id", user.id).eq("lesson_slug", currentLesson.slug).maybeSingle();
    const local = progressNumbers();
    const reloadKey = `mye-restored:${user.id}:${currentLesson.slug}`;
    if (!data?.state || !Object.keys(data.state).length || !data.completed || data.completed <= (local?.completed || 0) || sessionStorage.getItem(reloadKey)) return false;
    localStorage.setItem(currentLesson.storageKey, JSON.stringify(data.state));
    sessionStorage.setItem(reloadKey, "true");
    location.reload();
    return true;
  }

  function scheduleProgressSync() {
    if (!currentLesson || !user || !client) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(async () => {
      const progress = progressNumbers();
      if (!progress?.total) return;
      const { error } = await client.from("lesson_progress").upsert({
        user_id: user.id,
        lesson_slug: currentLesson.slug,
        state: localLessonState(),
        completed: progress.completed,
        total: progress.total
      }, { onConflict: "user_id,lesson_slug" });
      const status = document.querySelector("#account-save-status");
      if (status) status.textContent = error ? "We could not sync your latest progress." : "Progress saved to your account.";
      document.dispatchEvent(new CustomEvent("mye-learning-updated", { detail: progress }));
    }, 850);
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-favorite-movie]");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(button.dataset.favoriteMovie);
  }, true);

  const onAuth = async ({ detail }) => {
    client = detail.client;
    user = detail.user;
    installFavoriteButtons();
    await loadFavorites();
    if (await restoreRemoteProgress()) return;
    scheduleProgressSync();
  };
  document.addEventListener("mye-auth-ready", onAuth);
  document.addEventListener("mye-auth-changed", onAuth);
  window.myeAuth?.ready?.then((detail) => onAuth({ detail }));
  installFavoriteButtons();
  setTimeout(installFavoriteButtons, 700);
  setInterval(installFavoriteButtons, 1600);
  if (currentLesson) {
    const progressNode = document.querySelector("#progress-label, .progress-panel strong");
    if (progressNode) new MutationObserver(scheduleProgressSync).observe(progressNode, { childList: true, characterData: true, subtree: true });
    document.addEventListener("click", scheduleProgressSync);
    document.addEventListener("input", scheduleProgressSync);
  }
})();
