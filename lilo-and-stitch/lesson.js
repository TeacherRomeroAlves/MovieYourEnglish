const key = "mye-lilo-and-stitch-v1", totalActivities = 31;
const defaults = { before: {}, adjectives: {}, during: [], after: {}, scene: {}, writing: "", name: "", teacher: "", orders: {} };
let saved = {}; try { saved = JSON.parse(localStorage.getItem(key) || "{}"); } catch { localStorage.removeItem(key); } let state = { ...defaults, ...saved, orders: { ...(saved.orders || {}) } };
const before = [
  ["plot", "Based on the trailer and your knowledge, which plot is correct?", ["An alien is adopted by a single mother and a little boy who must find his alien mother.", "An alien escapes to Earth and is adopted by a big family that treats him as a dog.", "An alien escapes to Earth and is adopted by a small family that teaches him about life."], 2, "Get ready for an extraterrestrial experience!"],
  ["aliens", "Some people believe _______ have visited Earth.", ["dogs", "humans", "aliens", "pets"], 2, "Do you believe in aliens?"],
  ["family", "She has a big _______ with four brothers and two sisters.", ["parents", "cousins", "family", "relative"], 2, "Do you have a big family?"],
  ["hawaii", "Hawaii is...", ["a group of Atlantic islands and a Canadian state.", "a group of Pacific countries that is part of Europe.", "a group of Pacific islands and one of the 50 United States.", "a group of volcanoes and one of the 25 United States."], 2, "Is it a beautiful place?"],
  ["ohana", "'Ohana' is a _______ that means family — but it also includes close friends.", ["syllable", "letter", "word", "sentence"], 2, "Do you have a similar word in your language?"],
  ["stitches", "The doctor gave her _______ to close the cut after surgery.", ["riches", "beaches", "stitches", "kisses"], 2, "Is it painful?"],
  ["chaos", "The storm caused _______ and _______ in the city.", ["corruption – explosions", "destruction – invasion", "chaos – destruction", "happiness – chaos"], 2, "What can cause chaos and destruction?"],
  ["guardian", "________ is someone responsible for a child's safety and well-being when the parents cannot be.", ["A bodyguard", "A neighbor", "A guardian", "An officer"], 2, "Is it easy to take care of children?"]
];
const after = [
  ["place", "Where does the movie take place?", ["At a family's house.", "In a park.", "On an island."], 2, "Where is this island?"],
  ["stitch", "What is Stitch?", ["A CIA agent.", "A dog.", "An experiment."], 2, "Is he a successful experiment?"],
  ["nani", "Who lives with Lilo?", ["Mrs. Kekoa.", "Her neighbor.", "Nani."], 2, "Who is she?"],
  ["kekoa", "Who is Mrs. Kekoa?", ["He is a surfer.", "She is Nani's boss.", "She is a social worker."], 2, "Is she a bad person?"],
  ["describe", "How can you describe Stitch?", ["Excited and careful.", "Calm and quiet.", "Chaotic and weird."], 2, "Would you like him as your pet?"],
  ["aliens", "Why are aliens after Stitch?", ["He wants to destroy the ocean.", "He is radioactive.", "He is dangerous."], 2, "Is he captured in the end?"],
  ["weakness", "What is Stitch's weakness?", ["He is Experiment 626.", "He is super strong.", "He cannot float."], 2, "Who saves him at the end?"]
];
const scene = [
  ["dog", "Lilo wants a dog.", ["True", "False"], 0, "Where are they?"], ["talk", "Dogs cannot talk.", ["True", "False"], 0, "Is Stitch a dog?"],
  ["stitchtalk", "Stitch can talk.", ["True", "False"], 0, "Remember, he is not a dog."], ["adopt", "Lilo does not want to adopt Stitch.", ["True", "False"], 1, "She thinks he is the best dog in the shelter."]
];
const during = ["Who are Lilo and Stitch? Where are they from?", "Do Lilo and Stitch have a family?", "Does Lilo have a good life?", "How would you describe Stitch? Is it easy to live with him?", "Who is after Stitch, and why?", "Does the movie have a happy ending?"];
const adjectives = [
  { id: "energetic", answer: "energetic", scrambled: "TIGERENCE", emoji: "⚡", clue: "Full of energy" },
  { id: "chaotic", answer: "chaotic", scrambled: "TOCHICA", emoji: "🌪️", clue: "Confused, uncontrolled, and disorderly" },
  { id: "messy", answer: "messy", scrambled: "SYMSE", emoji: "🧹", clue: "Untidy or disorganized" },
  { id: "impulsive", answer: "impulsive", scrambled: "PULSIVEIM", emoji: "💥", clue: "Acting suddenly without thinking" },
  { id: "curious", answer: "curious", scrambled: "SUOCURI", emoji: "🔍", clue: "Eager to know or learn something" }
];
const save = () => localStorage.setItem(key, JSON.stringify(state)), count = (object) => Object.keys(object).length, writingComplete = () => state.writing.trim().length >= 50;
const progress = () => count(state.before) + count(state.adjectives) + state.during.length + count(state.after) + count(state.scene) + (writingComplete() ? 1 : 0);
function order(group, id, options) { const k = `${group}-${id}`; if (!state.orders[k]) { state.orders[k] = options.map((_, i) => i).sort(() => Math.random() - .5); save(); } return state.orders[k]; }
function renderQuiz(target, items, group) { const host = document.querySelector(target), position = host.querySelector(".question-carousel")?.scrollLeft || 0; host.innerHTML = `<div class="question-carousel-shell"><div class="question-carousel-toolbar"><span>Questions</span><div><button class="question-carousel-button" data-nav="previous" type="button" aria-label="Previous question">&#8592;</button><button class="question-carousel-button" data-nav="next" type="button" aria-label="Next question">&#8594;</button></div></div><div class="question-carousel">${items.map((q, i) => { const answer = state[group][q[0]], correct = answer === q[3]; return `<div class="question-slide"><p class="slide-number">Question ${i + 1} of ${items.length}</p><article class="question-card ${correct ? "is-correct" : ""}"><p class="question-text">${q[1]}</p><div class="answer-options">${order(group, q[0], q[2]).map((item, display) => `<button class="answer-choice ${answer === item ? "selected" : ""}" data-group="${group}" data-id="${q[0]}" data-answer="${item}" type="button"><span>${String.fromCharCode(65 + display)}</span>${q[2][item]}</button>`).join("")}</div><p class="question-feedback">${answer === undefined ? "" : correct ? `Correct. ${q[4]}` : "Not quite. Try another answer."}</p></article></div>`; }).join("")}</div></div>`; host.querySelector(".question-carousel").scrollLeft = position; }
const normalise = (value) => value.toLowerCase().replace(/[^a-z]/g, "");
function render() {
  renderQuiz("#before-questions", before, "before"); renderQuiz("#after-questions", after, "after"); renderQuiz("#scene-questions", scene, "scene");
  document.querySelector("#adjective-puzzle").innerHTML = adjectives.map((item) => { const solved = state.adjectives[item.id] === item.answer; return `<article class="animal-card ${solved ? "is-solved" : ""}"><span class="animal-emoji">${item.emoji}</span><div><p class="scrambled-word">${item.scrambled}</p><label>${item.clue}<input data-adjective-input="${item.id}" value="${solved ? item.answer : ""}" ${solved ? "disabled" : ""}></label></div><button class="check-animal" data-check-adjective="${item.id}" type="button" ${solved ? "disabled" : ""}>${solved ? "Solved" : "Check"}</button></article>`; }).join("");
  document.querySelector("#adjective-feedback").textContent = count(state.adjectives) === adjectives.length ? "Excellent. You unscrambled every adjective." : `${count(state.adjectives)} / ${adjectives.length} adjectives solved`;
  document.querySelector("#during-checklist").innerHTML = during.map((item, i) => `<button class="watch-item ${state.during.includes(i) ? "done" : ""}" data-during="${i}" type="button"><span>${state.during.includes(i) ? "✓" : "○"}</span>${item}</button>`).join("");
  document.querySelector("#student-writing").value = state.writing; document.querySelector("#student-name").value = state.name; document.querySelector("#teacher-name").value = state.teacher; document.querySelector("#writing-feedback").textContent = writingComplete() ? "Writing task complete." : "Write at least 50 characters to complete this activity.";
  const completed = progress(); document.querySelector("#progress-label").textContent = `${completed} / ${totalActivities} complete`; document.querySelector("#progress-bar").style.width = `${completed / totalActivities * 100}%`;
}
document.addEventListener("click", (event) => {
  const choice = event.target.closest("[data-group]"); if (choice) { state[choice.dataset.group][choice.dataset.id] = +choice.dataset.answer; save(); render(); return; }
  const check = event.target.closest("[data-check-adjective]"); if (check) { const item = adjectives.find((value) => value.id === check.dataset.checkAdjective), input = document.querySelector(`[data-adjective-input="${item.id}"]`); if (normalise(input.value) === normalise(item.answer)) { state.adjectives[item.id] = item.answer; save(); render(); } else { input.classList.add("is-wrong"); setTimeout(() => input.classList.remove("is-wrong"), 450); } return; }
  const watch = event.target.closest("[data-during]"); if (watch) { const i = +watch.dataset.during; state.during = state.during.includes(i) ? state.during.filter((value) => value !== i) : [...state.during, i]; save(); render(); return; }
  const nav = event.target.closest("[data-nav]"); if (nav) { const carousel = nav.closest(".question-carousel-shell").querySelector(".question-carousel"); carousel.scrollBy({ left: carousel.clientWidth * (nav.dataset.nav === "next" ? 1 : -1), behavior: "smooth" }); }
});
["student-writing", "student-name", "teacher-name"].forEach((id) => document.querySelector(`#${id}`).addEventListener("input", (event) => { state[id === "student-writing" ? "writing" : id === "student-name" ? "name" : "teacher"] = event.target.value; save(); render(); }));
document.querySelector("#reset-lesson").addEventListener("click", () => { if (confirm("Reset lesson progress?")) { state = { ...defaults, before: {}, adjectives: {}, during: [], after: {}, scene: {}, orders: {} }; save(); render(); } }); render();
