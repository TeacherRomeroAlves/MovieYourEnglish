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
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character])); }
function openReport() {
  const completed = progress(), beforeDone = count(state.before), duringDone = state.during.length, afterDone = count(state.after) + (writingComplete() ? 1 : 0), popup = window.open("", "_blank");
  if (!popup) return;
  const logo = new URL("../assets/mye-logo.png", location.href).href;
  popup.document.write(`<!doctype html><html><head><title>KPop Demon Hunters lesson report</title><style>@page{size:auto;margin:14mm}*{box-sizing:border-box}body{max-width:780px;margin:0 auto;color:#102121;font-family:Arial,sans-serif}.head{display:flex;align-items:center;gap:16px;padding-bottom:18px;border-bottom:1px solid #b9d8d6}.head img{width:62px;height:62px;border-radius:50%}.eyebrow{margin:0 0 5px;color:#087f7b;font-size:10px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase}h1{margin:0;font-size:30px}h2{margin:29px 0 14px;font-size:20px}.student{margin:8px 0 0;color:#58706f}.summary{display:flex;justify-content:space-between;align-items:center;margin:24px 0;padding:21px 23px;border-radius:20px;background:linear-gradient(120deg,#cafff7,#d9ff00)}.summary p{margin:0;font-size:12px;font-weight:bold}.summary strong{font-size:27px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.card{padding:15px;border:1px solid #d4e2e1;border-radius:15px;background:#f9fffe}.card h3{margin:0;font-size:14px}.card p{min-height:32px;color:#5a7372;font-size:11px;line-height:1.35}.bar{height:10px;overflow:hidden;border-radius:999px;background:#e3eeed}.bar span{display:block;height:100%;border-radius:inherit;background:#16b9b4}.card strong{display:block;margin-top:8px;font-size:12px}.writing{margin-top:29px;padding:23px;border:1px solid #cde6e4;border-radius:19px;background:#f1fffd}.writing h2{margin-top:0}.writing blockquote{min-height:72px;margin:14px 0 0;padding:12px 15px;border-radius:12px;background:#fff;box-shadow:inset 0 0 0 1px #d9e8e7;white-space:pre-wrap}.foot{margin-top:28px;padding-top:16px;border-top:1px solid #d4e2e1;color:#607674;font-size:11px}@media print{.summary,.bar span{print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head><body><header class="head"><img src="${logo}" alt="Movie Your English logo"><div><p class="eyebrow">Movie Your English lesson report</p><h1>KPop Demon Hunters</h1><p class="student">Student: ${escapeHtml(state.name || "Not provided")}</p></div></header><section class="summary"><div><p>LESSON PROGRESS</p><strong>${completed} / 19 complete</strong></div><span>Pop power</span></section><h2>Activity overview</h2><div class="grid"><article class="card"><h3>Before you watch</h3><p>Trailer and vocabulary questions</p><div class="bar"><span style="width:${beforeDone / 7 * 100}%"></span></div><strong>${beforeDone} / 7 complete</strong></article><article class="card"><h3>During the movie</h3><p>Viewing guide and discussion prompts</p><div class="bar"><span style="width:${duringDone / 4 * 100}%"></span></div><strong>${duringDone} / 4 complete</strong></article><article class="card"><h3>After you watch</h3><p>Comprehension check and writing</p><div class="bar"><span style="width:${afterDone / 7 * 100}%"></span></div><strong>${afterDone} / 7 complete</strong></article></div><section class="writing"><p class="eyebrow">Writing response</p><h2>Your K-pop opinion</h2><blockquote>${escapeHtml(state.writing || "No response submitted.")}</blockquote></section><footer class="foot">Generated by Movie Your English. Save this report as a PDF and share it with your teacher.</footer></body></html>`);
  popup.document.close(); setTimeout(() => popup.print(), 400);
}
async function createStory() {
  const status = document.querySelector("#story-status"); status.textContent = "Creating your Story image…";
  try {
    const load = (src) => new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = new URL(src, location.href); });
    const [template, poster] = await Promise.all([load("../assets/mye-instagram-story-template.png"), load("../assets/kpop-demon-hunters-poster.webp")]);
    const canvas = document.createElement("canvas"), context = canvas.getContext("2d"); canvas.width = 1080; canvas.height = 1920; context.drawImage(template, 0, 0, 1080, 1920);
    context.fillStyle = "#fff"; context.beginPath(); context.roundRect(330, 565, 420, 650, 30); context.fill(); context.drawImage(poster, 350, 585, 380, 610);
    context.fillStyle = "#fff"; context.font = "700 42px Arial"; context.textAlign = "center"; context.fillText("I've just practiced English with", 540, 490); context.font = "800 32px Arial"; context.fillText(`I completed ${progress()} of 19 activities!`, 540, 1300);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png")), link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "kpop-demon-hunters-story.png"; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000); status.textContent = "Story image downloaded.";
  } catch { status.textContent = "We couldn't create the Story image. Please try again."; }
}
document.querySelector("#save-report").addEventListener("click", openReport);
document.querySelector("#share-story").addEventListener("click", createStory);
render();
