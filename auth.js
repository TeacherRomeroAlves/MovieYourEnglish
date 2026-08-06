const authConfig = window.MYE_SUPABASE_CONFIG || {};
function standardizeGlobalHeader() {
  document.querySelectorAll("header.saas-nav, header.site-header").forEach((header) => {
    const brandHref = header.querySelector(".brand")?.getAttribute("href") || "index.html";
    const root = brandHref.startsWith("../") ? "../" : "";
    if (!document.querySelector('link[data-global-nav-styles]')) {
      const navStyles = document.createElement("link");
      navStyles.rel = "stylesheet";
      navStyles.href = `${root}global-nav.css`;
      navStyles.setAttribute("data-global-nav-styles", "");
      document.head.appendChild(navStyles);
    }
    const links = [["Our Movies", `${root}movies.html`], ["How it works", `${root}how-it-works.html`], ["Our impact", `${root}social-proof.html`], ["Instagram", "https://www.instagram.com/movieyourenglish/"]];
    let nav = header.querySelector("nav");
    if (!nav) {
      nav = document.createElement("nav");
      header.insertBefore(nav, header.querySelector(".nav-actions, .header-account") || null);
    }
    nav.className = "global-nav";
    nav.setAttribute("aria-label", "Main navigation");
    nav.innerHTML = links.map(([label, href]) => `<a href="${href}"${href.startsWith("https://") ? ' target="_blank" rel="noreferrer"' : ""}>${label}</a>`).join("");
    let actions = header.querySelector(".nav-actions, .header-account");
    if (!actions) {
      actions = document.createElement("div");
      actions.className = header.classList.contains("saas-nav") ? "nav-actions" : "header-account";
      header.appendChild(actions);
    }
    if (header.classList.contains("site-header") && !header.classList.contains("platform-header")) {
      let reportLink = actions.querySelector('a[href="#lesson-report"]');
      if (!reportLink) {
        reportLink = document.createElement("a");
        reportLink.href = "#lesson-report";
        reportLink.className = "activity-label";
        reportLink.textContent = "Your report";
        actions.prepend(reportLink);
      }
      const lessonLinks = [...actions.querySelectorAll(".activity-label")].filter((link) => link !== reportLink);
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
      slot.innerHTML = `<span class="member-status">Hi, ${displayName}</span><button class="member-button member-signout" type="button">Sign out</button>`;
    } else {
      slot.innerHTML = '<button class="member-button" data-open-auth type="button">Become a member</button>';
    }
  });
}

function createModal() {
  if (document.querySelector("#auth-modal")) return;
  document.body.insertAdjacentHTML("beforeend", `
    <dialog id="auth-modal" class="auth-modal">
      <form id="auth-form" method="dialog" class="auth-form">
        <button class="modal-close" type="button" data-close-auth aria-label="Close">×</button>
        <p class="eyebrow">Movie Your English members</p>
        <h2>Save your progress</h2>
        <p>Enter your email and we’ll send you a secure sign-in link. No password needed.</p>
        <label for="auth-email">Email address</label>
        <input id="auth-email" type="email" required autocomplete="email" placeholder="you@example.com" />
        <button class="activity-link" type="submit">Send sign-in link <span aria-hidden="true">→</span></button>
        <p id="auth-message" class="auth-message" aria-live="polite"></p>
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
    document.querySelector("#auth-modal").showModal();
  }
  if (event.target.closest("[data-close-auth]")) document.querySelector("#auth-modal")?.close();
  if (event.target.closest(".member-signout") && supabaseClient) await supabaseClient.auth.signOut();
});

document.addEventListener("submit", async (event) => {
  if (event.target.id !== "auth-form") return;
  event.preventDefault();
  const email = document.querySelector("#auth-email").value.trim();
  const message = document.querySelector("#auth-message");
  message.textContent = "Sending secure sign-in link…";
  const { error } = await supabaseClient.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } });
  message.textContent = error ? "We couldn't send the link. Please try again." : "Check your email for the sign-in link.";
});

window.myeAuth = { ready, get client() { return supabaseClient; }, get user() { return currentUser; }, configured };
renderAuth();
setupAuth();
