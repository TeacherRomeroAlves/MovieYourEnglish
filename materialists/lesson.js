const key = "mye-materialists-v1";
const totalActivities = 27;
const defaults = { before: {}, words: [], during: [], after: {}, writing: "", name: "", teacher: "", orders: {} };
let saved = {};
try { saved = JSON.parse(localStorage.getItem(key) || "{}"); } catch { localStorage.removeItem(key); }
let state = { ...defaults, ...saved, orders: { ...(saved.orders || {}) } };

const before = [
  ["plot", "Based on the trailer and your knowledge, which plot is correct?", ["A young New York City waitress breaks up with her boyfriend and decides to marry a millionaire matchmaker.", "A young woman hires a matchmaker and must choose between two rich men.", "A young New York City matchmaker has to choose between a millionaire and a waiter."], 2, "Get ready for an interesting and different love story!"],
  ["materialist", "_________ is a person who cares a lot about money and possessions.", ["Attractive", "Minimalist", "Materialist", "Charismatic"], 2, "Are you a materialist?"],
  ["matchmaker", "A matchmaker is a person who...", ["helps people plan romantic trips.", "helps people get divorced.", "helps people start a romantic relationship by introducing them to each other.", "plans wedding parties for family and friends."], 2, "Is it an interesting job?"],
  ["soulmate", "Some people spend their whole lives searching for their _______.", ["waiter", "roommate", "soulmate", "maid of honor"], 2, "Do you believe in soulmates?"],
  ["unicorn", "Finding an easy job that pays well is like finding a ________.", ["recruit", "dowry", "unicorn", "horse"], 2, "What is very rare to find nowadays?"],
  ["assaulting", "He was arrested for ______ his wife.", ["assailant", "assault", "assaulting", "assaulted"], 2, "How should this crime be punished?"]
];
const after = [
  ["successful", "Is Lucy successful at her job?", ["Yes, she is a creative wedding planner.", "Not really; her clients never get married.", "Yes, she is one of the best matchmakers in NYC."], 2, "Why do you think she is good at it?"],
  ["clients", "What are most of Lucy's clients like?", ["They never have too many requests.", "They are always calm and gentle.", "They are normally demanding and desperate."], 2, "Why are they like this?"],
  ["weddings", "How does Lucy view weddings?", ["As something weird in NYC.", "As a great act of love.", "As a business deal."], 2, "Why? Does she think about getting married?"],
  ["harry", "Who is Harry?", ["Lucy's boss.", "A waiter.", "A 'unicorn.'"], 2, "Why does Lucy define him as a unicorn?"],
  ["john", "Who is John?", ["Lucy's roommate.", "The owner of a penthouse.", "Lucy's ex-boyfriend."], 2, "Why did they break up?"],
  ["breakup", "Why does Lucy break up with Harry?", ["John finally becomes a successful actor.", "Harry's brother does not invite her to his wedding.", "John is the one she really loves."], 2, "In your opinion, is this the correct decision?"],
  ["sophie", "Who is Sophie and what happens to her?", ["She is Lucy's best friend and assaults her partner.", "She is Lucy's client and Harry assaults her.", "She is Lucy's client and is assaulted by a man Lucy matches her with."], 2, "Is Lucy responsible somehow? How does this story end?"]
];
const during = ["Who is Lucy? Is she married?", "What is Lucy's job? Is she successful at it?", "What are most of her clients like?", "Who are Harry and John? Are they similar in any way?", "Who are Sophie and Mark?", "What is Sophie and Mark's relationship with Lucy?"];
const words = [
  ["SINGLE", "💛", "Not married or in a romantic relationship"], ["MARRIED", "💍", "Legally joined to a spouse"],
  ["DIVORCED", "📄", "No longer legally married"], ["WIDOWED", "🕊️", "Whose spouse has died"],
  ["DATING", "💕", "Seeing someone romantically"], ["ENGAGED", "💎", "Promised to be married"],
  ["SEPARATED", "↔️", "Living apart but still legally married"]
];
const placements = [[0,2],[2,2],[4,2],[6,2],[8,2],[10,2],[1,0]];
const grid = Array.from({ length: 12 }, () => Array(12).fill(""));
const cells = {};
words.forEach(([word], index) => { const [row, column] = placements[index], path = []; [...word].forEach((letter, offset) => { const r = index === 6 ? row + offset : row, c = index === 6 ? column : column + offset; grid[r][c] = letter; path.push(`${r}-${c}`); }); cells[word] = path; });
const filler = "LOVEHEARTSOULMATCHDATEPARTNERROMANCE";
let fillerIndex = 0;
grid.forEach((row) => row.forEach((letter, index) => { if (!letter) row[index] = filler[fillerIndex++ % filler.length]; }));

const save = () => localStorage.setItem(key, JSON.stringify(state));
const count = (object) => Object.keys(object).length;
const writingComplete = () => state.writing.trim().length >= 50;
const progress = () => count(state.before) + state.words.length + state.during.length + count(state.after) + (writingComplete() ? 1 : 0);
function order(group, id, options) { const orderKey = `${group}-${id}`; if (!state.orders[orderKey]) { state.orders[orderKey] = options.map((_, index) => index).sort(() => Math.random() - .5); save(); } return state.orders[orderKey]; }
function renderQuiz(target, items, group) {
  const host = document.querySelector(target), position = host.querySelector(".question-carousel")?.scrollLeft || 0;
  host.innerHTML = `<div class="question-carousel-shell"><div class="question-carousel-toolbar"><span>Questions</span><div><button class="question-carousel-button" data-nav="previous" type="button" aria-label="Previous question">&#8592;</button><button class="question-carousel-button" data-nav="next" type="button" aria-label="Next question">&#8594;</button></div></div><div class="question-carousel">${items.map((question, index) => { const answer = state[group][question[0]], correct = answer === question[3]; return `<div class="question-slide"><p class="slide-number">Question ${index + 1} of ${items.length}</p><article class="question-card ${correct ? "is-correct" : ""}"><p class="question-text">${question[1]}</p><div class="answer-options">${order(group, question[0], question[2]).map((item, display) => `<button class="answer-choice ${answer === item ? "selected" : ""}" data-group="${group}" data-id="${question[0]}" data-answer="${item}" type="button"><span>${String.fromCharCode(65 + display)}</span>${question[2][item]}</button>`).join("")}</div><p class="question-feedback">${answer === undefined ? "" : correct ? `Correct. ${question[4]}` : "Not quite. Try another answer."}</p></article></div>`; }).join("")}</div></div>`;
  host.querySelector(".question-carousel").scrollLeft = position;
}
function render() {
  renderQuiz("#before-questions", before, "before"); renderQuiz("#after-questions", after, "after");
  const found = new Set(state.words);
  document.querySelector("#word-grid").innerHTML = grid.map((row, r) => row.map((letter, c) => { const wordIndex = words.findIndex(([word]) => found.has(word) && cells[word].includes(`${r}-${c}`)); return `<button class="letter ${wordIndex >= 0 ? `found color-${wordIndex % 4}` : ""}" data-cell="${r}-${c}" type="button" aria-label="Letter ${letter}">${letter}</button>`; }).join("")).join("");
  document.querySelector("#word-list-items").innerHTML = words.map(([word, emoji, definition]) => `<li class="word-item ${found.has(word) ? "is-found" : ""}"><span class="word-emoji">${emoji}</span><span><strong>${word}</strong><small>${definition}</small></span><span>${found.has(word) ? "✓" : ""}</span></li>`).join("");
  document.querySelector("#during-checklist").innerHTML = during.map((item, index) => `<button class="watch-item ${state.during.includes(index) ? "done" : ""}" data-during="${index}" type="button"><span>${state.during.includes(index) ? "✓" : "○"}</span>${item}</button>`).join("");
  document.querySelector("#student-writing").value = state.writing; document.querySelector("#student-name").value = state.name; document.querySelector("#teacher-name").value = state.teacher;
  document.querySelector("#writing-feedback").textContent = writingComplete() ? "Writing task complete." : "Write at least 50 characters to complete this activity.";
  const completed = progress(); document.querySelector("#progress-label").textContent = `${completed} / ${totalActivities} complete`; document.querySelector("#progress-bar").style.width = `${completed / totalActivities * 100}%`;
}
document.addEventListener("click", (event) => {
  const choice = event.target.closest("[data-group]"); if (choice) { state[choice.dataset.group][choice.dataset.id] = +choice.dataset.answer; save(); render(); return; }
  const letter = event.target.closest("[data-cell]"); if (letter) { const match = words.find(([word]) => cells[word].includes(letter.dataset.cell) && !state.words.includes(word)); if (match) state.words.push(match[0]); save(); render(); return; }
  const watch = event.target.closest("[data-during]"); if (watch) { const item = +watch.dataset.during; state.during = state.during.includes(item) ? state.during.filter((value) => value !== item) : [...state.during, item]; save(); render(); return; }
  const nav = event.target.closest("[data-nav]"); if (nav) { const carousel = nav.closest(".question-carousel-shell").querySelector(".question-carousel"); carousel.scrollBy({ left: carousel.clientWidth * (nav.dataset.nav === "next" ? 1 : -1), behavior: "smooth" }); }
});
["student-writing", "student-name", "teacher-name"].forEach((id) => document.querySelector(`#${id}`).addEventListener("input", (event) => { state[id === "student-writing" ? "writing" : id === "student-name" ? "name" : "teacher"] = event.target.value; save(); render(); }));
document.querySelector("#reset-lesson").addEventListener("click", () => { if (confirm("Reset lesson progress?")) { state = { ...defaults, before: {}, words: [], during: [], after: {}, orders: {} }; save(); render(); } });
render();
