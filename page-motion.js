const pageMotionSource = document.currentScript?.src || location.href;
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
  if (event.target.closest("[data-generic-report]")) window.print();
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
let wrongChoiceHistory = new Set();
try { wrongChoiceHistory = new Set(JSON.parse(localStorage.getItem(wrongChoiceStorageKey) || "[]")); } catch { localStorage.removeItem(wrongChoiceStorageKey); }
const choiceAttemptKey = (choice) => {
  const data = choice.dataset;
  const question = data.id || data.i || data.questionId || choice.closest(".question-card")?.querySelector(".question-text")?.textContent?.trim() || "question";
  const group = data.group || data.g || data.type || data.questionGroup || "quiz";
  const answer = data.answer ?? data.n ?? data.a ?? data.v ?? data.option ?? choice.textContent.trim();
  return `${group}::${question}::${answer}`;
};
const paintWrongChoices = () => {
  document.querySelectorAll(".answer-choice").forEach((choice) => choice.classList.toggle("was-wrong", wrongChoiceHistory.has(choiceAttemptKey(choice))));
};
document.addEventListener("click", (event) => {
  const choice = event.target.closest(".answer-choice");
  if (!choice) return;
  const attemptKey = choiceAttemptKey(choice);
  setTimeout(() => {
    const renderedChoice = [...document.querySelectorAll(".answer-choice")].find((item) => choiceAttemptKey(item) === attemptKey);
    const card = renderedChoice?.closest(".question-card");
    const hasFeedback = Boolean(card?.querySelector(".question-feedback")?.textContent?.trim());
    if (card && !card.classList.contains("is-correct") && hasFeedback) {
      wrongChoiceHistory.add(attemptKey);
      localStorage.setItem(wrongChoiceStorageKey, JSON.stringify([...wrongChoiceHistory]));
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
    localStorage.removeItem(wrongChoiceStorageKey);
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
  const promptTitle = writingCard.querySelector("h2")?.textContent || "Your speaking response";
  const promptText = writingCard.querySelector("h2 + p")?.textContent || "Use the same prompt and record your answer in English.";
  const responseGrid = document.createElement("div");
  responseGrid.className = "response-mode-switcher";
  writingCard.parentNode.insertBefore(responseGrid, writingCard);
  const existingResponseHeading = responseGrid.previousElementSibling?.classList.contains("response-heading");
  if (!existingResponseHeading) {
    const responseHeading = document.createElement("div");
    responseHeading.className = "mini-heading response-heading";
    responseHeading.innerHTML = '<p class="eyebrow">Wrap-up</p><h2>Express your opinion</h2><p>Answer the question below in a text or record yourself speaking.</p>';
    responseGrid.insertAdjacentElement("beforebegin", responseHeading);
  }
  responseGrid.innerHTML = '<div class="response-mode-tabs" role="tablist" aria-label="Choose your response type"><button class="response-mode-tab active" type="button" role="tab" aria-selected="true" data-response-mode="write">Time to Write</button><button class="response-mode-tab" type="button" role="tab" aria-selected="false" data-response-mode="speak">Time to Speak</button></div>';
  responseGrid.appendChild(writingCard);
  const speakingCard = document.createElement("section");
  speakingCard.className = "speaking-card";
  speakingCard.innerHTML = `<h2>${promptTitle}</h2><p>${promptText}</p><p class="speaking-help">Record your answer, then save the audio file to send to your teacher.</p><p class="recording-timer" hidden>Recording 00:00</p><div class="recording-actions"><button class="record-button" type="button">Record answer</button><button class="stop-recording" type="button" hidden>Stop recording</button></div><audio class="speaking-audio" controls hidden></audio><div class="recording-actions saved-actions" hidden><button class="save-recording" type="button">Save recording</button></div><p class="recording-status" aria-live="polite">Your recording stays on this device until you choose to save it.</p>`;
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

  const recordButton = speakingCard.querySelector(".record-button");
  const stopButton = speakingCard.querySelector(".stop-recording");
  const audio = speakingCard.querySelector(".speaking-audio");
  const savedActions = speakingCard.querySelector(".saved-actions");
  const status = speakingCard.querySelector(".recording-status");
  const timer = speakingCard.querySelector(".recording-timer");
  let recorder; let stream; let chunks = []; let recordingBlob; let recordingUrl; let timerInterval; let seconds = 0;
  const recordingName = `${location.pathname.split("/").filter(Boolean).pop() || "movie-your-english"}-speaking-answer.webm`;

  const downloadRecording = () => {
    if (!recordingBlob) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(recordingBlob);
    link.download = recordingName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
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
      recorder = new MediaRecorder(stream);
      recorder.addEventListener("dataavailable", (event) => { if (event.data.size) chunks.push(event.data); });
      recorder.addEventListener("stop", () => {
        recordingBlob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        if (recordingUrl) URL.revokeObjectURL(recordingUrl);
        recordingUrl = URL.createObjectURL(recordingBlob);
        audio.src = recordingUrl; audio.hidden = false; savedActions.hidden = false;
        clearInterval(timerInterval); timer.hidden = true;
        recordButton.textContent = "Record again"; recordButton.hidden = false; stopButton.hidden = true;
        stream.getTracks().forEach((track) => track.stop());
        status.textContent = "Recording ready. Save the file to send it to your teacher.";
        document.dispatchEvent(new CustomEvent("mye-speaking-saved"));
      });
      recorder.start();
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

if (document.querySelector(".writing-card") && !document.querySelector("#lesson-report")) {
  const footer = document.querySelector(".site-footer");
  const report = document.createElement("section");
  report.id = "lesson-report";
  report.className = "report-card";
  report.innerHTML = '<div><p class="eyebrow">Lesson complete?</p><h2>Save your lesson report</h2><p>Choose <strong>Save as PDF</strong> in your browser\'s print dialog, then send the report to your teacher.</p></div><div class="report-actions"><button id="save-report" class="activity-link" type="button">Save / share report <span>→</span></button><button id="share-story" class="instagram-share-button" type="button">Create Instagram Story <span>✦</span></button><p id="story-status" class="story-status" aria-live="polite"></p></div>';
  footer?.parentNode.insertBefore(report, footer);
}
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
