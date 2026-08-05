const key = "mye-f1-the-movie-v1", totalActivities = 31;
const defaults = { before: {}, teams: {}, during: [], after: {}, interview: {}, writing: "", name: "", teacher: "", orders: {} };
let saved = {}; try { saved = JSON.parse(localStorage.getItem(key) || "{}"); } catch { localStorage.removeItem(key); }
let state = { ...defaults, ...saved, orders: { ...(saved.orders || {}) } };
const before = [
  ["plot", "Based on the trailer and your knowledge, which plot is correct?", ["A veteran driver comes out of retirement to lead a struggling Formula 1 team and mentor a young driver while chasing one more chance at glory.", "A young F1 driver retires early because he cannot deal with his older teammate.", "Two Ferrari drivers have a mortal rivalry before the Brazilian Grand Prix."], 0, "Get ready for some speed!"],
  ["hamilton", "________ is one of the most famous F1 drivers in history.", ["Tom Brady", "LeBron James", "Lewis Hamilton", "Lionel Messi"], 2, "Do you have a favorite F1 driver?"],
  ["prix", "He won his first _______ after a dramatic final lap.", ["Grand Slam", "Grand Canyon", "Grand Prix", "Grandpa"], 2, "What was the last Grand Prix you watched?"],
  ["rookie", "A _______ is a person who is new to a job or activity.", ["Tech Director", "Veteran", "Rookie", "Driver"], 2, "Are there any rookies at your job or school?"],
  ["punished", "The team was _______ by the FIA for _______ technical regulations.", ["allowed – broking", "pushed – breaking", "punished – breaking", "disqualified – respecting"], 2, "Has your sports team ever been punished?"],
  ["crew", "The ______ changed all four ______ in just two seconds.", ["tech director – tires", "pit stop – tired", "pit crew – tires", "team owner – pilots"], 2, "Would you like to work for an F1 team?"],
  ["overtake", "The driver managed to _______ his rival on the final lap.", ["overthink", "takeover", "overtake", "take away"], 2, "Have you ever raced?"]
];
const after = [
  ["sonny", "Who is Sonny Hayes?", ["An old man addicted to gambling and fighting.", "A young hotshot driver at APXGP.", "A former F1 driver."], 2, "What happened during the rest of his career?"],
  ["offer", "What is Ruben's offer to Sonny?", ["A chance to become F1 champion.", "A spot on a Daytona racing team.", "A spot on a struggling racing team."], 2, "Why does he do that?"],
  ["relationship", "How do Sonny and Joshua get along in the beginning?", ["They immediately get along very well.", "Their mothers create a clash between them.", "They have a tumultuous and tense relationship."], 2, "How does that change later?"],
  ["situation", "What is APXGP's situation?", ["JP must become champion or the media will bash them.", "They must win or Kate will get divorced.", "They must win one race or Ruben can lose the team."], 2, "Is it an easy mission?"],
  ["combat", "What does Sonny want Kate to do?", ["Get rid of the pit crew.", "Build a car for straight lines.", "Build a car for combat."], 2, "What does he mean?"],
  ["final", "What happens in the final race of the season?", ["Sonny becomes Formula 1 champion.", "Sonny does not win, but earns Joshua's respect.", "Joshua crashes with Hamilton."], 2, "What happens after that?"]
];
const interview = [
  ["mug", "When you 'mug' someone, you mean that person is smart.", ["True", "False"], 1, "What does 'mug' actually mean?"],
  ["fuming", "'Fuming' means angry.", ["False", "True"], 1, "What makes you angry?"],
  ["peng", "'Peng' is a negative word.", ["True", "False"], 1, "What does it mean?"],
  ["chuffed", "Someone who is 'chuffed' is happy.", ["False", "True"], 1, "Are you chuffed right now?"],
  ["money", "They use one expression for someone who has no money.", ["False", "True"], 1, "What expression is it?"]
];
const during = ["How would you describe Sonny?", "Did Sonny have a successful career in the past?", "Who is Joshua? Is he a good person?", "Do Joshua and Sonny see their careers the same way?", "Who are Kate and Ruben? How are they connected to Sonny?", "Is APXGP in a good situation? What do they desperately need?", "What happens in the final race?"];
const teams = [
  { id: "ferrari", answer: "ferrari", scrambled: "RIRAFER", emoji: "🐎", clue: "The famous Italian team in red" },
  { id: "mclaren", answer: "mclaren", scrambled: "NARLCEM", emoji: "🟠", clue: "A British team famous for its papaya color" },
  { id: "redbull", answer: "red bull", scrambled: "DER LLUB", emoji: "🐂", clue: "The team with two charging bulls in its logo" },
  { id: "mercedes", answer: "mercedes", scrambled: "SEEDMERC", emoji: "⭐", clue: "The Silver Arrows" },
  { id: "williams", answer: "williams", scrambled: "LIAMSWIL", emoji: "🔵", clue: "A historic British team founded by Frank" }
];
const save = () => localStorage.setItem(key, JSON.stringify(state)), count = (object) => Object.keys(object).length;
const writingComplete = () => state.writing.trim().length >= 50;
const progress = () => count(state.before) + count(state.teams) + state.during.length + count(state.after) + count(state.interview) + (writingComplete() ? 1 : 0);
function order(group, id, options) { const k = `${group}-${id}`; if (!state.orders[k]) { state.orders[k] = options.map((_, i) => i).sort(() => Math.random() - .5); save(); } return state.orders[k]; }
function renderQuiz(target, items, group) { const host = document.querySelector(target), position = host.querySelector(".question-carousel")?.scrollLeft || 0; host.innerHTML = `<div class="question-carousel-shell"><div class="question-carousel-toolbar"><span>Questions</span><div><button class="question-carousel-button" data-nav="previous" type="button" aria-label="Previous question">&#8592;</button><button class="question-carousel-button" data-nav="next" type="button" aria-label="Next question">&#8594;</button></div></div><div class="question-carousel">${items.map((q, i) => { const answer = state[group][q[0]], correct = answer === q[3]; return `<div class="question-slide"><p class="slide-number">Question ${i + 1} of ${items.length}</p><article class="question-card ${correct ? "is-correct" : ""}"><p class="question-text">${q[1]}</p><div class="answer-options">${order(group, q[0], q[2]).map((item, display) => `<button class="answer-choice ${answer === item ? "selected" : ""}" data-group="${group}" data-id="${q[0]}" data-answer="${item}" type="button"><span>${String.fromCharCode(65 + display)}</span>${q[2][item]}</button>`).join("")}</div><p class="question-feedback">${answer === undefined ? "" : correct ? `Correct. ${q[4]}` : "Not quite. Try another answer."}</p></article></div>`; }).join("")}</div></div>`; host.querySelector(".question-carousel").scrollLeft = position; }
const normalise = (value) => value.toLowerCase().replace(/[^a-z]/g, "");
function render() {
  renderQuiz("#before-questions", before, "before"); renderQuiz("#after-questions", after, "after"); renderQuiz("#interview-questions", interview, "interview");
  document.querySelector("#team-puzzle").innerHTML = teams.map((team) => { const solved = state.teams[team.id] === team.answer; return `<article class="animal-card ${solved ? "is-solved" : ""}"><span class="animal-emoji">${team.emoji}</span><div><p class="scrambled-word">${team.scrambled}</p><label>${team.clue}<input data-team-input="${team.id}" value="${solved ? team.answer : ""}" ${solved ? "disabled" : ""}></label></div><button class="check-animal" data-check-team="${team.id}" type="button" ${solved ? "disabled" : ""}>${solved ? "Solved" : "Check"}</button></article>`; }).join("");
  document.querySelector("#team-feedback").textContent = count(state.teams) === teams.length ? "Excellent. You identified every F1 team." : `${count(state.teams)} / ${teams.length} teams solved`;
  document.querySelector("#during-checklist").innerHTML = during.map((item, i) => `<button class="watch-item ${state.during.includes(i) ? "done" : ""}" data-during="${i}" type="button"><span>${state.during.includes(i) ? "✓" : "○"}</span>${item}</button>`).join("");
  document.querySelector("#student-writing").value = state.writing; document.querySelector("#student-name").value = state.name; document.querySelector("#teacher-name").value = state.teacher; document.querySelector("#writing-feedback").textContent = writingComplete() ? "Writing task complete." : "Write at least 50 characters to complete this activity.";
  const completed = progress(); document.querySelector("#progress-label").textContent = `${completed} / ${totalActivities} complete`; document.querySelector("#progress-bar").style.width = `${completed / totalActivities * 100}%`;
}
document.addEventListener("click", (event) => {
  const choice = event.target.closest("[data-group]"); if (choice) { state[choice.dataset.group][choice.dataset.id] = +choice.dataset.answer; save(); render(); return; }
  const check = event.target.closest("[data-check-team]"); if (check) { const team = teams.find((item) => item.id === check.dataset.checkTeam), input = document.querySelector(`[data-team-input="${team.id}"]`); if (normalise(input.value) === normalise(team.answer)) { state.teams[team.id] = team.answer; save(); render(); } else { input.classList.add("is-wrong"); setTimeout(() => input.classList.remove("is-wrong"), 450); } return; }
  const watch = event.target.closest("[data-during]"); if (watch) { const i = +watch.dataset.during; state.during = state.during.includes(i) ? state.during.filter((value) => value !== i) : [...state.during, i]; save(); render(); return; }
  const nav = event.target.closest("[data-nav]"); if (nav) { const carousel = nav.closest(".question-carousel-shell").querySelector(".question-carousel"); carousel.scrollBy({ left: carousel.clientWidth * (nav.dataset.nav === "next" ? 1 : -1), behavior: "smooth" }); }
});
["student-writing", "student-name", "teacher-name"].forEach((id) => document.querySelector(`#${id}`).addEventListener("input", (event) => { state[id === "student-writing" ? "writing" : id === "student-name" ? "name" : "teacher"] = event.target.value; save(); render(); }));
document.querySelector("#reset-lesson").addEventListener("click", () => { if (confirm("Reset lesson progress?")) { state = { ...defaults, before: {}, teams: {}, during: [], after: {}, interview: {}, orders: {} }; save(); render(); } });
render();
