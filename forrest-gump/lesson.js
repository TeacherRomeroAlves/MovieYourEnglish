const key = "mye-forrest-gump-v1";
const totalActivities = 23;
const defaults = { before: {}, brands: {}, during: [], after: {}, writing: "", name: "", teacher: "", orders: {} };
let saved = {};
try { saved = JSON.parse(localStorage.getItem(key) || "{}"); } catch { localStorage.removeItem(key); }
let state = { ...defaults, ...saved, orders: { ...(saved.orders || {}) } };

const before = [
  ["plot", "Based on the trailer and your knowledge, which plot is correct?", ["This is the life story of a man from Alabama who becomes a fisherman to explore the world with his wife, Jacqueline.", "This is the life story of a man from New York who becomes a soldier to defend his family's house from bullies.", "This is the life story of a man from Alabama who is not very smart and wants to be reunited with his childhood sweetheart."], 2, "Get ready for a fantastic historical experience!"],
  ["iq", "Having a high ________ does not guarantee success in life.", ["IK", "QI", "IQ", "IDK"], 2, "Do you agree with the sentence?"],
  ["run", "He had to ________ to catch the school bus.", ["runs", "running", "run", "ran"], 2, "Do you like running?"],
  ["shrimp", "________ is a small sea animal with many legs, often eaten as seafood.", ["Feather", "Bully", "Shrimp", "Brace"], 2, "Do you like shrimp?"],
  ["war", "Many ________ were sent to fight in the ________ during the 1960s.", ["football players – college", "hippies – Woodstock", "soldiers – Vietnam War", "fishermen – bayou"], 2, "Is it easy to be a soldier in a war?"],
  ["pingpong", "We played ________ in China for three years.", ["pong ping", "tennis table", "ping pong", "rackets"], 2, "Can you play ping pong?"],
  ["sweetheart", "Your ________ is a person you loved when you were very young.", ["abusive dad", "childhood mama", "childhood sweetheart", "house guest"], 2, "Did you have one?"]
];
const after = [
  ["forrest", "Who is Forrest Gump?", ["A regular man who founded an IT company.", "A super-smart table tennis player.", "An innocent man with a low IQ."], 2, "How is he different from others?"],
  ["jenny", "Who is Jenny?", ["She is Forrest's mother.", "She is Forrest's second wife.", "She is Forrest's first friend."], 2, "Is she important in Forrest's life story?"],
  ["football", "Why was football important in Forrest's life?", ["Because his mother could not pay for school.", "Because he could run away from bullies.", "Because it gave him a college scholarship."], 2, "What was his special skill?"],
  ["bubba", "Who is Bubba?", ["Jenny's hippie boyfriend.", "A lieutenant whom Forrest saved in Vietnam.", "A specialist in shrimping."], 2, "Did he influence Forrest's life? How?"],
  ["rich", "How does Forrest get rich?", ["Running.", "Playing tennis.", "Shrimping."], 2, "What happened? Who helped him?"],
  ["running", "Why did Forrest run for over three years?", ["To say goodbye to his mother.", "Because Jenny ordered him to.", "Because he wanted to."], 2, "How did people react?"],
  ["ending", "What is the surprise at the end of the movie?", ["Lieutenant Dan has real legs again.", "Forrest's mother does not die.", "Forrest and Jenny have a son."], 2, "What happened to Jenny?"]
];
const during = ["Who is Forrest Gump? Is he normal? Why or why not? Do people like him?", "Who are Jenny, Bubba, and Dan? How are they connected to Forrest?", "What are Forrest's occupations? Is he good at them? Is he successful?", "How does the movie end?"];
const brands = [
  { id: "nike", answer: "nike", scrambled: "EKIN", emoji: "👟", clue: "A sportswear company famous for its swoosh" },
  { id: "apple", answer: "apple", scrambled: "PLEAP", emoji: "💻", clue: "A technology company Forrest invests in" },
  { id: "pepper", answer: "dr pepper", scrambled: "RDP EEPPR", emoji: "🥤", clue: "A soft drink mentioned in a White House scene" },
  { id: "bubba", answer: "bubba gump", scrambled: "BABUB PMUG", emoji: "🍤", clue: "The shrimp company inspired by Forrest's friend" }
];
const save = () => localStorage.setItem(key, JSON.stringify(state));
const count = (object) => Object.keys(object).length;
const writingComplete = () => state.writing.trim().length >= 50;
const progress = () => count(state.before) + count(state.brands) + state.during.length + count(state.after) + (writingComplete() ? 1 : 0);
function order(group, id, options) { const orderKey = `${group}-${id}`; if (!state.orders[orderKey]) { state.orders[orderKey] = options.map((_, index) => index).sort(() => Math.random() - .5); save(); } return state.orders[orderKey]; }
function renderQuiz(target, items, group) {
  const carousel = document.querySelector(target);
  const position = carousel.querySelector(".question-carousel")?.scrollLeft || 0;
  carousel.innerHTML = `<div class="question-carousel-shell"><div class="question-carousel-toolbar"><span>Questions</span><div><button class="question-carousel-button" data-nav="previous" type="button" aria-label="Previous question">←</button><button class="question-carousel-button" data-nav="next" type="button" aria-label="Next question">→</button></div></div><div class="question-carousel">${items.map((question, index) => { const answer = state[group][question[0]], correct = answer === question[3]; return `<div class="question-slide"><p class="slide-number">Question ${index + 1} of ${items.length}</p><article class="question-card ${correct ? "is-correct" : ""}"><p class="question-text">${question[1]}</p><div class="answer-options">${order(group, question[0], question[2]).map((item, display) => `<button class="answer-choice ${answer === item ? "selected" : ""}" data-group="${group}" data-id="${question[0]}" data-answer="${item}" type="button"><span>${String.fromCharCode(65 + display)}</span>${question[2][item]}</button>`).join("")}</div><p class="question-feedback">${answer === undefined ? "" : correct ? `Correct. ${question[4]}` : "Not quite. Try another answer."}</p></article></div>`; }).join("")}</div></div>`;
  carousel.querySelector(".question-carousel").scrollLeft = position;
}
function normalise(value) { return value.toLowerCase().replace(/[^a-z]/g, ""); }
function render() {
  renderQuiz("#before-questions", before, "before"); renderQuiz("#after-questions", after, "after");
  document.querySelector("#brand-puzzle").innerHTML = brands.map((brand) => { const solved = state.brands[brand.id] === brand.answer; return `<article class="animal-card ${solved ? "is-solved" : ""}"><span class="animal-emoji">${brand.emoji}</span><div><p class="scrambled-word">${brand.scrambled}</p><label>${brand.clue}<input data-brand-input="${brand.id}" value="${solved ? brand.answer : ""}" ${solved ? "disabled" : ""}></label></div><button class="check-animal" data-check-brand="${brand.id}" type="button" ${solved ? "disabled" : ""}>${solved ? "Solved" : "Check"}</button></article>`; }).join("");
  document.querySelector("#brand-feedback").textContent = count(state.brands) === brands.length ? "Excellent. You discovered every brand." : `${count(state.brands)} / ${brands.length} brands solved`;
  document.querySelector("#during-checklist").innerHTML = during.map((item, index) => `<button class="watch-item ${state.during.includes(index) ? "done" : ""}" data-during="${index}" type="button"><span>${state.during.includes(index) ? "✓" : "○"}</span>${item}</button>`).join("");
  document.querySelector("#student-writing").value = state.writing; document.querySelector("#student-name").value = state.name; document.querySelector("#teacher-name").value = state.teacher;
  document.querySelector("#writing-feedback").textContent = writingComplete() ? "Writing task complete." : "Write at least 50 characters to complete this activity.";
  const completed = progress(); document.querySelector("#progress-label").textContent = `${completed} / ${totalActivities} complete`; document.querySelector("#progress-bar").style.width = `${completed / totalActivities * 100}%`;
}
document.addEventListener("click", (event) => {
  const choice = event.target.closest("[data-group]"); if (choice) { state[choice.dataset.group][choice.dataset.id] = +choice.dataset.answer; save(); render(); return; }
  const check = event.target.closest("[data-check-brand]"); if (check) { const brand = brands.find((item) => item.id === check.dataset.checkBrand), input = document.querySelector(`[data-brand-input="${brand.id}"]`); if (normalise(input.value) === normalise(brand.answer)) { state.brands[brand.id] = brand.answer; save(); render(); } else { input.classList.add("is-wrong"); setTimeout(() => input.classList.remove("is-wrong"), 450); } return; }
  const watch = event.target.closest("[data-during]"); if (watch) { const item = +watch.dataset.during; state.during = state.during.includes(item) ? state.during.filter((value) => value !== item) : [...state.during, item]; save(); render(); return; }
  const nav = event.target.closest("[data-nav]"); if (nav) { const carousel = nav.closest(".question-carousel-shell").querySelector(".question-carousel"); carousel.scrollBy({ left: carousel.clientWidth * (nav.dataset.nav === "next" ? 1 : -1), behavior: "smooth" }); }
});
["student-writing", "student-name", "teacher-name"].forEach((id) => document.querySelector(`#${id}`).addEventListener("input", (event) => { state[id === "student-writing" ? "writing" : id === "student-name" ? "name" : "teacher"] = event.target.value; save(); render(); }));
document.querySelector("#reset-lesson").addEventListener("click", () => { if (confirm("Reset lesson progress?")) { state = { ...defaults, before: {}, brands: {}, during: [], after: {}, orders: {} }; save(); render(); } });
render();
