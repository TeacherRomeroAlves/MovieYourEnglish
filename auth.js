const authConfig = window.MYE_SUPABASE_CONFIG || {};
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
      slot.innerHTML = '<button class="member-button" data-open-auth type="button">Member sign in</button>';
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
setupAuth();
