const storageKey = "mye-project-hail-mary-lesson-v1";
const defaultState = { plot: "", vocab: {}, foundWords: [], during: [], comprehension: {}, rocky: {}, writing: "", name: "", teacherName: "", orders: {} };
let lesson = { ...defaultState, ...JSON.parse(localStorage.getItem(storageKey) || "{}") };

const plotQuestion = {
  id: "plot", points: 10, question: "Based on the trailer, which plot is correct?",
  answers: [
    "Two astronauts go to space and help a lost alien.",
    "A teacher goes to space to fight dangerous aliens.",
    "A teacher goes to space to stop a threat to the Sun."
  ], correct: 2, followUp: "Why do you think the mission is called a ‘Hail Mary’?"
};

const vocab = [
  { id: "hail-mary", q: "_____ is a last, desperate attempt to succeed when there is almost no chance of success.", options: ["Holy Mary", "Hail Mary", "Our Mary"], correct: 1, note: "The Hail Mary is also a well-known Catholic prayer." },
  { id: "astronaut", q: "Jack isn't a teacher; he is an _____. He spent six months on the International Space Station!", options: ["soldier", "astronaut", "YouTuber"], correct: 1, note: "Would you prefer to be a teacher or an astronaut?" },
  { id: "spaceship", q: "The _____ landed safely on the planet.", options: ["spacebus", "shipspace", "spaceship"], correct: 2, note: "Is it simple to build a spaceship?" },
  { id: "rocky", q: "We walked along a _____ beach. It was rough!", options: ["rock", "rocker", "rocky"], correct: 2, note: "What places can be described as rocky?" },
  { id: "microorganism", q: "A(n) _____ is a very small living thing that can only be seen with a microscope, such as bacteria.", options: ["Solar System", "Alien", "Microorganism"], correct: 2, note: "Are microorganisms always helpful?" },
  { id: "communication", q: "Good _____ is important in every project.", options: ["hugs", "translation", "communication"], correct: 2, note: "Are you a good communicator?" },
  { id: "amazed", q: "The magician _____ the audience with his tricks.", options: ["amaze", "amazing", "amazed"], correct: 2, note: "Tell someone something you consider amazing." }
];

const duringQuestions = [
  "Who is Mr. Grace? What does he do for a living?",
  "What is Astrophage? Is it something good?",
  "Who is Rocky?",
  "What is their mission in space?",
  "Does everything go according to plan?",
  "What does the title ‘Project Hail Mary’ suggest about the mission?"
];

const comprehension = [
  { id: "grace", q: "Who is Ryland Grace?", options: ["A Russian engineer", "An experienced astronaut", "A middle-school teacher"], correct: 2, note: "What does he teach? Do you think he is a good teacher?" },
  { id: "stratt", q: "Who is Eva Stratt?", options: ["The person who discovered the problem in space", "The astronaut who goes to space with Grace", "The agent who recruited Mr. Grace"], correct: 2, note: "Why was he recruited?" },
  { id: "danger", q: "Why is Earth in danger?", options: ["The Sun is getting closer to Earth", "Astrophage is invading Earth", "The Sun is cooling down"], correct: 2, note: "What is causing it?" },
  { id: "rocky", q: "What/who is Rocky?", options: ["An enemy alien spaceship", "A solid chemical element", "A sympathetic rock-like alien"], correct: 2, note: "Do you like Rocky? Why or why not?" },
  { id: "taumoeba", q: "What is Taumoeba?", options: ["Another name for the Petrova Line", "A planet", "A bacteria"], correct: 2, note: "How can it save the universe? Was it easy to get it?" },
  { id: "return", q: "Why doesn't Grace come back to Earth?", options: ["To destroy all Astrophage in the universe", "To save our planet", "To rescue his friend"], correct: 2, note: "Would you do the same?" }
];

const rockyItems = [
  { id: "amaze", original: "Amaze!", answer: "Amazing!" },
  { id: "understand", original: "No understand word.", answer: "I don't understand that word." },
  { id: "enough", original: "Is not enough.", answer: "It is not enough." },
  { id: "messy", original: "Why room so messy, question?", answer: "Why is this room so messy?" },
  { id: "time", original: "It is time go!", answer: "It is time to go!" }
];

const spaceWords = [
  { word: "SUN", emoji: "☀️", clue: "The star at the centre of our solar system" },
  { word: "STAR", emoji: "⭐", clue: "A bright ball of gas in space" },
  { word: "EARTH", emoji: "🌍", clue: "The planet we call home" },
  { word: "MOON", emoji: "🌙", clue: "Earth's natural satellite" },
  { word: "COMET", emoji: "☄️", clue: "An icy object with a glowing tail" },
  { word: "ORBIT", emoji: "🪐", clue: "The path an object follows around another object" },
  { word: "SPACE", emoji: "🚀", clue: "The vast area beyond Earth's atmosphere" }
];
const placements = [
  { word: "SUN", row: 0, col: 1, dr: 0, dc: 1 }, { word: "STAR", row: 2, col: 0, dr: 0, dc: 1 },
  { word: "EARTH", row: 4, col: 3, dr: 0, dc: 1 }, { word: "MOON", row: 6, col: 3, dr: 0, dc: 1 },
  { word: "COMET", row: 11, col: 2, dr: 0, dc: 1 }, { word: "ORBIT", row: 3, col: 10, dr: 1, dc: 0 },
  { word: "SPACE", row: 8, col: 0, dr: 0, dc: 1 }
];

const grid = Array.from({ length: 12 }, () => Array(12).fill(""));
const wordCells = new Map();
placements.forEach((placement) => {
  const cells = [];
  [...placement.word].forEach((letter, index) => {
    const row = placement.row + placement.dr * index; const col = placement.col + placement.dc * index;
    grid[row][col] = letter; cells.push(`${row}-${col}`);
  });
  wordCells.set(placement.word, cells);
});
grid.forEach((row) => row.forEach((letter, index) => { if (!letter) row[index] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; }));

function save() { localStorage.setItem(storageKey, JSON.stringify(lesson)); }
function correctCount(items, answers) { return items.filter((item) => Number(answers[item.id]) === item.correct).length; }
function normalise(value) { return value.toLowerCase().replace(/[^a-z]/g, ""); }
function rockyCount() { return rockyItems.filter((item) => normalise(lesson.rocky[item.id] || "") === normalise(item.answer)).length; }
function writingComplete() { return lesson.writing.trim().length >= 50; }
function getProgress() {
  const plot = Number(lesson.plot) === plotQuestion.correct ? 1 : 0;
  const vocabCount = correctCount(vocab, lesson.vocab); const wordCount = lesson.foundWords.length;
  const duringCount = lesson.during.length; const comprehensionCount = correctCount(comprehension, lesson.comprehension);
  const rocky = rockyCount(); const writing = writingComplete() ? 1 : 0;
  return { completed: plot + vocabCount + wordCount + duringCount + comprehensionCount + rocky + writing, total: 33 };
}

function getChoiceOrder(question, type) {
  const key = `${type}-${question.id}`;
  if (!lesson.orders[key]) {
    lesson.orders[key] = (question.options || question.answers).map((_, index) => index).sort(() => Math.random() - 0.5);
    save();
  }
  return lesson.orders[key];
}

function renderQuestion(question, selected, type) {
  const hasAnswer = selected !== "" && selected !== undefined;
  const correct = hasAnswer && Number(selected) === question.correct;
  const feedback = selected === "" || selected === undefined ? "" : correct ? `Correct! ${question.note || question.followUp || ""}` : "Not quite. Try another answer.";
  const choices = question.options || question.answers;
  return `<article class="question-card ${correct ? "is-correct" : ""}"><p class="question-text">${question.q || question.question}</p><div class="answer-options">${getChoiceOrder(question, type).map((answerIndex, displayIndex) => `<button class="answer-choice ${hasAnswer && Number(selected) === answerIndex ? "selected" : ""}" data-type="${type}" data-id="${question.id}" data-answer="${answerIndex}" type="button"><span>${String.fromCharCode(65 + displayIndex)}</span>${choices[answerIndex]}</button>`).join("")}</div><p class="question-feedback" aria-live="polite">${feedback}</p></article>`;
}

function renderQuestions() {
  const beforeItems = [{ question: plotQuestion, selected: lesson.plot, type: "plot" }, ...vocab.map((question) => ({ question, selected: lesson.vocab[question.id], type: "vocab" }))];
  renderQuestionCarousel(document.querySelector("#before-questions"), beforeItems, "Before watching questions");
  const afterItems = comprehension.map((question) => ({ question, selected: lesson.comprehension[question.id], type: "comprehension" }));
  renderQuestionCarousel(document.querySelector("#comprehension-questions"), afterItems, "After watching questions");
}

function renderQuestionCarousel(container, items, label) {
  container.innerHTML = `<div class="question-carousel-shell"><div class="question-carousel-toolbar"><span>${label}</span><div><button class="question-carousel-button" data-question-carousel="previous" type="button" aria-label="Previous question">←</button><button class="question-carousel-button" data-question-carousel="next" type="button" aria-label="Next question">→</button></div></div><div class="question-carousel">${items.map((item, index) => `<div class="question-slide"><p class="slide-number">Question ${index + 1} of ${items.length}</p>${renderQuestion(item.question, item.selected, item.type)}</div>`).join("")}</div></div>`;
}

function renderWordSearch() {
  const found = new Set(lesson.foundWords);
  document.querySelector("#word-grid").innerHTML = grid.map((row, rowIndex) => row.map((letter, colIndex) => {
    const cell = `${rowIndex}-${colIndex}`;
    const placement = placements.find((item) => found.has(item.word) && wordCells.get(item.word).includes(cell));
    const color = placement ? placements.indexOf(placement) % 4 : -1;
    return `<button class="letter ${color >= 0 ? `found color-${color}` : ""}" data-cell="${cell}" type="button" role="gridcell" aria-label="Letter ${letter}">${letter}</button>`;
  }).join("")).join("");
  document.querySelector("#word-list-items").innerHTML = spaceWords.map(({ word, emoji, clue }) => {
    const isFound = found.has(word);
    return `<li class="word-item ${isFound ? "is-found" : ""}"><span class="word-emoji">${emoji}</span><span><strong>${isFound ? word : "Word hidden"}</strong><small>${clue}</small></span><span class="found-mark">${isFound ? "✓" : ""}</span></li>`;
  }).join("");
}

function renderDuring() {
  const selected = new Set(lesson.during);
  document.querySelector("#during-checklist").innerHTML = duringQuestions.map((question, index) => `<button class="watch-item ${selected.has(index) ? "done" : ""}" type="button" data-during="${index}"><span>${selected.has(index) ? "✓" : "○"}</span>${question}</button>`).join("");
}

function renderRocky() {
  document.querySelector("#rocky-corrections").innerHTML = rockyItems.map((item, index) => {
    const done = normalise(lesson.rocky[item.id] || "") === normalise(item.answer);
    return `<article class="correction-card ${done ? "is-correct" : ""}"><p><span class="correction-number">${index + 1}</span> Rocky says: <q>${item.original}</q></p><div><button class="check-rocky" data-reveal-rocky="${item.id}" type="button">${done ? "Correction revealed" : "Reveal correction"}</button></div><small>${done ? `Correction: ${item.answer}` : ""}</small></article>`;
  }).join("");
}

function renderProgress() {
  const progress = getProgress();
  document.querySelector("#progress-label").textContent = `${progress.completed} / ${progress.total} complete`;
  document.querySelector("#progress-bar").style.width = `${(progress.completed / progress.total) * 100}%`;
  document.querySelector("#student-writing").value = lesson.writing;
  document.querySelector("#student-name").value = lesson.name;
  document.querySelector("#teacher-name").value = lesson.teacherName || "";
  document.querySelector("#writing-feedback").textContent = writingComplete() ? "Writing task complete! +10 points" : `${Math.max(0, 50 - lesson.writing.trim().length)} more characters needed to complete this task.`;
}

function renderAll() {
  const carouselPositions = [...document.querySelectorAll(".question-carousel")].map((carousel) => carousel.scrollLeft);
  renderQuestions(); renderWordSearch(); renderDuring(); renderRocky(); renderProgress();
  [...document.querySelectorAll(".question-carousel")].forEach((carousel, index) => { carousel.scrollLeft = carouselPositions[index] || 0; });
}

document.addEventListener("click", (event) => {
  const answer = event.target.closest(".answer-choice");
  if (answer) {
    const { type, id, answer: chosen } = answer.dataset;
    if (type === "plot") lesson.plot = chosen;
    else lesson[type][id] = chosen;
    save(); renderAll(); return;
  }
  const letter = event.target.closest(".letter");
  if (letter) {
    const match = placements.find((item) => wordCells.get(item.word).includes(letter.dataset.cell) && !lesson.foundWords.includes(item.word));
    if (match) { lesson.foundWords.push(match.word); save(); renderAll(); } return;
  }
  const during = event.target.closest("[data-during]");
  if (during) {
    const index = Number(during.dataset.during); lesson.during = lesson.during.includes(index) ? lesson.during.filter((item) => item !== index) : [...lesson.during, index];
    save(); renderAll(); return;
  }
  const rockyButton = event.target.closest("[data-reveal-rocky]");
  if (rockyButton) { const item = rockyItems.find((entry) => entry.id === rockyButton.dataset.revealRocky); lesson.rocky[item.id] = item.answer; save(); renderAll(); }
  const carouselButton = event.target.closest("[data-question-carousel]");
  if (carouselButton) {
    const carousel = carouselButton.closest(".question-carousel-shell").querySelector(".question-carousel");
    carousel.scrollBy({ left: carousel.clientWidth * (carouselButton.dataset.questionCarousel === "next" ? 1 : -1), behavior: "smooth" });
  }
});

document.addEventListener("input", (event) => {
  if (event.target.id === "student-writing") { lesson.writing = event.target.value; save(); renderProgress(); }
  if (event.target.id === "student-name") { lesson.name = event.target.value; save(); }
  if (event.target.id === "teacher-name") { lesson.teacherName = event.target.value; save(); }
});

document.querySelector("#reset-lesson").addEventListener("click", () => { if (confirm("Reset all saved answers and points for this lesson?")) { lesson = { ...defaultState }; save(); renderAll(); } });

function escapeHtml(value) { return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character])); }
document.querySelector("#save-report").addEventListener("click", () => {
  const progress = getProgress(); const popup = window.open("", "_blank");
  if (!popup) return;
  const before = (Number(lesson.plot) === plotQuestion.correct ? 1 : 0) + correctCount(vocab, lesson.vocab) + lesson.foundWords.length;
  const during = lesson.during.length;
  const after = correctCount(comprehension, lesson.comprehension) + rockyCount() + (writingComplete() ? 1 : 0);
  const logoUrl = new URL("../assets/mye-logo.png", window.location.href).href;
  const sectionCard = (emoji, title, count, total, description) => `<article class="section-card"><div class="card-heading"><span>${emoji}</span><div><h3>${title}</h3><p>${description}</p></div></div><div class="bar"><span style="width:${(count / total) * 100}%"></span></div><strong>${count} / ${total} complete</strong></article>`;
  popup.document.write(`<!doctype html><html><head><title>Project Hail Mary lesson report</title><style>@page{size:auto;margin:14mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;max-width:780px;margin:0 auto;color:#0a0a0a}.report-header{display:flex;align-items:center;gap:18px;border-bottom:5px solid #0a0a0a;padding:0 0 18px}.report-header img{width:64px;height:64px;object-fit:cover;border:2px solid #16b9b4}.eyebrow{margin:0 0 5px;color:#087f7b;font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase}h1{margin:0;font-size:29px;line-height:1}h2{margin:28px 0 12px;font-size:19px}.student{margin:8px 0 0;color:#555}.summary{display:flex;align-items:center;justify-content:space-between;gap:18px;margin:25px 0;padding:17px 19px;border:3px solid #0a0a0a;background:#d9ff00}.summary strong{font-size:25px}.summary p{margin:0;font-size:12px;font-weight:bold}.section-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.section-card{border:2px solid #0a0a0a;padding:13px}.card-heading{display:flex;gap:9px;align-items:flex-start}.card-heading span{font-size:23px}.section-card h3{margin:0;font-size:14px}.section-card p{margin:3px 0 10px;color:#555;font-size:11px;line-height:1.35}.bar{height:10px;border:1.5px solid #0a0a0a;background:#eee}.bar span{display:block;height:100%;background:#16b9b4}.section-card strong{display:block;margin-top:8px;font-size:12px}.writing{margin-top:28px;padding:20px;border:3px solid #0a0a0a;background:#f0fffd}.writing h2{margin-top:0}.writing blockquote{min-height:72px;margin:14px 0 0;padding:12px 15px;border-left:5px solid #16b9b4;background:#fff;white-space:pre-wrap;line-height:1.5}.footer{margin-top:28px;padding-top:12px;border-top:2px solid #0a0a0a;color:#555;font-size:11px}@media print{body{max-width:none}.report-header img{print-color-adjust:exact}.summary,.bar span{print-color-adjust:exact}}</style></head><body><header class="report-header"><img src="${logoUrl}" alt="Movie Your English logo"><div><p class="eyebrow">Movie Your English · Lesson report</p><h1>Project Hail Mary</h1><p class="student">Student: ${escapeHtml(lesson.name || "Not provided")}</p></div></header><section class="summary"><div><p>MISSION PROGRESS</p><strong>${progress.completed} / ${progress.total} complete</strong></div><span style="font-size:32px">🚀</span></section><h2>Activity overview</h2><div class="section-grid">${sectionCard("🎬", "Before watching", before, 15, "Trailer, plot, vocabulary & word search")}${sectionCard("👀", "During the movie", during, 6, "Spoiler-free viewing guide")}${sectionCard("🧠", "After watching", after, 12, "Check, correct & reflect")}</div><section class="writing"><p class="eyebrow">Writing response</p><h2>Do you believe in aliens?</h2><blockquote>${escapeHtml(lesson.writing || "No response submitted.")}</blockquote></section><footer class="footer">Generated by Movie Your English · Save this report as a PDF and share it with your teacher.</footer><script>window.print();<\/script></body></html>`);
  popup.document.close();
});

renderAll();
