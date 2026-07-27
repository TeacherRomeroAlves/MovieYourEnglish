const sheepStorageKey = "mye-sheep-detectives-lesson-v2";
const lessonSlug = "sheep-detectives";
const defaultState = { before: {}, matchedTerms: [], during: [], after: {}, writing: "", name: "", teacherName: "", orders: {} };
let lesson = { ...defaultState, ...JSON.parse(localStorage.getItem(sheepStorageKey) || "{}") };
let selectedTerm = null;
let feedbackMessage = "";
let authClient = null;
let authUser = null;
let remoteSyncTimer = null;

const beforeQuestions = [
  { id: "plot", q: "Based on the trailer, which plot is correct?", options: ["After a mysterious crime disrupts life in the countryside, some sheep realise they must become detectives.", "After a mysterious incident happens in a big city, some animals decide to investigate.", "Some sheep become detectives after a baby sheep disappears from the barn."], correct: 0, note: "Time for a wild adventure." },
  { id: "sheep", q: "A(n) ________ is a farm animal raised for its wool.", options: ["Sheep", "Cow", "Wolf", "Shepherd"], correct: 0, note: "Did you know that the plural of sheep is also sheep?" },
  { id: "murdered", q: "The detective investigated who ________ the victim.", options: ["murdered", "killer", "criminal", "killing"], correct: 0, note: "Do you know any famous murder cases that were investigated?" },
  { id: "will", q: "What do we call a legal document that says who will receive a person's money and property after they die?", options: ["A will", "A wish", "A dream", "A desire"], correct: 0, note: "A will explains how a person's money and property should be shared after their death." },
  { id: "slaughterhouse", q: "What do we call the place where animals are killed and prepared for meat?", options: ["A slaughterhouse", "A barn", "A farm", "Grass"], correct: 0, note: "Do you eat meat?" },
  { id: "winter", q: "It often snows during the _______.", options: ["Winter", "Summer", "Fall", "Spring"], correct: 0, note: "Do you like winters?" },
  { id: "case", q: "The ________ was solved and the suspect was _______ after a long investigation.", options: ["case - convicted", "case - suspicious", "convicted - arrested", "case - investigated"], correct: 0, note: "Is it easy to investigate a crime?" }
];

const sheepPairs = [
  { term: "FLOCK", definition: "A group of sheep", emoji: "🐑" },
  { term: "WOOL", definition: "The soft hair that grows on a sheep", emoji: "🧶" },
  { term: "RAM", definition: "An adult male sheep", emoji: "🐏" },
  { term: "LAMB", definition: "A young sheep", emoji: "🐑" },
  { term: "EWE", definition: "An adult female sheep", emoji: "🌼" },
  { term: "PASTURE", definition: "A field where farm animals eat grass", emoji: "🌿" },
  { term: "HAY", definition: "Dried grass used as food for animals", emoji: "🌾" }
];

const duringQuestions = [
  "Who is George, and what is his job?",
  "Does George have money? What happens to him?",
  "How can we describe Denbrook?",
  "Who are the suspects? Do they have relevant reasons?",
  "Who are Lily, Mopple, and Sebastian? How do they help?"
];

const afterQuestions = [
  { id: "george", q: "Who is George?", options: ["A shepherd", "A poor farmer", "A police officer"], correct: 0, note: "Is he a good shepherd?" },
  { id: "rebecca", q: "Who is Rebecca?", options: ["The woman George sends letters to", "George's lover", "George's favourite sheep"], correct: 0, note: "And who is she?" },
  { id: "denbrook", q: "Does George like the people from Denbrook?", options: ["Not really.", "He loves everyone there.", "He likes the people as much as he likes the sheep."], correct: 0, note: "Why not?" },
  { id: "death", q: "What happens to George?", options: ["He is mysteriously killed.", "He is killed in front of everyone in the city.", "He murders a person from Denbrook."], correct: 0, note: "What clues make his death suspicious?" },
  { id: "helpers", q: "Who helps the police solve the case?", options: ["George's sheep", "Another shepherd", "The town's reverend"], correct: 0, note: "Are the police efficient?" },
  { id: "killer", q: "Who is the killer?", options: ["George's son", "The innkeeper", "George's daughter"], correct: 0, note: "Did you solve the case before the police?" }
];

function shuffle(items) { return [...items].sort(() => Math.random() - 0.5); }
function getChoiceOrder(question, group) {
  const key = `${group}-${question.id}`;
  if (!lesson.orders[key]) lesson.orders[key] = question.options.map((_, index) => index).sort(() => Math.random() - 0.5);
  return lesson.orders[key];
}
function isAnswered(value) { return Number.isInteger(value); }
function writingComplete() { return lesson.writing.trim().length >= 50; }
function getProgress() {
  return {
    completed: Object.keys(lesson.before).length + lesson.matchedTerms.length + lesson.during.length + Object.keys(lesson.after).length + (writingComplete() ? 1 : 0),
    total: 26
  };
}
function save() {
  localStorage.setItem(sheepStorageKey, JSON.stringify(lesson));
  renderProgress();
  if (authClient && authUser) {
    clearTimeout(remoteSyncTimer);
    remoteSyncTimer = setTimeout(syncRemoteProgress, 500);
  }
}
async function syncRemoteProgress() {
  if (!authClient || !authUser) return;
  const progress = getProgress();
  await authClient.from("lesson_progress").upsert({ user_id: authUser.id, lesson_slug: lessonSlug, state: lesson, completed: progress.completed, total: progress.total }, { onConflict: "user_id,lesson_slug" });
}
async function loadRemoteProgress() {
  if (!authClient || !authUser) return;
  const { data } = await authClient.from("lesson_progress").select("state").eq("user_id", authUser.id).eq("lesson_slug", lessonSlug).maybeSingle();
  if (data?.state) {
    lesson = { ...defaultState, ...data.state, orders: data.state.orders || {} };
    renderAll();
  } else syncRemoteProgress();
}
function renderQuiz(containerId, questions, group) {
  document.querySelector(containerId).innerHTML = `<div class="question-carousel-shell"><div class="question-carousel-toolbar"><span>Questions</span><div><button class="question-carousel-button" type="button" data-question-carousel="previous" aria-label="Previous question">←</button><button class="question-carousel-button" type="button" data-question-carousel="next" aria-label="Next question">→</button></div></div><div class="question-carousel">${questions.map((question, index) => {
    const selected = lesson[group][question.id];
    const answered = isAnswered(selected);
    const correct = selected === question.correct;
    const options = getChoiceOrder(question, group);
    const feedback = !answered ? "" : correct ? `Correct. ${question.note}` : "Not quite. Try another answer.";
    return `<div class="question-slide"><p class="slide-number">Question ${index + 1} of ${questions.length}</p><article class="question-card ${answered && correct ? "is-correct" : ""}"><p class="question-text">${question.q}</p><div class="answer-options">${options.map((optionIndex, optionNumber) => `<button class="answer-choice ${selected === optionIndex ? "selected" : ""}" type="button" data-question-group="${group}" data-question-id="${question.id}" data-option="${optionIndex}"><span>${String.fromCharCode(65 + optionNumber)}</span>${question.options[optionIndex]}</button>`).join("")}</div><p class="question-feedback">${feedback}</p></article></div>`;
  }).join("")}</div></div>`;
}
function renderMatching() {
  const matched = new Set(lesson.matchedTerms);
  const terms = lesson.orders.sheepTerms || (lesson.orders.sheepTerms = shuffle(sheepPairs.map((pair) => pair.term)));
  const definitions = lesson.orders.sheepDefinitions || (lesson.orders.sheepDefinitions = shuffle(sheepPairs.map((pair) => pair.term)));
  document.querySelector("#terms").innerHTML = terms.map((term) => { const pair = sheepPairs.find((item) => item.term === term); return `<button class="match-button term-button ${selectedTerm === term ? "selected" : ""} ${matched.has(term) ? "matched" : ""}" type="button" data-term="${term}" ${matched.has(term) ? "disabled" : ""}><span class="term-emoji" aria-hidden="true">${pair.emoji}</span>${term}<span class="match-check">${matched.has(term) ? "✓" : ""}</span></button>`; }).join("");
  document.querySelector("#definitions").innerHTML = definitions.map((term) => { const pair = sheepPairs.find((item) => item.term === term); return `<button class="match-button definition-button ${matched.has(term) ? "matched" : ""}" type="button" data-definition="${term}" ${matched.has(term) ? "disabled" : ""}>${pair.definition}<span class="match-check">${matched.has(term) ? "✓" : ""}</span></button>`; }).join("");
  document.querySelector("#match-count").textContent = matched.size;
  document.querySelector("#matching-message").textContent = matched.size === sheepPairs.length ? "Case closed. You matched every clue." : feedbackMessage;
}
function renderDuring() {
  const completed = new Set(lesson.during);
  document.querySelector("#during-checklist").innerHTML = duringQuestions.map((question, index) => `<button class="watch-item ${completed.has(index) ? "done" : ""}" type="button" data-during="${index}"><span>${completed.has(index) ? "✓" : "○"}</span>${question}</button>`).join("");
}
function renderWriting() {
  document.querySelector("#student-writing").value = lesson.writing;
  document.querySelector("#student-name").value = lesson.name;
  document.querySelector("#teacher-name").value = lesson.teacherName;
  document.querySelector("#writing-feedback").textContent = writingComplete() ? "Writing task complete." : lesson.writing.length ? `${Math.max(0, 50 - lesson.writing.length)} more characters needed.` : "Write at least 50 characters to complete this activity.";
}
function renderProgress() {
  const progress = getProgress();
  document.querySelector("#progress-label").textContent = `${progress.completed} / ${progress.total} complete`;
  document.querySelector("#progress-bar").style.width = `${(progress.completed / progress.total) * 100}%`;
  const status = document.querySelector("#account-save-status");
  status.textContent = authUser ? `Signed in as ${authUser.email}. Your progress is saved.` : window.myeAuth?.configured ? "Sign in to save your progress across devices." : "Member progress saving will be available soon.";
}
function renderAll() { renderQuiz("#before-questions", beforeQuestions, "before"); renderMatching(); renderDuring(); renderQuiz("#after-questions", afterQuestions, "after"); renderWriting(); renderProgress(); }

document.addEventListener("click", (event) => {
  const answer = event.target.closest("[data-question-id]");
  if (answer) {
    const activeCarousel = answer.closest(".question-carousel");
    const activeSlide = activeCarousel ? Math.round(activeCarousel.scrollLeft / activeCarousel.clientWidth) : 0;
    const questionGroup = answer.dataset.questionGroup;
    lesson[answer.dataset.questionGroup][answer.dataset.questionId] = Number(answer.dataset.option);
    save(); renderAll();
    const refreshedCarousel = document.querySelector(questionGroup === "before" ? "#before-questions .question-carousel" : "#after-questions .question-carousel");
    if (refreshedCarousel) refreshedCarousel.scrollLeft = activeSlide * refreshedCarousel.clientWidth;
    return;
  }
  const term = event.target.closest("[data-term]");
  if (term && !term.disabled) { selectedTerm = term.dataset.term; renderMatching(); return; }
  const definition = event.target.closest("[data-definition]");
  if (definition && !definition.disabled && selectedTerm) {
    if (definition.dataset.definition === selectedTerm) {
      lesson.matchedTerms = [...new Set([...lesson.matchedTerms, selectedTerm])];
      selectedTerm = null; feedbackMessage = ""; save();
    } else {
      selectedTerm = null; feedbackMessage = "Not quite. Choose another definition.";
      window.setTimeout(() => { feedbackMessage = ""; renderMatching(); }, 1400);
    }
    renderMatching(); return;
  }
  const during = event.target.closest("[data-during]");
  if (during) {
    const index = Number(during.dataset.during);
    lesson.during = lesson.during.includes(index) ? lesson.during.filter((item) => item !== index) : [...lesson.during, index];
    save(); renderDuring(); return;
  }
  const carouselButton = event.target.closest("[data-question-carousel]");
  if (carouselButton) {
    const carousel = carouselButton.closest(".question-carousel-shell").querySelector(".question-carousel");
    carousel.scrollBy({ left: carousel.clientWidth * (carouselButton.dataset.questionCarousel === "next" ? 1 : -1), behavior: "smooth" });
  }
});

document.querySelector("#reset-lesson").addEventListener("click", () => {
  if (!window.confirm("Reset all progress for The Sheep Detectives lesson?")) return;
  lesson = { ...defaultState };
  selectedTerm = null; feedbackMessage = ""; save(); renderAll();
});
["student-writing", "student-name", "teacher-name"].forEach((id) => document.querySelector(`#${id}`).addEventListener("input", (event) => {
  if (id === "student-writing") lesson.writing = event.target.value;
  if (id === "student-name") lesson.name = event.target.value;
  if (id === "teacher-name") lesson.teacherName = event.target.value;
  save(); renderWriting();
}));

function escapeHtml(value) { return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character])); }
document.querySelector("#save-report").addEventListener("click", () => {
  const progress = getProgress(); const popup = window.open("", "_blank");
  if (!popup) return;
  const logoUrl = new URL("../assets/mye-logo.png", window.location.href).href;
  popup.document.write(`<!doctype html><html><head><title>The Sheep Detectives lesson report</title><style>@page{size:auto;margin:14mm}*{box-sizing:border-box}body{max-width:780px;margin:0 auto;color:#102121;font-family:Arial,sans-serif}.head{display:flex;align-items:center;gap:16px;padding-bottom:18px;border-bottom:1px solid #b9d8d6}.head img{width:62px;height:62px;border-radius:50%}.eyebrow{margin:0 0 5px;color:#087f7b;font-size:10px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase}h1{margin:0;font-size:30px}h2{margin:29px 0 14px;font-size:20px}.student{margin:8px 0 0;color:#58706f}.summary{display:flex;justify-content:space-between;align-items:center;margin:24px 0;padding:21px 23px;border-radius:20px;background:linear-gradient(120deg,#cafff7,#d9ff00)}.summary p{margin:0;font-size:12px;font-weight:bold}.summary strong{font-size:27px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.card{padding:15px;border:1px solid #d4e2e1;border-radius:15px;background:#f9fffe}.card h3{margin:0;font-size:14px}.card p{min-height:32px;color:#5a7372;font-size:11px;line-height:1.35}.bar{height:10px;overflow:hidden;border-radius:999px;background:#e3eeed}.bar span{display:block;height:100%;border-radius:inherit;background:#16b9b4}.card strong{display:block;margin-top:8px;font-size:12px}.writing{margin-top:29px;padding:23px;border:1px solid #cde6e4;border-radius:19px;background:#f1fffd}.writing h2{margin-top:0}.writing blockquote{min-height:72px;margin:14px 0 0;padding:12px 15px;border-radius:12px;background:#fff;box-shadow:inset 0 0 0 1px #d9e8e7;white-space:pre-wrap}.foot{margin-top:28px;padding-top:16px;border-top:1px solid #d4e2e1;color:#607674;font-size:11px}@media print{.summary,.bar span{print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head><body><header class="head"><img src="${logoUrl}" alt="Movie Your English logo"><div><p class="eyebrow">Movie Your English lesson report</p><h1>The Sheep Detectives</h1><p class="student">Student: ${escapeHtml(lesson.name || "Not provided")}</p></div></header><section class="summary"><div><p>LESSON PROGRESS</p><strong>${progress.completed} / ${progress.total} complete</strong></div><span>Case file</span></section><h2>Activity overview</h2><div class="grid"><article class="card"><h3>Before you watch</h3><p>Trailer questions and Sheep Vocab</p><div class="bar"><span style="width:${(Object.keys(lesson.before).length + lesson.matchedTerms.length) / 14 * 100}%"></span></div><strong>${Object.keys(lesson.before).length + lesson.matchedTerms.length} / 14 complete</strong></article><article class="card"><h3>During the movie</h3><p>Viewing guide and discussion prompts</p><div class="bar"><span style="width:${lesson.during.length / 5 * 100}%"></span></div><strong>${lesson.during.length} / 5 complete</strong></article><article class="card"><h3>After you watch</h3><p>Comprehension check and writing</p><div class="bar"><span style="width:${(Object.keys(lesson.after).length + (writingComplete() ? 1 : 0)) / 7 * 100}%"></span></div><strong>${Object.keys(lesson.after).length + (writingComplete() ? 1 : 0)} / 7 complete</strong></article></div><section class="writing"><p class="eyebrow">Writing response</p><h2>Would you care for animals?</h2><blockquote>${escapeHtml(lesson.writing || "No response submitted.")}</blockquote></section><footer class="foot">Generated by Movie Your English. Save this report as a PDF and share it with your teacher.</footer></body></html>`);
  popup.document.close();
  window.setTimeout(() => popup.print(), 400);
});

document.addEventListener("mye-auth-ready", (event) => { authClient = event.detail.client; authUser = event.detail.user; renderProgress(); if (authUser) loadRemoteProgress(); });
document.addEventListener("mye-auth-changed", (event) => { authClient = event.detail.client; authUser = event.detail.user; renderProgress(); if (authUser) loadRemoteProgress(); });

renderAll();

document.querySelector("#share-story")?.addEventListener("click", async () => {
  const status = document.querySelector("#story-status"); status.textContent = "Creating your Story image…";
  try { const [template, poster] = await Promise.all(["../assets/mye-instagram-story-template.png", "../assets/sheep-detectives-poster.png"].map((src) => new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = new URL(src, location.href); }))); const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1920; const context = canvas.getContext("2d"); context.drawImage(template, 0, 0, 1080, 1920); context.fillStyle = "#fff"; context.fillRect(345, 605, 390, 585); context.drawImage(poster, 360, 620, 360, 540); const p = getProgress(); context.fillStyle = "#fff"; context.font = "800 33px Arial"; context.textAlign = "center"; context.fillText(`I completed ${p.completed} of ${p.total} activities!`, 540, 1320); const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png")); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "the-sheep-detectives-story.png"; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000); status.textContent = "Story image downloaded."; } catch { status.textContent = "We couldn't create the Story image. Please try again."; }
});
