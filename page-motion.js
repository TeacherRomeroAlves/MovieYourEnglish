const pageMotionSource = document.currentScript?.src || location.href;
const storyExportScript = document.createElement("script");
storyExportScript.src = new URL("story-export.js", pageMotionSource).href;
storyExportScript.async = false;
document.body.appendChild(storyExportScript);
// Keep a word bank stable during an attempt, but never show it in answer order.
window.myeEnsureShuffledOrder = (answers, savedOrder) => {
  const original = [...answers];
  const sortedOriginal = [...original].sort();
  const valid = Array.isArray(savedOrder) && savedOrder.length === original.length
    && [...savedOrder].sort().every((word, index) => word === sortedOriginal[index]);
  if (valid && !savedOrder.every((word, index) => word === original[index])) return savedOrder;
  if (original.length < 2) return original;
  for (let index = original.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [original[index], original[swap]] = [original[swap], original[index]];
  }
  if (original.every((word, index) => word === answers[index])) original.push(original.shift());
  return original;
};
// Each lesson owns its challenge state, but this shared control resets only that
// state and lets the lesson's existing renderer rebuild the activity on reload.
const extraActivityState = {
  "alien-romulus": { terms: {}, selected: null },
  "eternity": { words: [], wordOrder: [] },
  "f1-the-movie": { teams: {} },
  "f1-the-movie-beginner": { teams: {} },
  "forrest-gump": { brands: {} },
  "frankenstein-easier": { facts: {} },
  "frankenstein-harder": { matches: [], selectedMatch: "", matchOrder: [] },
  "harry-potter-philosophers-stone": { verbs: [], verbOrder: [] },
  "inside-out-2": { sorted: {}, selected: "" },
  "lilo-and-stitch": { adjectives: {} },
  "materialists": { words: [] },
  "moana-2": { sentences: {}, selectedWord: "", wordOrder: [] },
  "moana-2-beginner": { sentences: {}, selectedWord: "", wordOrder: [] },
  "odyssey": { verbs: [], verbOrder: [] },
  "project-hail-mary": { foundWords: [] },
  "se7en": { w: [] },
  "sheep-detectives": { matchedTerms: [] },
  "superman-beginner": { gaps: {}, selectedWord: "", wordOrder: [] },
  "superman-intermediate-plus": { gaps: {}, selectedWord: "", wordOrder: [] },
  "the-batman": { sorted: {}, selected: "" },
  "the-housemaid": { routine: [], verbOrder: [] },
  "the-wrong-paris": { sorted: {}, selected: "" },
  "zootopia-2": { animals: {} }
};
const extraActivityStorageKeys = {
  "moana-2": "mye-moana-2-v2",
  "project-hail-mary": "mye-project-hail-mary-lesson-v1",
  "sheep-detectives": "mye-sheep-detectives-lesson-v2"
};
const extraActivityPathParts = location.pathname.split("/").filter(Boolean);
const extraActivitySlug = extraActivityPathParts.at(-1)?.endsWith(".html") ? extraActivityPathParts.at(-2) : extraActivityPathParts.at(-1);
function installExtraActivityControls() {
  const fields = extraActivityState[extraActivitySlug];
  if (!fields) return;
  document.querySelectorAll(".mini-heading").forEach((heading) => {
    const eyebrow = heading.querySelector(".eyebrow");
    if (!eyebrow || !/^(extra challenge|bonus activity)$/i.test(eyebrow.textContent.trim())) return;
    heading.classList.add("extra-challenge-heading");
    if (heading.querySelector("[data-reset-activity]")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "reset-activity-button";
    button.dataset.resetActivity = "";
    button.textContent = "Reset Activity";
    button.setAttribute("aria-label", `Reset ${heading.querySelector("h2")?.textContent || "extra"} activity`);
    heading.appendChild(button);
    heading.nextElementSibling?.classList.add("extra-challenge-content");
  });
}
installExtraActivityControls();
if (sessionStorage.getItem("mye-extra-reset") === extraActivitySlug) {
  sessionStorage.removeItem("mye-extra-reset");
  const heading = document.querySelector(".extra-challenge-heading");
  const section = heading?.closest("details");
  if (section) section.open = true;
  requestAnimationFrame(() => heading?.scrollIntoView({ block: "start" }));
}
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-reset-activity]");
  if (!button) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const fields = extraActivityState[extraActivitySlug];
  const key = extraActivityStorageKeys[extraActivitySlug] || `mye-${extraActivitySlug}-v1`;
  if (!fields) return;
  let state;
  try { state = JSON.parse(localStorage.getItem(key) || "{}"); } catch { state = {}; }
  for (const [field, empty] of Object.entries(fields)) {
    state[field] = Array.isArray(empty) && Array.isArray(state[field]) && ["words", "verbs", "routine"].includes(field)
      ? Array(state[field].length).fill(null)
      : JSON.parse(JSON.stringify(empty));
  }
  if (extraActivitySlug === "frankenstein-easier") {
    state.wrong = Object.fromEntries(Object.entries(state.wrong || {}).filter(([question]) => !question.startsWith("facts-")));
    for (const historyKey of ["mye-wrong-choices", "mye-wrong-questions", "mye-first-try-correct"]) {
      const storageKey = `${historyKey}:${location.pathname}`;
      try {
        const remaining = JSON.parse(localStorage.getItem(storageKey) || "[]").filter((question) => !question.startsWith("facts::"));
        localStorage.setItem(storageKey, JSON.stringify(remaining));
      } catch { localStorage.removeItem(storageKey); }
    }
  }
  localStorage.setItem(key, JSON.stringify(state));
  const user = window.myeAuth?.user;
  if (user) sessionStorage.setItem(`mye-restored:${user.id}:${extraActivitySlug}`, "true");
  if (user && ["project-hail-mary", "sheep-detectives"].includes(extraActivitySlug)) {
    sessionStorage.setItem(`mye-extra-reset-sync:${extraActivitySlug}`, user.id);
  }
  sessionStorage.setItem("mye-extra-reset", extraActivitySlug);
  location.reload();
}, true);
if (!document.querySelector("[data-auth-slot]")) {
  const authConfigScript = document.createElement("script");
  authConfigScript.src = new URL("auth-config.js", pageMotionSource).href;
  authConfigScript.addEventListener("load", () => {
    const authScript = document.createElement("script");
    authScript.type = "module";
    authScript.src = new URL("auth.js", pageMotionSource).href;
    document.body.appendChild(authScript);
  });
  document.head.appendChild(authConfigScript);
}
const motionTargets = document.querySelectorAll(".activity-page > section, .activity-page > .watch-provider");
const adultContentNotes = {
  "alien-romulus": { label: "Content warning", text: "This movie contains intense violence, frightening scenes, and disturbing images. Recommended for adults." },
  "se7en": { label: "Content warning", text: "This movie contains graphic violence, disturbing crime scenes, and adult themes. Recommended for adults." },
  "materialists": { label: "Mild content warning", text: "This movie includes mature relationship themes and a reference to sexual assault. Viewer discretion is advised." },
  "frankenstein-easier": { label: "Mild content warning", text: "This movie includes fantasy violence and some unsettling images. Viewer discretion is advised." },
  "frankenstein-harder": { label: "Mild content warning", text: "This movie includes fantasy violence and some unsettling images. Viewer discretion is advised." }
};
const addAdultContentNote = () => {
  if (document.querySelector(".content-note")) return;
  const pathParts = location.pathname.split("/").filter(Boolean);
  const lastPart = pathParts.at(-1) || "";
  const movieSlug = lastPart.endsWith(".html") ? pathParts.at(-2) : lastPart;
  const note = adultContentNotes[movieSlug];
  const hero = document.querySelector(".movie-hero");
  if (!note || !hero) return;
  const contentNote = document.createElement("aside");
  contentNote.className = "content-note";
  contentNote.setAttribute("aria-label", note.label);
  contentNote.innerHTML = `<p class="eyebrow">${note.label}</p><strong>${note.text}</strong>`;
  hero.insertAdjacentElement("afterend", contentNote);
};
addAdultContentNote();
const ensureLessonReport = () => {
  const lessonPage = document.querySelector(".activity-page.lesson-page");
  if (!lessonPage || document.querySelector("#lesson-report")) return;
  const report = document.createElement("section");
  report.id = "lesson-report";
  report.className = "report-card";
  report.innerHTML = '<div><p class="eyebrow">Lesson complete?</p><h2>Save your lesson report</h2><p>Use your browser’s print dialog to save this completed lesson as a PDF and share it with your teacher.</p></div><div class="report-actions"><button class="activity-link" data-generic-report type="button">Save / share report <span aria-hidden="true">→</span></button></div>';
  const footer = lessonPage.querySelector(".site-footer");
  lessonPage.insertBefore(report, footer || null);
};
ensureLessonReport();
document.addEventListener("click", (event) => {
  if (!event.target.closest("[data-generic-report]")) return;
  updateGenericReportScore();
  window.print();
});
let questionPosition = 0;
document.addEventListener("click", (event) => { const choice = event.target.closest(".answer-choice"); if (choice) questionPosition = choice.closest(".question-carousel")?.scrollLeft || 0; }, true);
document.addEventListener("click", (event) => { if (event.target.closest(".answer-choice")) setTimeout(() => { document.querySelectorAll(".question-carousel").forEach((carousel) => { carousel.scrollLeft = questionPosition; }); }, 0); });
const addCarouselControls = () => {
  document.querySelectorAll(".question-carousel-shell").forEach((shell) => {
    const toolbar = shell.querySelector(".question-carousel-toolbar");
    if (!toolbar || toolbar.querySelector(".question-carousel-button")) return;
    toolbar.insertAdjacentHTML("beforeend", '<div><button class="question-carousel-button" type="button" data-shared-carousel="previous" aria-label="Previous question">←</button><button class="question-carousel-button" type="button" data-shared-carousel="next" aria-label="Next question">→</button></div>');
  });
};
const addCarouselInstructions = () => {
  document.querySelectorAll(".question-list").forEach((questionList) => {
    const heading = questionList.previousElementSibling;
    if (!heading?.classList.contains("mini-heading")) {
      questionList.insertAdjacentHTML("beforebegin", '<div class="mini-heading"><p>Use the arrows to move through the questions.</p></div>');
      return;
    }
    if (heading.textContent.includes("Use the arrows to move through the questions.")) return;
    heading.insertAdjacentHTML("beforeend", "<p>Use the arrows to move through the questions.</p>");
  });
};
const beforeWatchHeadings = {
  "alien-romulus": "Survive the station",
  "conclave": "Behind closed doors",
  "devil-wears-prada": "Fashion meets ambition",
  "eternity": "Love beyond life",
  "f1-the-movie": "Prepare for the race",
  "forrest-gump": "Life is full of surprises",
  "harry-potter-philosophers-stone": "Magic begins at Hogwarts",
  "kpop-demon-hunters": "Music can save the world",
  "lilo-and-stitch": "Welcome to the family",
  "materialists": "Love is complicated",
  "moana-2": "Go beyond the horizon",
  "odyssey": "Prepare for the journey",
  "project-hail-mary": "One mission can save the sun",
  "se7en": "Follow the clues",
  "sheep-detectives": "Every mystery leaves a clue",
  "the-housemaid": "Something is wrong in this house",
  "the-batman": "Follow the clues through Gotham",
  "the-wrong-paris": "Welcome to the wrong Paris",
  "zootopia-2": "Crack the case"
};
const enhanceBeforeWatchHeading = () => {
  const beforeSection = [...document.querySelectorAll("details.lesson-section")].find((section) => section.querySelector("summary b")?.textContent.trim() === "01");
  const questionList = beforeSection?.querySelector(".question-list");
  if (!questionList) return;
  let heading = questionList.previousElementSibling;
  if (!heading?.classList.contains("mini-heading")) {
    heading = document.createElement("div");
    heading.className = "mini-heading";
    questionList.insertAdjacentElement("beforebegin", heading);
  }
  heading.classList.add("plot-vocab-heading");
  let eyebrow = heading.querySelector(".eyebrow");
  if (!eyebrow) { eyebrow = document.createElement("p"); eyebrow.className = "eyebrow"; heading.prepend(eyebrow); }
  eyebrow.textContent = "Plot & vocabulary";
  let title = heading.querySelector("h2");
  if (!title) { title = document.createElement("h2"); eyebrow.insertAdjacentElement("afterend", title); }
  const pathParts = location.pathname.split("/").filter(Boolean);
  const lastPart = pathParts.at(-1) || "";
  const movieSlug = lastPart.endsWith(".html") ? pathParts.at(-2) : lastPart;
  title.textContent = beforeWatchHeadings[movieSlug] || "Get ready for the movie";
  let instruction = [...heading.querySelectorAll("p:not(.eyebrow)")].find((paragraph) => paragraph.textContent.includes("arrows"));
  if (!instruction) { instruction = document.createElement("p"); heading.appendChild(instruction); }
  instruction.textContent = "Use the arrows to move through the questions.";
  if (!heading.querySelector(".dictionary-card")) {
    heading.insertAdjacentHTML("beforeend", '<a class="dictionary-card" href="https://dictionary.cambridge.org/dictionary/english/" target="_blank" rel="noreferrer"><img src="../assets/cambridge-dictionary-logo.jpeg" alt="Cambridge Dictionary"><span><small>Definitions & pronunciation</small><strong>Cambridge Dictionary <b>↗</b></strong><em>Look up any words you do not know.</em></span></a>');
  }
};
const addDuringMovieClosingMessage = () => {
  const duringSection = [...document.querySelectorAll("details.lesson-section")].find((section) => section.querySelector("summary b")?.textContent.trim() === "02");
  const content = duringSection?.querySelector(".lesson-section-content");
  if (!content || content.querySelector(".watching-tip")) return;
  content.insertAdjacentHTML("beforeend", '<p class="watching-tip"><strong>Time to have fun!</strong> Now you are going to watch the movie in English <em>(with or without subtitles — according to your English level).</em> We do not want to spoil your movie experience.</p>');
};
setTimeout(addCarouselControls, 500);
setInterval(addCarouselControls, 500);
setTimeout(addCarouselInstructions, 500);
setInterval(addCarouselInstructions, 500);
setTimeout(enhanceBeforeWatchHeading, 100);
setInterval(enhanceBeforeWatchHeading, 500);
setTimeout(addDuringMovieClosingMessage, 100);
setInterval(addDuringMovieClosingMessage, 500);
document.addEventListener("click", (event) => { const button = event.target.closest("[data-shared-carousel]"); if (button) button.closest(".question-carousel-shell").querySelector(".question-carousel").scrollBy({ left: button.dataset.sharedCarousel === "next" ? 500 : -500, behavior: "smooth" }); });

const colorMatchingPairs = () => {
  document.querySelectorAll(".matching-board").forEach((board) => {
    const matchedButtons = [...board.querySelectorAll(".match-button.matched")];
    const pairKeys = [];
    matchedButtons.forEach((button) => {
      const key = button.dataset.term || button.dataset.definition || button.dataset.c || button.dataset.cd;
      if (key && !pairKeys.includes(key)) pairKeys.push(key);
    });
    matchedButtons.forEach((button) => {
      const key = button.dataset.term || button.dataset.definition || button.dataset.c || button.dataset.cd;
      const color = pairKeys.indexOf(key);
      if (color >= 0) button.dataset.matchColor = String(color % 9);
    });
  });
};
setTimeout(colorMatchingPairs, 100);
setInterval(colorMatchingPairs, 400);

const wrongChoiceStorageKey = `mye-wrong-choices:${location.pathname}`;
const wrongQuestionStorageKey = `mye-wrong-questions:${location.pathname}`;
const firstTryCorrectStorageKey = `mye-first-try-correct:${location.pathname}`;
let wrongChoiceHistory = new Set();
let wrongQuestionHistory = new Set();
let firstTryCorrectHistory = new Set();
try { wrongChoiceHistory = new Set(JSON.parse(localStorage.getItem(wrongChoiceStorageKey) || "[]")); } catch { localStorage.removeItem(wrongChoiceStorageKey); }
try { wrongQuestionHistory = new Set(JSON.parse(localStorage.getItem(wrongQuestionStorageKey) || "[]")); } catch { localStorage.removeItem(wrongQuestionStorageKey); }
try { firstTryCorrectHistory = new Set(JSON.parse(localStorage.getItem(firstTryCorrectStorageKey) || "[]")); } catch { localStorage.removeItem(firstTryCorrectStorageKey); }
if (!wrongQuestionHistory.size && wrongChoiceHistory.size) {
  wrongChoiceHistory.forEach((key) => wrongQuestionHistory.add(key.slice(0, key.lastIndexOf("::"))));
  localStorage.setItem(wrongQuestionStorageKey, JSON.stringify([...wrongQuestionHistory]));
}
const choiceQuestionKey = (choice) => {
  const data = choice.dataset;
  const question = data.id || data.i || data.questionId || choice.closest(".question-card")?.querySelector(".question-text")?.textContent?.trim() || "question";
  const group = data.group || data.g || data.type || data.questionGroup || "quiz";
  return `${group}::${question}`;
};
const choiceAttemptKey = (choice) => {
  const data = choice.dataset;
  const answer = data.answer ?? data.n ?? data.a ?? data.v ?? data.option ?? choice.textContent.trim();
  return `${choiceQuestionKey(choice)}::${answer}`;
};
const firstTryScore = () => firstTryCorrectHistory.size;
const firstTryScoreText = () => `${firstTryScore()} correct ${firstTryScore() === 1 ? "answer" : "answers"} on the first try`;
const updateGenericReportScore = () => {
  const report = document.querySelector("#lesson-report");
  if (!report) return;
  let score = report.querySelector(".first-try-report-score");
  if (!score) {
    score = document.createElement("p");
    score.className = "first-try-report-score";
    report.querySelector("h2")?.insertAdjacentElement("afterend", score);
  }
  score.textContent = firstTryScoreText();
};
window.myeFirstTryScore = { count: firstTryScore, text: firstTryScoreText };
const nativeWindowOpen = window.open.bind(window);
window.open = (...args) => {
  const popup = nativeWindowOpen(...args);
  if (!popup) return popup;
  let attempts = 0;
  const enhanceReport = window.setInterval(() => {
    attempts += 1;
    try {
      const summary = popup.document?.querySelector(".summary");
      if (summary && !summary.querySelector(".first-try-report-score")) {
        const score = popup.document.createElement("p");
        score.className = "first-try-report-score";
        score.textContent = firstTryScoreText();
        score.style.cssText = "margin:7px 0 0;font-size:13px;font-weight:800;color:#235654";
        const progressText = summary.querySelector("strong");
        (progressText?.parentElement || summary).appendChild(score);
        window.clearInterval(enhanceReport);
      }
    } catch {
      window.clearInterval(enhanceReport);
    }
    if (attempts > 100) window.clearInterval(enhanceReport);
  }, 10);
  return popup;
};
const syncFirstTryFromRenderedAnswers = () => {
  let changed = false;
  document.querySelectorAll(".question-card.is-correct").forEach((card) => {
    const selected = card.querySelector(".answer-choice.selected") || card.querySelector(".answer-choice");
    if (!selected) return;
    const questionKey = choiceQuestionKey(selected);
    if (!wrongQuestionHistory.has(questionKey) && !firstTryCorrectHistory.has(questionKey)) {
      firstTryCorrectHistory.add(questionKey);
      changed = true;
    }
  });
  if (changed) localStorage.setItem(firstTryCorrectStorageKey, JSON.stringify([...firstTryCorrectHistory]));
};
const paintWrongChoices = () => {
  document.querySelectorAll(".answer-choice").forEach((choice) => choice.classList.toggle("was-wrong", wrongChoiceHistory.has(choiceAttemptKey(choice))));
  syncFirstTryFromRenderedAnswers();
};
document.addEventListener("click", (event) => {
  const choice = event.target.closest(".answer-choice");
  if (!choice) return;
  const attemptKey = choiceAttemptKey(choice);
  const questionKey = choiceQuestionKey(choice);
  setTimeout(() => {
    const renderedChoice = [...document.querySelectorAll(".answer-choice")].find((item) => choiceAttemptKey(item) === attemptKey);
    const card = renderedChoice?.closest(".question-card");
    const hasFeedback = Boolean(card?.querySelector(".question-feedback")?.textContent?.trim());
    if (card && !card.classList.contains("is-correct") && hasFeedback) {
      wrongChoiceHistory.add(attemptKey);
      wrongQuestionHistory.add(questionKey);
      localStorage.setItem(wrongChoiceStorageKey, JSON.stringify([...wrongChoiceHistory]));
      localStorage.setItem(wrongQuestionStorageKey, JSON.stringify([...wrongQuestionHistory]));
    } else if (card?.classList.contains("is-correct") && !wrongQuestionHistory.has(questionKey)) {
      firstTryCorrectHistory.add(questionKey);
      localStorage.setItem(firstTryCorrectStorageKey, JSON.stringify([...firstTryCorrectHistory]));
    }
    paintWrongChoices();
  }, 0);
}, true);
document.addEventListener("click", (event) => {
  if (!event.target.closest("#reset-lesson")) return;
  setTimeout(() => {
    const lessonWasReset = [...document.querySelectorAll(".question-feedback")].every((feedback) => !feedback.textContent.trim());
    if (!lessonWasReset) return;
    wrongChoiceHistory.clear();
    wrongQuestionHistory.clear();
    firstTryCorrectHistory.clear();
    localStorage.removeItem(wrongChoiceStorageKey);
    localStorage.removeItem(wrongQuestionStorageKey);
    localStorage.removeItem(firstTryCorrectStorageKey);
    paintWrongChoices();
  }, 100);
});
setTimeout(paintWrongChoices, 100);
setInterval(paintWrongChoices, 400);

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
  const pageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        pageObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  motionTargets.forEach((target, index) => {
    target.classList.add("page-reveal");
    target.style.setProperty("--reveal-delay", `${Math.min(index * 45, 180)}ms`);
    pageObserver.observe(target);
  });
}

document.querySelectorAll(".writing-card").forEach((writingCard) => {
  if (writingCard.dataset.speakingReady) return;
  writingCard.dataset.speakingReady = "true";
  const promptText = writingCard.querySelector("h2 + p")?.textContent || "Use the same prompt and record your answer in English.";
  const responseGrid = document.createElement("div");
  responseGrid.className = "response-mode-switcher";
  writingCard.parentNode.insertBefore(responseGrid, writingCard);
  const existingResponseHeading = responseGrid.previousElementSibling?.classList.contains("response-heading");
  if (!existingResponseHeading) {
    const responseHeading = document.createElement("div");
    responseHeading.className = "mini-heading response-heading";
    responseHeading.innerHTML = '<p class="eyebrow">Wrap-up</p><h2>Express yourself</h2><p>Answer the prompt in writing or record yourself speaking.</p>';
    responseGrid.insertAdjacentElement("beforebegin", responseHeading);
  }
  const promptBox = document.createElement("div");
  promptBox.className = "response-prompt-box";
  const promptLabel = document.createElement("p");
  promptLabel.className = "response-prompt-label";
  promptLabel.textContent = "Your prompt";
  const promptBody = document.createElement("p");
  promptBody.className = "response-prompt-text";
  promptBody.textContent = promptText;
  promptBox.append(promptLabel, promptBody);
  responseGrid.appendChild(promptBox);
  responseGrid.insertAdjacentHTML("beforeend", '<div class="response-mode-tabs" role="tablist" aria-label="Choose how to answer"><button class="response-mode-tab active" id="response-write-tab" type="button" role="tab" aria-controls="response-write-panel" aria-selected="true" data-response-mode="write">Time to Write</button><button class="response-mode-tab" id="response-speak-tab" type="button" role="tab" aria-controls="response-speak-panel" aria-selected="false" data-response-mode="speak">Time to Speak</button></div>');
  responseGrid.appendChild(writingCard);
  writingCard.id = "response-write-panel";
  writingCard.setAttribute("role", "tabpanel");
  writingCard.setAttribute("aria-labelledby", "response-write-tab");
  writingCard.querySelector("h2")?.classList.add("response-internal-prompt");
  writingCard.querySelector("h2 + p")?.classList.add("response-internal-prompt");
  const writingInput = writingCard.querySelector("textarea");
  if (writingInput && !writingCard.querySelector(".response-word-count")) {
    const wordCount = document.createElement("p");
    wordCount.className = "response-word-count";
    const updateWordCount = () => {
      const count = writingInput.value.trim().split(/\s+/).filter(Boolean).length;
      wordCount.textContent = `Word count: ${count}`;
    };
    writingInput.insertAdjacentElement("afterend", wordCount);
    writingInput.addEventListener("input", updateWordCount);
    updateWordCount();
  }
  const speakingCard = document.createElement("section");
  speakingCard.className = "speaking-card";
  speakingCard.id = "response-speak-panel";
  speakingCard.setAttribute("role", "tabpanel");
  speakingCard.setAttribute("aria-labelledby", "response-speak-tab");
  speakingCard.innerHTML = '<div class="speaking-status-heading"><span class="speaking-indicator" aria-hidden="true"></span><div><h2>Record your answer</h2><p>Speak clearly and answer the prompt above.</p></div></div><p class="recording-timer" hidden>Recording 00:00</p><div class="recording-actions"><button class="record-button" type="button">Start recording</button><button class="stop-recording" type="button" hidden>Stop recording</button></div><audio class="speaking-audio" controls hidden></audio><div class="recording-actions saved-actions" hidden><button class="save-recording" type="button">Download audio</button></div><p class="recording-status" aria-live="polite">Download your recording to save it and send it to your teacher.</p>';
  speakingCard.hidden = true;
  responseGrid.appendChild(speakingCard);
  responseGrid.querySelectorAll(".response-mode-tab").forEach((tab) => tab.addEventListener("click", () => {
    const speaking = tab.dataset.responseMode === "speak";
    writingCard.hidden = speaking;
    speakingCard.hidden = !speaking;
    responseGrid.querySelectorAll(".response-mode-tab").forEach((item) => {
      const active = item === tab;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
    });
  }));
  responseGrid.querySelector(".response-mode-tabs").addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const tabs = [...responseGrid.querySelectorAll(".response-mode-tab")];
    const current = tabs.indexOf(document.activeElement);
    const next = tabs[(current + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    next?.focus();
    next?.click();
  });

  const recordButton = speakingCard.querySelector(".record-button");
  const stopButton = speakingCard.querySelector(".stop-recording");
  const audio = speakingCard.querySelector(".speaking-audio");
  const savedActions = speakingCard.querySelector(".saved-actions");
  const status = speakingCard.querySelector(".recording-status");
  const timer = speakingCard.querySelector(".recording-timer");
  let recorder; let stream; let chunks = []; let recordingBlob; let recordingUrl; let timerInterval; let seconds = 0; let recordingExtension = "webm";
  const recordingBaseName = `${location.pathname.split("/").filter(Boolean).pop() || "movie-your-english"}-speaking-answer`;

  const downloadRecording = async () => {
    if (!recordingBlob) return;
    const recordingName = `${recordingBaseName}.${recordingExtension}`;
    const file = new File([recordingBlob], recordingName, { type: recordingBlob.type || `audio/${recordingExtension}` });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "My Movie Your English speaking answer" });
        status.textContent = "Recording ready to share or save from your device.";
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }
    const link = document.createElement("a");
    link.href = URL.createObjectURL(recordingBlob);
    link.download = recordingName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 60000);
    status.textContent = "Recording saved. Attach the audio file when you message your teacher.";
  };

  recordButton.addEventListener("click", async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      status.textContent = "Recording is not supported in this browser. Please try Chrome, Edge, or Safari over a secure connection.";
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks = [];
      const preferredTypes = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"];
      const recordingType = preferredTypes.find((type) => MediaRecorder.isTypeSupported?.(type)) || "";
      recorder = recordingType ? new MediaRecorder(stream, { mimeType: recordingType }) : new MediaRecorder(stream);
      recorder.addEventListener("dataavailable", (event) => { if (event.data.size) chunks.push(event.data); });
      recorder.addEventListener("stop", () => {
        recordingBlob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        recordingExtension = recordingBlob.type.includes("mp4") ? "m4a" : recordingBlob.type.includes("ogg") ? "ogg" : "webm";
        if (recordingUrl) URL.revokeObjectURL(recordingUrl);
        recordingUrl = URL.createObjectURL(recordingBlob);
        audio.src = recordingUrl; audio.hidden = false; savedActions.hidden = false;
        clearInterval(timerInterval); timer.hidden = true;
        recordButton.textContent = "Record again"; recordButton.hidden = false; stopButton.hidden = true;
        speakingCard.classList.remove("is-recording");
        stream.getTracks().forEach((track) => track.stop());
        status.textContent = "Recording ready. Save the file to send it to your teacher.";
        document.dispatchEvent(new CustomEvent("mye-speaking-saved"));
      });
      recorder.start();
      speakingCard.classList.add("is-recording");
      seconds = 0; timer.hidden = false; timer.textContent = "Recording 00:00";
      timerInterval = setInterval(() => { seconds += 1; timer.textContent = `Recording ${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }, 1000);
      recordButton.hidden = true; stopButton.hidden = false;
      status.textContent = "Recording now. Speak clearly, then select Stop recording.";
    } catch {
      status.textContent = "We could not access your microphone. Please allow microphone access and try again.";
    }
  });
  stopButton.addEventListener("click", () => recorder?.state === "recording" && recorder.stop());
  speakingCard.querySelector(".save-recording").addEventListener("click", downloadRecording);
});

// Use explicit slide indexes for question navigation. This avoids fractional
// scroll offsets and unreliable scrollBy behavior in iPhone Safari.
document.addEventListener("click", (event) => {
  const navigation = event.target.closest(".question-carousel-button[data-nav], .question-carousel-button[data-qnav]");
  if (!navigation) return;
  const carousel = navigation.closest(".question-carousel-shell")?.querySelector(".question-carousel");
  if (!carousel) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const direction = (navigation.dataset.nav || navigation.dataset.qnav) === "next" ? 1 : -1;
  const slides = [...carousel.querySelectorAll(".question-slide")];
  const current = Math.round(carousel.scrollLeft / Math.max(carousel.clientWidth, 1));
  const target = Math.max(0, Math.min(slides.length - 1, current + direction));
  carousel.scrollTo({ left: target * carousel.clientWidth, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}, true);

if (document.querySelector(".writing-card") && !document.querySelector("#lesson-report")) {
  const footer = document.querySelector(".site-footer");
  const report = document.createElement("section");
  report.id = "lesson-report";
  report.className = "report-card";
  report.innerHTML = '<div><p class="eyebrow">Lesson complete?</p><h2>Save your lesson report</h2><p>Choose <strong>Save as PDF</strong> in your browser\'s print dialog, then send the report to your teacher.</p></div><div class="report-actions"><button id="save-report" class="activity-link" type="button">Save / share report <span>→</span></button><button id="share-story" class="instagram-share-button" type="button">Create Instagram Story <span>✦</span></button><p id="story-status" class="story-status" aria-live="polite"></p></div>';
  footer?.parentNode.insertBefore(report, footer);
}
const arrangeLessonSharing = () => {
  const report = document.querySelector("#lesson-report");
  if (!report || report.dataset.sharingReady) return;
  report.dataset.sharingReady = "true";
  report.classList.add("lesson-report-export");
  const heading = report.querySelector("h2");
  if (heading) heading.textContent = "Save or share your report";
  const description = heading?.nextElementSibling;
  if (description?.tagName === "P") description.textContent = "Keep a PDF copy or share your progress and written answer with your teacher.";
  const actions = report.querySelector(".report-actions");
  const saveButton = report.querySelector("#save-report, [data-generic-report]");
  if (saveButton) saveButton.innerHTML = 'Save as PDF <span aria-hidden="true">↓</span>';
  if (actions && !actions.querySelector("#share-report-text")) {
    const shareButton = document.createElement("button");
    shareButton.id = "share-report-text";
    shareButton.className = "report-text-share-button";
    shareButton.type = "button";
    shareButton.textContent = "Share report";
    actions.appendChild(shareButton);
    const shareStatus = document.createElement("p");
    shareStatus.id = "report-share-status";
    shareStatus.className = "report-share-status";
    shareStatus.setAttribute("role", "status");
    shareStatus.setAttribute("aria-live", "polite");
    actions.appendChild(shareStatus);
    shareButton.addEventListener("click", async () => {
      const movie = document.body.dataset.reportTitle || document.querySelector(".lesson-hero h1")?.textContent?.trim() || "Movie lesson";
      const prompt = document.querySelector(".response-prompt-text")?.textContent?.trim() || "";
      const answer = document.querySelector("#student-writing, .writing-card textarea")?.value?.trim() || "No written answer yet.";
      const progress = document.querySelector("#progress-label, .progress-panel strong")?.textContent?.trim() || "";
      const name = document.querySelector("#student-name")?.value?.trim() || "Not added";
      const teacher = document.querySelector("#teacher-name")?.value?.trim() || "Not added";
      const shareText = [`${movie} student report`, `Student: ${name}`, `Teacher: ${teacher}`, `Lesson progress: ${progress}`, firstTryScoreText(), "", `Prompt: ${prompt}`, `Answer: ${answer}`].join("\n");
      try {
        if (navigator.share) {
          await navigator.share({ title: `${movie} student report`, text: shareText });
          shareStatus.textContent = "Report shared.";
        } else {
          await navigator.clipboard.writeText(shareText);
          shareStatus.textContent = "Report copied. Paste it into a message or email to your teacher.";
        }
      } catch (error) {
        if (error?.name !== "AbortError") shareStatus.textContent = "Sharing is unavailable in this browser. Try Save as PDF instead.";
      }
    });
  }
  const storyButton = report.querySelector("#share-story");
  const storyStatus = report.querySelector("#story-status");
  if (storyButton) {
    const storyCard = document.createElement("section");
    storyCard.className = "story-share-card";
    storyCard.setAttribute("aria-labelledby", "story-share-heading");
    storyCard.innerHTML = '<div><p class="eyebrow">Share your progress</p><h2 id="story-share-heading">Make it a Story</h2><p>Get a ready-to-post Instagram Story featuring this movie. Share it from your phone.</p></div><div class="story-share-action"></div>';
    storyButton.textContent = "Create Instagram Story";
    storyCard.querySelector(".story-share-action").append(storyButton);
    if (storyStatus) storyCard.querySelector(".story-share-action").append(storyStatus);
    report.insertAdjacentElement("afterend", storyCard);
  }
};
arrangeLessonSharing();
if (document.querySelector(".writing-card")) {
  const exportsScript = document.createElement("script");
  exportsScript.src = new URL("lesson-exports.js", pageMotionSource).href;
  exportsScript.async = false;
  document.body.appendChild(exportsScript);
}

setTimeout(() => {
  if (!location.pathname.includes("/se7en/")) return;
  const grid = document.querySelector("#word-grid");
  const list = document.querySelector("#word-list-items");
  if (!grid || !list) return;
  const words = ["WRATH", "GREED", "PRIDE", "LUST", "GLUTTONY", "ENVY", "SLOTH"];
  const starts = [[0, 0], [2, 1], [4, 3], [6, 0], [8, 2], [1, 10], [10, 4]];
  const repair = () => {
    while (grid.children.length > 144) grid.removeChild(grid.children[24]);
    ["E", "N", "V", "Y"].forEach((letter, index) => { grid.children[(1 + index) * 12 + 10].textContent = letter; });
    grid.querySelectorAll(".found, .color-0, .color-1, .color-2, .color-3").forEach((cell) => cell.classList.remove("found", "color-0", "color-1", "color-2", "color-3"));
    const found = new Set([...list.querySelectorAll(".word-item.is-found strong")].map((item) => item.textContent));
    words.forEach((word, color) => {
      if (!found.has(word)) return;
      const [row, column] = starts[color];
      [...word].forEach((_, index) => grid.children[color === 5 ? (row + index) * 12 + column : row * 12 + column + index]?.classList.add("found", `color-${color % 4}`));
    });
  };
  new MutationObserver(repair).observe(grid, { childList: true });
  repair();
}, 500);
