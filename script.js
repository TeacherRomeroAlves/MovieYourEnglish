const words = [
  { word: "SUN", emoji: "☀️", clue: "The star at the centre of our solar system" },
  { word: "STAR", emoji: "⭐", clue: "A bright ball of gas in space" },
  { word: "EARTH", emoji: "🌍", clue: "The planet we call home" },
  { word: "MOON", emoji: "🌙", clue: "Earth’s natural satellite" },
  { word: "COMET", emoji: "☄️", clue: "An icy object with a glowing tail" },
  { word: "ORBIT", emoji: "🪐", clue: "The path an object follows around another object" },
  { word: "SPACE", emoji: "🚀", clue: "The vast area beyond Earth’s atmosphere" },
];

const size = 12;
const placements = [
  { word: "SUN", row: 0, col: 1, dr: 0, dc: 1 },
  { word: "STAR", row: 2, col: 0, dr: 0, dc: 1 },
  { word: "EARTH", row: 4, col: 3, dr: 0, dc: 1 },
  { word: "MOON", row: 6, col: 3, dr: 0, dc: 1 },
  { word: "COMET", row: 11, col: 2, dr: 0, dc: 1 },
  { word: "ORBIT", row: 3, col: 10, dr: 1, dc: 0 },
  { word: "SPACE", row: 8, col: 0, dr: 0, dc: 1 },
];

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const grid = Array.from({ length: size }, () => Array(size).fill(""));
const wordCells = new Map();
let foundWords = new Set();

placements.forEach((placement) => {
  const cells = [];
  [...placement.word].forEach((letter, index) => {
    const row = placement.row + placement.dr * index;
    const col = placement.col + placement.dc * index;
    grid[row][col] = letter;
    cells.push(`${row}-${col}`);
  });
  wordCells.set(placement.word, cells);
});

grid.forEach((row) => row.forEach((letter, index) => {
  if (!letter) row[index] = alphabet[Math.floor(Math.random() * alphabet.length)];
}));

const gridElement = document.querySelector("#word-grid");
const listElement = document.querySelector("#word-list-items");
const countElement = document.querySelector("#found-count");
const completionElement = document.querySelector("#completion-message");

function renderList() {
  listElement.innerHTML = words.map(({ word, emoji, clue }) => {
    const isFound = foundWords.has(word);
    return `
    <li class="word-item ${isFound ? "is-found" : ""}" data-word="${word}">
      <span class="word-emoji" aria-hidden="true">${emoji}</span>
      <span><strong>${isFound ? word : "Word hidden"}</strong><small>${clue}</small></span>
      <span class="found-mark" aria-label="${isFound ? "Found" : "Not found"}">${isFound ? "✓" : ""}</span>
    </li>`;
  }).join("");
}

function renderGrid() {
  gridElement.innerHTML = grid.map((row, rowIndex) => row.map((letter, colIndex) => {
    const cell = `${rowIndex}-${colIndex}`;
    const foundPlacement = placements.find((placement) =>
      foundWords.has(placement.word) && wordCells.get(placement.word).includes(cell)
    );
    const colorIndex = foundPlacement ? placements.indexOf(foundPlacement) % 4 : -1;
    return `<button class="letter ${colorIndex >= 0 ? `found color-${colorIndex}` : ""}" type="button" data-cell="${cell}" role="gridcell" aria-label="Letter ${letter}">${letter}</button>`;
  }).join("")).join("");
}

function updateActivity() {
  renderGrid();
  renderList();
  countElement.textContent = foundWords.size;
  completionElement.textContent = foundWords.size === words.length
    ? "Mission complete! You found every space word. 🌟"
    : "";
}

gridElement.addEventListener("click", (event) => {
  const button = event.target.closest(".letter");
  if (!button) return;
  const selectedCell = button.dataset.cell;
  const match = [...wordCells.entries()].find(([word, cells]) => cells.includes(selectedCell) && !foundWords.has(word));
  if (match) {
    foundWords.add(match[0]);
    updateActivity();
  }
});

document.querySelector("#reset-button").addEventListener("click", () => {
  foundWords = new Set();
  updateActivity();
});

updateActivity();
