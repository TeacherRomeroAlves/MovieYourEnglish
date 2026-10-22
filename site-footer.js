(() => {
  const currentScript = document.currentScript;
  const root = new URL("./", currentScript?.src || location.href);
  const href = (path) => new URL(path, root).href;
  const header = document.querySelector(".saas-nav");
  const navigation = header?.querySelector(".global-nav");
  if (navigation && !header.querySelector(".mobile-nav-toggle")) {
    navigation.id ||= "public-navigation";
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "mobile-nav-toggle";
    toggle.textContent = "Menu";
    toggle.setAttribute("aria-controls", navigation.id);
    toggle.setAttribute("aria-expanded", "false");
    header.querySelector(".nav-actions")?.prepend(toggle);
    const closeMenu = () => { header.classList.remove("navigation-open"); toggle.setAttribute("aria-expanded", "false"); };
    toggle.addEventListener("click", () => {
      const open = header.classList.toggle("navigation-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    navigation.addEventListener("click", (event) => { if (event.target.closest("a")) closeMenu(); });
    header.addEventListener("keydown", (event) => { if (event.key === "Escape" && header.classList.contains("navigation-open")) { closeMenu(); toggle.focus(); } });
    document.addEventListener("click", (event) => { if (!header.contains(event.target)) closeMenu(); });
  }
  // Official Vercel Web Analytics integration for this static site.
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  if (!document.querySelector("script[data-vercel-analytics]")) {
    const analytics = document.createElement("script");
    analytics.defer = true;
    analytics.dataset.vercelAnalytics = "true";
    analytics.src = "/_vercel/insights/script.js";
    document.head.appendChild(analytics);
  }
  const footer = document.querySelector("footer.saas-footer, footer.site-footer");
  if (!footer) return;
  footer.className = "mye-footer";
  footer.innerHTML = `
    <div class="mye-footer-main">
      <div class="mye-footer-brand">
        <a class="brand" href="${href("index.html")}" aria-label="Movie Your English homepage"><img class="brand-logo" src="${href("assets/mye-logo.png")}" alt=""><span>movie <strong>your</strong> english</span></a>
        <p>Interactive English lessons built around the movies you love.</p>
        <span>Part of the Your English learning experience.</span>
      </div>
      <nav class="mye-footer-nav" aria-label="Footer navigation">
        <a href="${href("index.html")}">Home</a>
        <a href="${href("movies.html")}">Our Movies</a>
        <a href="${href("how-it-works.html")}">How it works</a>
        <a href="${href("social-proof.html")}">Our impact</a>
        <a href="https://www.instagram.com/movieyourenglish/" target="_blank" rel="noreferrer">Instagram <span aria-hidden="true">↗</span></a>
        <a href="https://musicyourenglish.com/" target="_blank" rel="noreferrer">Music Your English <span aria-hidden="true">↗</span></a>
      </nav>
    </div>
    <div class="mye-footer-bottom">
      <span>© ${new Date().getFullYear()} Movie Your English.</span>
      <span>Created by <a href="https://www.instagram.com/teacherromeroalves/" target="_blank" rel="noreferrer">Teacher Romero Alves</a> and <a href="https://www.instagram.com/teacherlaisqueiroz/" target="_blank" rel="noreferrer">Teacher Lais Queiroz</a></span>
      <span>Practice English. Have fun. Enjoy the movie.</span>
    </div>`;
})();
