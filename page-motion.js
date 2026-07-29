const motionTargets = document.querySelectorAll(".activity-page > section, .activity-page > .watch-provider");
let questionPosition = 0;
document.addEventListener("click", (event) => { const choice = event.target.closest(".answer-choice"); if (choice) questionPosition = choice.closest(".question-carousel")?.scrollLeft || 0; }, true);
document.addEventListener("click", (event) => { if (event.target.closest(".answer-choice")) setTimeout(() => { document.querySelectorAll(".question-carousel").forEach((carousel) => { carousel.scrollLeft = questionPosition; }); }, 0); });
const addCarouselControls = () => {
  document.querySelectorAll(".question-carousel-shell").forEach((shell) => {
    const toolbar = shell.querySelector(".question-carousel-toolbar");
    if (!toolbar || toolbar.querySelector("[data-shared-carousel]")) return;
    toolbar.insertAdjacentHTML("beforeend", '<div><button class="question-carousel-button" type="button" data-shared-carousel="previous" aria-label="Previous question">←</button><button class="question-carousel-button" type="button" data-shared-carousel="next" aria-label="Next question">→</button></div>');
  });
};
setTimeout(addCarouselControls, 500);
setInterval(addCarouselControls, 500);
document.addEventListener("click", (event) => { const button = event.target.closest("[data-shared-carousel]"); if (button) button.closest(".question-carousel-shell").querySelector(".question-carousel").scrollBy({ left: button.dataset.sharedCarousel === "next" ? 500 : -500, behavior: "smooth" }); });

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
  responseGrid.innerHTML = '<div class="response-mode-tabs" role="tablist" aria-label="Choose your response type"><button class="response-mode-tab active" type="button" role="tab" aria-selected="true" data-response-mode="write">Time to write</button><button class="response-mode-tab" type="button" role="tab" aria-selected="false" data-response-mode="speak">Time to speak</button></div>';
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
