const authConfig = window.MYE_SUPABASE_CONFIG || {};
const authModuleRoot = new URL(".", import.meta.url).href;
function loadSharedScript(name) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-mye-shared="${name}"]`)) { resolve(); return; }
    const script = document.createElement("script");
    script.src = new URL(name, authModuleRoot).href;
    script.dataset.myeShared = name;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
if (!document.querySelector('link[data-mye-learning-styles]')) {
  const learningStyles = document.createElement("link");
  learningStyles.rel = "stylesheet";
  learningStyles.href = new URL("my-learning.css", authModuleRoot).href;
  learningStyles.dataset.myeLearningStyles = "";
  document.head.appendChild(learningStyles);
}
function standardizeGlobalHeader() {
  document.querySelectorAll("header.saas-nav, header.site-header").forEach((header) => {
    const brandHref = header.querySelector(".brand")?.getAttribute("href") || "index.html";
    const root = brandHref.startsWith("../") ? "../" : "";
    const isLessonHeader = header.classList.contains("site-header") && !header.classList.contains("platform-header");
    if (!document.querySelector('link[data-global-nav-styles]')) {
      const navStyles = document.createElement("link");
      navStyles.rel = "stylesheet";
      navStyles.href = `${root}global-nav.css`;
      navStyles.setAttribute("data-global-nav-styles", "");
      document.head.appendChild(navStyles);
    }
    let actions = header.querySelector(".nav-actions, .header-account");
    if (!actions) {
      actions = document.createElement("div");
      actions.className = header.classList.contains("saas-nav") ? "nav-actions" : "header-account";
      header.appendChild(actions);
    }
    if (isLessonHeader) {
      header.classList.add("lesson-compact-header");
      header.querySelector("nav")?.remove();
      actions.querySelector('a[href="#lesson-report"]')?.remove();
      const lessonLinks = [...actions.querySelectorAll(".activity-label")];
      if (lessonLinks.length) {
        let lessonTools = header.nextElementSibling;
        if (!lessonTools?.classList.contains("lesson-header-tools")) {
          lessonTools = document.createElement("div");
          lessonTools.className = "lesson-header-tools";
          lessonTools.setAttribute("aria-label", "Lesson shortcuts");
          header.insertAdjacentElement("afterend", lessonTools);
        }
        lessonLinks.forEach((link) => lessonTools.appendChild(link));
      }
      let libraryLink = actions.querySelector(".lesson-library-link");
      if (!libraryLink) {
        libraryLink = document.createElement("a");
        libraryLink.className = "lesson-library-link";
        libraryLink.href = `${root}movies.html`;
        libraryLink.innerHTML = '<span aria-hidden="true">←</span> All movies';
        actions.prepend(libraryLink);
      }
    } else {
      const links = [["Our Movies", `${root}movies.html`], ["How it works", `${root}how-it-works.html`], ["Our impact", `${root}social-proof.html`], ["Instagram", "https://www.instagram.com/movieyourenglish/"]];
      let nav = header.querySelector("nav");
      if (!nav) {
        nav = document.createElement("nav");
        header.insertBefore(nav, actions);
      }
      nav.className = "global-nav";
      nav.setAttribute("aria-label", "Main navigation");
      nav.innerHTML = links.map(([label, href]) => `<a href="${href}"${href.startsWith("https://") ? ' target="_blank" rel="noreferrer"' : ""}>${label}</a>`).join("");
    }
    let authSlot = header.querySelector("[data-auth-slot]");
    if (!authSlot) {
      authSlot = document.createElement("span");
      authSlot.setAttribute("data-auth-slot", "");
    }
    actions.appendChild(authSlot);
  });
}
standardizeGlobalHeader();
const authSlots = document.querySelectorAll("[data-auth-slot]");
const configured = Boolean(authConfig.url && authConfig.anonKey);

function renderAuth(user = null) {
  authSlots.forEach((slot) => {
    if (!configured) {
      slot.innerHTML = '<span class="member-status">Member sign-in coming soon</span>';
    } else if (user) {
      const displayName = user.email ? user.email.split("@")[0] : "Member";
      const root = document.querySelector(".brand")?.getAttribute("href")?.startsWith("../") ? "../" : "";
      const greeting = slot.closest(".lesson-compact-header") ? "" : `<span class="member-status">Hi, ${displayName}</span>`;
      slot.innerHTML = `<a class="member-learning-link" href="${root}my-learning.html">My Learning</a>${greeting}<button class="member-button member-signout" type="button">Sign out</button>`;
    } else {
      slot.innerHTML = '<button class="member-button" data-open-auth type="button">Sign in</button>';
    }
  });
}

function createModal() {
  if (document.querySelector("#auth-modal")) return;
  document.body.insertAdjacentHTML("beforeend", `
    <dialog id="auth-modal" class="auth-modal" aria-labelledby="auth-title" aria-describedby="auth-description">
      <form id="auth-form" method="dialog" class="auth-form">
        <h2 id="auth-title">Save your learning</h2>
        <p id="auth-description">Keep your progress, scores, favorites, and written responses.</p>
        <label class="sr-only" for="auth-email">Email address</label>
        <input id="auth-email" type="email" required autocomplete="email" inputmode="email" placeholder="you@example.com" autofocus />
        <button class="activity-link" type="submit">Email me a login link</button>
        <p id="auth-message" class="auth-message" aria-live="polite"></p>
        <button class="auth-cancel" type="button" data-close-auth>Cancel</button>
      </form>
    </dialog>`);
}

let supabaseClient = null;
let currentUser = null;
let resolveReady;
const ready = new Promise((resolve) => { resolveReady = resolve; });

async function setupAuth() {
  if (!configured) {
    renderAuth();
    resolveReady({ client: null, user: null });
    document.dispatchEvent(new CustomEvent("mye-auth-ready", { detail: { client: null, user: null } }));
    return;
  }
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  supabaseClient = createClient(authConfig.url, authConfig.anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  const { data: { user } } = await supabaseClient.auth.getUser();
  currentUser = user;
  renderAuth(currentUser);
  resolveReady({ client: supabaseClient, user: currentUser });
  document.dispatchEvent(new CustomEvent("mye-auth-ready", { detail: { client: supabaseClient, user: currentUser } }));
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user || null;
    renderAuth(currentUser);
    document.dispatchEvent(new CustomEvent("mye-auth-changed", { detail: { client: supabaseClient, user: currentUser } }));
  });
}

document.addEventListener("click", async (event) => {
  if (event.target.closest("[data-open-auth]")) {
    createModal();
    const dialog = document.querySelector("#auth-modal");
    dialog.showModal();
    requestAnimationFrame(() => dialog.querySelector("#auth-email")?.focus());
  }
  if (event.target.closest("[data-close-auth]")) document.querySelector("#auth-modal")?.close();
  if (event.target.matches("#auth-modal")) event.target.close();
  if (event.target.closest(".member-signout") && supabaseClient) await supabaseClient.auth.signOut();
});

document.addEventListener("submit", async (event) => {
  if (event.target.id !== "auth-form") return;
  event.preventDefault();
  const email = document.querySelector("#auth-email").value.trim();
  const message = document.querySelector("#auth-message");
  message.textContent = "Sending…";
  const { error } = await supabaseClient.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } });
  message.textContent = error ? "We couldn't send the link. Please try again." : "Check your email for the login link.";
});

window.myeAuth = { ready, get client() { return supabaseClient; }, get user() { return currentUser; }, configured };
renderAuth();
setupAuth();
loadSharedScript("learning-data.js").then(() => loadSharedScript("learning.js")).catch(() => {});
