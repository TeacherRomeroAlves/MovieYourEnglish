const key = "mye-the-housemaid-v1";
const totalActivities = 32;
const verbs = ["works", "makes", "cleans", "dusts", "vacuums", "wash", "do", "iron", "prepares", "goes", "checks", "is"];
const defaults = { before: {}, routine: Array(verbs.length).fill(null), during: [], after: {}, writing: "", name: "", teacher: "", orders: {}, verbOrder: [] };
let saved = {};
try { saved = JSON.parse(localStorage.getItem(key) || "{}"); } catch { localStorage.removeItem(key); }
let state = { ...defaults, ...saved, routine: Array.isArray(saved.routine) ? saved.routine : [...defaults.routine], orders: { ...(saved.orders || {}) } };
const before = [
  ["plot", "Based on the trailer and your knowledge, which plot is correct?", ["A young woman becomes a babysitter and discovers something is wrong with the house and its pets.", "A young woman becomes a housemaid for a wealthy family, but her dream job turns suspicious and dangerous.", "A housemaid falls in love with the mother of a powerful family."], 1, "Get ready for a suspenseful experience."],
  ["housemaid", "________ is a woman whose job is to clean and take care of a house.", ["A gardener", "A babysitter", "A housemaid", "A husband"], 2, "Is it easy to be a housemaid?"],
  ["rape", "_________ is a violent act that causes deep physical and emotional harm.", ["Wrap", "Rap", "Rape", "Rake"], 2, "How should it be punished?"],
  ["china", "'China' can refer to...", ["a large country in Northern Europe.", "a large country in South America.", "fine ceramic dishes or decorative items, such as plates, cups, and bowls.", "an object used to torture people in the 18th century."], 2, "Do you have any china in your kitchen?"],
  ["ivf", "_______ can be an option for couples who have difficulty getting pregnant naturally.", ["Uterus", "Parole", "IVF", "Institutionalization"], 2, "Have you heard about this treatment before?"],
  ["attic", "We keep old boxes and old dishes in the _______.", ["artic", "Eric", "attic", "garden"], 2, "Do you have an attic at home?"]
];
const after = [
  ["situation", "What is Millie's situation before she gets the housemaid job?", ["She has no car but a great reputation.", "She has no job because her boyfriend is in jail.", "She has no home or job and was just released from jail."], 2, "Was she desperate for a job? Why did she go to jail?"],
  ["nina", "How does Nina treat Millie as a housemaid?", ["They dislike each other until Andrew makes them friends.", "Enzo makes them hate each other.", "At first she is great, but then she becomes extremely demanding."], 2, "Is it a good environment to work and live in?"],
  ["wish", "What is Nina's wish?", ["To move to another house with Andrew.", "To fire Enzo.", "To get rid of her husband."], 2, "What is the problem with him?"],
  ["secret", "What is Nina's secret?", ["She cannot afford treatment for a mental condition.", "She has a crush on Millie.", "She pretends to be happy but is terrified deep inside."], 2, "What is she afraid of?"],
  ["andrew", "What does Andrew do to Nina?", ["He and Enzo always treat her well.", "He abandons her because of her financial situation.", "He makes everyone believe she is crazy and mentally unstable."], 2, "Is he a good man? What does he do to Millie later?"],
  ["death", "How do the women get rid of Andrew?", ["He kills himself after Millie tortures him.", "Enzo kills him in the attic.", "He is pushed down the stairs."], 2, "Do you think he deserves to die?"],
  ["police", "Do the police investigate Andrew's death?", ["No, because they know he was a serial killer.", "Yes, and they arrest Nina and Millie.", "No. They accept that it was an accident."], 2, "Was it really an accident? Why do they not investigate?"]
];
const during = ["Who is Millie? Is she in a good situation?", "Where does Millie live and work?", "Who are Nina and Andrew?", "What is Nina and Andrew's relationship like?", "Who is Enzo?", "Is Enzo a good man?"];
const save = () => localStorage.setItem(key, JSON.stringify(state));
const count = (object) => Object.keys(object).length;
const writingComplete = () => state.writing.trim().length >= 50;
const progress = () => count(state.before) + state.routine.filter(Boolean).length + state.during.length + count(state.after) + (writingComplete() ? 1 : 0);
function shuffle(items) { return [...items].sort(() => Math.random() - .5); }
if (!state.verbOrder.length) { state.verbOrder = shuffle(verbs); save(); }
function order(group, id, options) { const orderKey = `${group}-${id}`; if (!state.orders[orderKey]) { state.orders[orderKey] = shuffle(options.map((_, index) => index)); save(); } return state.orders[orderKey]; }
function renderQuiz(target, items, group) {
  const host = document.querySelector(target), position = host.querySelector(".question-carousel")?.scrollLeft || 0;
  host.innerHTML = `<div class="question-carousel-shell"><div class="question-carousel-toolbar"><span>Questions</span><div><button class="question-carousel-button" data-nav="previous" type="button" aria-label="Previous question">&#8592;</button><button class="question-carousel-button" data-nav="next" type="button" aria-label="Next question">&#8594;</button></div></div><div class="question-carousel">${items.map((question, index) => { const answer = state[group][question[0]], correct = answer === question[3]; return `<div class="question-slide"><p class="slide-number">Question ${index + 1} of ${items.length}</p><article class="question-card ${correct ? "is-correct" : ""}"><p class="question-text">${question[1]}</p><div class="answer-options">${order(group, question[0], question[2]).map((item, display) => `<button class="answer-choice ${answer === item ? "selected" : ""}" data-group="${group}" data-id="${question[0]}" data-answer="${item}" type="button"><span>${String.fromCharCode(65 + display)}</span>${question[2][item]}</button>`).join("")}</div><p class="question-feedback">${answer === undefined ? "" : correct ? `Correct. ${question[4]}` : "Not quite. Try another answer."}</p></article></div>`; }).join("")}</div></div>`;
  host.querySelector(".question-carousel").scrollLeft = position;
}
function render() {
  renderQuiz("#before-questions", before, "before"); renderQuiz("#after-questions", after, "after");
  document.querySelectorAll("[data-slot]").forEach((slot) => { const value = state.routine[+slot.dataset.slot]; slot.textContent = value || "_____"; slot.classList.toggle("is-filled", Boolean(value)); });
  const used = new Set(state.routine.filter(Boolean)); document.querySelector("#verb-bank").innerHTML = state.verbOrder.filter((verb) => !used.has(verb)).map((verb) => `<button type="button" data-verb="${verb}">${verb}</button>`).join("");
  const correct = state.routine.filter((verb, index) => verb === verbs[index]).length; document.querySelector("#verb-feedback").textContent = correct === verbs.length ? "Excellent. The full routine is correct." : `${correct} / ${verbs.length} verbs in the correct gap`;
  document.querySelector("#during-checklist").innerHTML = during.map((item, index) => `<button class="watch-item ${state.during.includes(index) ? "done" : ""}" data-during="${index}" type="button"><span>${state.during.includes(index) ? "✓" : "○"}</span>${item}</button>`).join("");
  document.querySelector("#student-writing").value = state.writing; document.querySelector("#student-name").value = state.name; document.querySelector("#teacher-name").value = state.teacher; document.querySelector("#writing-feedback").textContent = writingComplete() ? "Writing task complete." : "Write at least 50 characters to complete this activity.";
  const completed = progress(); document.querySelector("#progress-label").textContent = `${completed} / ${totalActivities} complete`; document.querySelector("#progress-bar").style.width = `${completed / totalActivities * 100}%`;
}
document.addEventListener("click", (event) => {
  const choice = event.target.closest("[data-group]"); if (choice) { state[choice.dataset.group][choice.dataset.id] = +choice.dataset.answer; save(); render(); return; }
  const bankVerb = event.target.closest("[data-verb]"); if (bankVerb) { const empty = state.routine.findIndex((item) => !item); if (empty >= 0) state.routine[empty] = bankVerb.dataset.verb; save(); render(); return; }
  const slot = event.target.closest("[data-slot]"); if (slot && state.routine[+slot.dataset.slot]) { state.routine[+slot.dataset.slot] = null; save(); render(); return; }
  const watch = event.target.closest("[data-during]"); if (watch) { const item = +watch.dataset.during; state.during = state.during.includes(item) ? state.during.filter((value) => value !== item) : [...state.during, item]; save(); render(); return; }
  const nav = event.target.closest("[data-nav]"); if (nav) { const carousel = nav.closest(".question-carousel-shell").querySelector(".question-carousel"); carousel.scrollBy({ left: carousel.clientWidth * (nav.dataset.nav === "next" ? 1 : -1), behavior: "smooth" }); }
});
["student-writing", "student-name", "teacher-name"].forEach((id) => document.querySelector(`#${id}`).addEventListener("input", (event) => { state[id === "student-writing" ? "writing" : id === "student-name" ? "name" : "teacher"] = event.target.value; save(); render(); }));
document.querySelector("#reset-lesson").addEventListener("click", () => { if (confirm("Reset lesson progress?")) { state = { ...defaults, before: {}, routine: Array(verbs.length).fill(null), during: [], after: {}, orders: {}, verbOrder: shuffle(verbs) }; save(); render(); } });
render();
