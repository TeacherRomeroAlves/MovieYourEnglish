const sheepPairs = [
  { term: "FLOCK", definition: "A group of sheep", emoji: "🐑" },
  { term: "WOOL", definition: "The soft hair that grows on a sheep", emoji: "🧶" },
  { term: "RAM", definition: "An adult male sheep", emoji: "🐏" },
  { term: "LAMB", definition: "A young sheep", emoji: "🐑" },
  { term: "EWE", definition: "An adult female sheep", emoji: "🌼" },
  { term: "PASTURE", definition: "A field where farm animals eat grass", emoji: "🌿" },
  { term: "HAY", definition: "Dried grass used as food for animals", emoji: "🌾" }
];

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
const sheepStorageKey = "mye-sheep-detectives-v1";
const savedSheepState = JSON.parse(localStorage.getItem(sheepStorageKey) || "{}");
let selectedTerm = null;
let matchedTerms = new Set(savedSheepState.matchedTerms || []);
let displayedTerms = shuffle(sheepPairs);
let displayedDefinitions = shuffle(sheepPairs);
let feedbackMessage = "";
let authClient = null;
let authUser = null;
let remoteSyncTimer = null;

const termElement = document.querySelector("#terms");
const definitionElement = document.querySelector("#definitions");
const countElement = document.querySelector("#match-count");
const messageElement = document.querySelector("#matching-message");

function saveSheepProgress() {
  localStorage.setItem(sheepStorageKey, JSON.stringify({ matchedTerms: [...matchedTerms] }));
  if (authClient && authUser) {
    clearTimeout(remoteSyncTimer);
    remoteSyncTimer = setTimeout(syncRemoteProgress, 500);
  }
}

async function syncRemoteProgress() {
  if (!authClient || !authUser) return;
  await authClient.from("lesson_progress").upsert({
    user_id: authUser.id,
    lesson_slug: "sheep-detectives",
    state: { matchedTerms: [...matchedTerms] },
    completed: matchedTerms.size,
    total: sheepPairs.length
  }, { onConflict: "user_id,lesson_slug" });
}

async function loadRemoteProgress() {
  if (!authClient || !authUser) return;
  const { data } = await authClient.from("lesson_progress").select("state").eq("user_id", authUser.id).eq("lesson_slug", "sheep-detectives").maybeSingle();
  if (data?.state?.matchedTerms) {
    matchedTerms = new Set(data.state.matchedTerms);
    saveSheepProgress();
    render();
  } else {
    syncRemoteProgress();
  }
}

function render() {
  termElement.innerHTML = displayedTerms.map(({ term, emoji }) => `
    <button class="match-button term-button ${selectedTerm === term ? "selected" : ""} ${matchedTerms.has(term) ? "matched" : ""}" type="button" data-term="${term}" ${matchedTerms.has(term) ? "disabled" : ""}>
      <span aria-hidden="true">${emoji}</span>${term}<span class="match-check">${matchedTerms.has(term) ? "✓" : ""}</span>
    </button>`).join("");
  definitionElement.innerHTML = displayedDefinitions.map(({ term, definition }) => `
    <button class="match-button definition-button ${matchedTerms.has(term) ? "matched" : ""}" type="button" data-definition="${term}" ${matchedTerms.has(term) ? "disabled" : ""}>
      ${definition}<span class="match-check">${matchedTerms.has(term) ? "✓" : ""}</span>
    </button>`).join("");
  countElement.textContent = matchedTerms.size;
  messageElement.textContent = matchedTerms.size === sheepPairs.length ? "Case closed! You matched every clue. 🎉" : feedbackMessage;
  const accountStatus = document.querySelector("#sheep-account-status");
  if (authUser) accountStatus.textContent = `Signed in as ${authUser.email}. Your progress is saved.`;
  else if (window.myeAuth?.configured) accountStatus.textContent = "Sign in to save your activity progress.";
  else accountStatus.textContent = "Member progress saving will be available soon.";
}

termElement.addEventListener("click", (event) => {
  const button = event.target.closest(".term-button");
  if (!button || button.disabled) return;
  selectedTerm = button.dataset.term;
  render();
});

definitionElement.addEventListener("click", (event) => {
  const button = event.target.closest(".definition-button");
  if (!button || button.disabled || !selectedTerm) return;
  if (button.dataset.definition === selectedTerm) {
    matchedTerms.add(selectedTerm);
    selectedTerm = null;
    feedbackMessage = "";
    saveSheepProgress();
  } else {
    selectedTerm = null;
    feedbackMessage = "Not quite — choose another definition.";
    setTimeout(() => { if (matchedTerms.size !== sheepPairs.length) { feedbackMessage = ""; render(); } }, 1500);
  }
  render();
});

document.querySelector("#reset-matching").addEventListener("click", () => {
  selectedTerm = null;
  matchedTerms = new Set();
  displayedTerms = shuffle(sheepPairs);
  displayedDefinitions = shuffle(sheepPairs);
  feedbackMessage = "";
  saveSheepProgress();
  render();
});

document.addEventListener("mye-auth-ready", (event) => {
  authClient = event.detail.client;
  authUser = event.detail.user;
  render();
  loadRemoteProgress();
});
document.addEventListener("mye-auth-changed", (event) => {
  authClient = event.detail.client;
  authUser = event.detail.user;
  render();
  if (authUser) loadRemoteProgress();
});

render();
