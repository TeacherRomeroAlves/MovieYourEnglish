const key = "mye-kpop-demon-hunters-v1";
const defaults = { before: {}, during: [], after: {}, writing: "", name: "", teacher: "", orders: {} };
let state = { ...defaults, ...JSON.parse(localStorage.getItem(key) || "{}") };

const before = [
  ["plot", "Based on the trailer and your knowledge, which plot is correct?", ["A famous K-pop girl group will fight a K-pop boy band to decide which band has the best song in Japan.", "A famous K-pop boy band has to protect the world from demons. Now they have to fight against a powerful demon girl.", "A famous K-pop girl group is also a group of demon hunters. Now they have to protect their fans from a demon K-pop boy band."], 2, "Get ready for an Oscar-winning experience!"],
  ["kpop", "_______ is pop music from South Korea.", ["Metal", "J-pop", "K-pop", "Shakira"], 2, "Do you like K-pop?"],
  ["hunters", "The _______ used their guns to protect the people from wolves.", ["managers", "singers", "hunters", "weapons"], 2, "What do the girls hunt in the movie?"],
  ["fans", "Huntrix has _______ all over the world.", ["minions", "souls", "fans", "underworld"], 2, "Are you a fan of any band?"],
  ["boyband", "One Direction was a famous ________.", ["barrier", "band boy", "boy band", "song"], 2, "Do you know any other boy band?"],
  ["demons", "In this horror movie, the city is attacked by ________.", ["rappers", "pop stars", "demons", "the moon"], 2, "Are demons real?"],
  ["song", "The fans love Taylor Swift's new _______.", ["sang", "sing", "song", "sung"], 2, "Do you have a favorite song?"]
];
const after = [
  ["huntrix", "What is Huntrix?", ["It's a fan club.", "It's a boy band.", "It's a girl group."], 2, "Who are the members? Are they a normal group?"],
  ["rumi", "How is Rumi different from Mira and Zoey?", ["She comes from the underworld.", "She has a human boyfriend.", "She has some marks on her skin."], 2, "What are these marks?"],
  ["gwima", "What does Gwi-Ma want?", ["Great music", "Human bodies", "Human souls"], 2, "Is it easy for him to get souls?"],
  ["jinu", "Who is Ji-Nu?", ["Huntrix's agent.", "Rumi's husband.", "The leader of the Saja Boys."], 2, "Was he a good person or demon?"],
  ["honmoon", "What is the Golden Honmoon?", ["A Huntrix song to protect people.", "A ritual to kill all demons in the underworld.", "A shield to protect the world from demons forever."], 2, "How do you create it?"],
  ["battle", "What happens in the final battle?", ["Huntrix sing together with the Saja Boys to save the planet.", "Rumi becomes a demon forever.", "Ji-Nu saves Rumi, and they destroy Gwi-Ma."], 2, "Did you like it?"]
];
const during = ["Who are Rumi, Mira, and Zoey? What is their job? Are they good at it? Are they similar to each other?", "Who are Gwi-Ma and Ji-Nu? What do they want?", "Who are the Saja Boys? Are they friends of Huntrix?", "What is the Honmoon?"];
const save = () => localStorage.setItem(key, JSON.stringify(state));
const count = (items) => Object.keys(items).length;
const writingComplete = () => state.writing.trim().length >= 50;
const progress = () => count(state.before) + state.during.length + count(state.after) + (writingComplete() ? 1 : 0);
function optionOrder(group, id, options) { const orderKey = `${group}-${id}`; if (!state.orders[orderKey]) state.orders[orderKey] = options.map((_, index) => index).sort(() => Math.random() - 0.5); return state.orders[orderKey]; }
function renderQuiz(target, items, group) {
  document.querySelector(target).innerHTML = `<div class="question-carousel-shell"><div class="question-carousel-toolbar"><span>Questions</span><div><button class="question-carousel-button" type="button" data-nav="previous" aria-label="Previous question">&#8592;</button><button class="question-carousel-button" type="button" data-nav="next" aria-label="Next question">&#8594;</button></div></div><div class="question-carousel">${items.map((question, index) => { const answer = state[group][question[0]], correct = answer === question[3], feedback = answer === undefined ? "" : correct ? `Correct. ${question[4]}` : "Not quite. Try another answer."; return `<div class="question-slide"><p class="slide-number">Question ${index + 1} of ${items.length}</p><article class="question-card ${correct ? "is-correct" : ""}"><p class="question-text">${question[1]}</p><div class="answer-options">${optionOrder(group, question[0], question[2]).map((item, displayIndex) => `<button class="answer-choice ${answer === item ? "selected" : ""}" type="button" data-group="${group}" data-id="${question[0]}" data-answer="${item}"><span>${String.fromCharCode(65 + displayIndex)}</span>${question[2][item]}</button>`).join("")}</div><p class="question-feedback">${feedback}</p></article></div>`; }).join("")}</div></div>`;
}
function render() {
  renderQuiz("#before-questions", before, "before"); renderQuiz("#after-questions", after, "after");
  document.querySelector("#during-checklist").innerHTML = during.map((item, index) => `<button class="watch-item ${state.during.includes(index) ? "done" : ""}" type="button" data-during="${index}"><span>${state.during.includes(index) ? "✓" : "○"}</span>${item}</button>`).join("");
  document.querySelector("#student-writing").value = state.writing; document.querySelector("#student-name").value = state.name; document.querySelector("#teacher-name").value = state.teacher;
  document.querySelector("#writing-feedback").textContent = writingComplete() ? "Writing task complete." : "Write at least 50 characters to complete this activity.";
  const completed = progress(); document.querySelector("#progress-label").textContent = `${completed} / 19 complete`; document.querySelector("#progress-bar").style.width = `${completed / 19 * 100}%`;
}
document.addEventListener("click", (event) => {
  const choice = event.target.closest("[data-group]");
  if (choice) { const carousel = choice.closest(".question-carousel"), position = Math.round(carousel.scrollLeft / carousel.clientWidth), group = choice.dataset.group; state[group][choice.dataset.id] = +choice.dataset.answer; save(); render(); const refreshed = document.querySelector(group === "before" ? "#before-questions .question-carousel" : "#after-questions .question-carousel"); if (refreshed) refreshed.scrollLeft = position * refreshed.clientWidth; return; }
  const watch = event.target.closest("[data-during]");
  if (watch) { const item = +watch.dataset.during; state.during = state.during.includes(item) ? state.during.filter((value) => value !== item) : [...state.during, item]; save(); render(); return; }
  const nav = event.target.closest("[data-nav]");
  if (nav) { const carousel = nav.closest(".question-carousel-shell").querySelector(".question-carousel"); carousel.scrollBy({ left: carousel.clientWidth * (nav.dataset.nav === "next" ? 1 : -1), behavior: "smooth" }); }
});
["student-writing", "student-name", "teacher-name"].forEach((id) => document.querySelector(`#${id}`).addEventListener("input", (event) => { state[id === "student-writing" ? "writing" : id === "student-name" ? "name" : "teacher"] = event.target.value; save(); render(); }));
document.querySelector("#reset-lesson").addEventListener("click", () => { if (confirm("Reset lesson progress?")) { state = { ...defaults }; save(); render(); } });
document.querySelector("#save-report").addEventListener("click", () => window.print());
render();
