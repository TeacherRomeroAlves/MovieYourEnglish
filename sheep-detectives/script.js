const sheepPairs = [
  { term: "FLOCK", definition: "A group of sheep", emoji: "🐑" },
  { term: "WOOL", definition: "The soft hair that grows on a sheep", emoji: "🧶" },
  { term: "RAM", definition: "An adult male sheep", emoji: "🐏" },
  { term: "LAMB", definition: "A young sheep", emoji: "🐑" },
  { term: "EWE", definition: "An adult female sheep", emoji: "🌼" },
  { term: "PASTURE", definition: "A field where farm animals eat grass", emoji: "🌿" },
  { term: "HAY", definition: "Dried grass used as food for animals", emoji: "🌾" },
];

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
let selectedTerm = null;
let matchedTerms = new Set();
let displayedTerms = shuffle(sheepPairs);
let displayedDefinitions = shuffle(sheepPairs);
let feedbackMessage = "";

const termElement = document.querySelector("#terms");
const definitionElement = document.querySelector("#definitions");
const countElement = document.querySelector("#match-count");
const messageElement = document.querySelector("#matching-message");

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
  } else {
    selectedTerm = null;
    feedbackMessage = "Not quite — choose another definition.";
    setTimeout(() => {
      if (matchedTerms.size !== sheepPairs.length) {
        feedbackMessage = "";
        render();
      }
    }, 1500);
  }
  render();
});

document.querySelector("#reset-matching").addEventListener("click", () => {
  selectedTerm = null;
  matchedTerms = new Set();
  displayedTerms = shuffle(sheepPairs);
  displayedDefinitions = shuffle(sheepPairs);
  feedbackMessage = "";
  render();
});

render();
