(function () {
  const lesson = document.querySelector(".lesson-page");
  if (!lesson || document.querySelector("[data-print-lesson]")) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "lesson-print-button";
  button.dataset.printLesson = "";
  button.innerHTML = '<span aria-hidden="true">⎙</span> Print activities';
  button.setAttribute("aria-label", "Print all lesson activities for offline use");

  const intro = lesson.querySelector(".lesson-intro");
  if (intro) intro.insertBefore(button, intro.querySelector(".quiet-button"));
  else lesson.querySelector(".progress-panel")?.insertAdjacentElement("afterend", button);

  const exportRoot = document.createElement("article");
  exportRoot.className = "lesson-print-export";
  exportRoot.setAttribute("aria-hidden", "true");
  document.body.appendChild(exportRoot);

  const removeSelectors = [
    ".video-wrap", ".question-carousel-toolbar", ".question-carousel-button", ".question-feedback",
    ".completion-message", ".form-feedback", ".score", ".reset-activity-button", ".dictionary-card",
    ".cambridge-card", ".report-card", ".report-actions", ".lesson-divider", ".watch-provider",
    ".watch-availability-note", ".body-part-result", ".body-part-actions", "[data-reset-activity]",
    ".speaking-card", ".response-mode-tabs", "audio", "video", "iframe"
  ].join(",");

  function textOf(node) {
    return (node?.textContent || "").replace(/\s+/g, " ").trim();
  }

  function unique(values) {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
  }

  function sanitizeActivity(root) {
    root.querySelectorAll(removeSelectors).forEach((node) => node.remove());
    root.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    root.querySelectorAll("[aria-live]").forEach((node) => node.removeAttribute("aria-live"));
    root.querySelectorAll(".writing-card[hidden]").forEach((node) => node.removeAttribute("hidden"));
    root.querySelectorAll("button").forEach((node) => {
      node.disabled = false;
      node.removeAttribute("disabled");
      node.removeAttribute("aria-disabled");
      node.removeAttribute("aria-pressed");
      node.removeAttribute("tabindex");
    });
    root.querySelectorAll(".is-correct,.correct,.selected,.done,.matched,.is-matched,.found,.is-found,.solved,.is-solved,.wrong,.was-wrong,.is-wrong").forEach((node) => {
      node.classList.remove("is-correct", "correct", "selected", "done", "matched", "is-matched", "found", "is-found", "solved", "is-solved", "wrong", "was-wrong", "is-wrong");
      node.style.removeProperty("background");
      node.style.removeProperty("background-color");
      node.style.removeProperty("border-color");
      node.style.removeProperty("color");
    });

    root.querySelectorAll(".question-carousel").forEach((carousel) => carousel.classList.add("lesson-print-questions"));
    root.querySelectorAll(".question-slide").forEach((slide, index) => {
      slide.classList.add("lesson-print-question");
      const number = slide.querySelector(".slide-number");
      if (!number) slide.insertAdjacentHTML("afterbegin", `<p class="slide-number">Question ${index + 1}</p>`);
    });
    root.querySelectorAll(".answer-choice").forEach((choice) => {
      choice.classList.remove("selected", "wrong-choice", "is-wrong", "is-correct");
      const marker = choice.querySelector("span");
      if (marker) marker.textContent = "○";
    });
    root.querySelectorAll(".watch-item").forEach((item) => {
      item.classList.remove("done");
      const marker = item.querySelector("span");
      if (marker) marker.textContent = "□";
      else item.insertAdjacentHTML("afterbegin", '<span aria-hidden="true">□</span>');
    });
    root.querySelectorAll("input").forEach((input) => {
      input.checked = false;
      input.value = "";
      input.removeAttribute("checked");
      input.removeAttribute("value");
    });
    root.querySelectorAll("textarea").forEach((textarea) => {
      const lines = document.createElement("div");
      lines.className = "lesson-print-writing-lines";
      textarea.replaceWith(lines);
    });
    root.querySelectorAll(".response-heading").forEach((heading) => {
      const eyebrow = heading.querySelector(".eyebrow");
      const title = heading.querySelector("h2");
      const description = heading.querySelector("h2 + p");
      if (eyebrow) eyebrow.textContent = "Wrap-up";
      if (title) title.textContent = "Time to Write";
      if (description) description.textContent = "Answer the prompt below in writing.";
    });

    // Rebuild fill-in-the-gap banks so a previously completed lesson still prints blank.
    const slotSelector = ".verb-slot,.sentence-slot,.word-slot,.gap-slot,.fill-slot,[data-gap]";
    const slots = [...root.querySelectorAll(slotSelector)];
    if (slots.length) {
      const placedWords = slots.map(textOf);
      const bankWords = [...root.querySelectorAll(".verb-bank button,.word-bank button,.sentence-bank button,.gap-bank button,.word-chip")].map(textOf);
      slots.forEach((slot) => {
        slot.textContent = "________________";
        slot.classList.remove("filled", "is-filled", "correct", "is-correct");
      });
      const words = unique([...placedWords, ...bankWords]).filter((word) => !/^[_—-]+$/.test(word));
      const bank = root.querySelector(".verb-bank,.word-bank,.sentence-bank,.gap-bank");
      if (bank && words.length) {
        bank.innerHTML = `<strong>Word bank:</strong> ${words.join(" · ")}`;
        bank.classList.add("lesson-print-word-bank");
      }
    }

    // Anagrams keep their scrambled letters but never reveal a solved word.
    root.querySelectorAll(".body-part-card,.anagram-card,.brand-card,.team-card,.starter-card").forEach((card) => {
      const letterSlots = [...card.querySelectorAll(".body-part-slot,.letter-slot,.answer-slot")];
      if (!letterSlots.length) return;
      letterSlots.forEach((slot) => { slot.textContent = "_"; });
      const title = card.querySelector("h3,strong");
      if (title) title.textContent = `${letterSlots.length} letters`;
    });

    root.querySelectorAll(".wordsearch-cell,.crossword-cell,.letter").forEach((cell) => {
      cell.classList.remove("found", "is-found", "selected", "correct", "is-correct");
    });
    root.querySelectorAll(".word-list li,.word-list-item").forEach((word) => {
      word.classList.remove("found", "is-found");
      word.querySelector(".check,.status")?.remove();
    });

    // A completed sorting task becomes a fresh paper sort with a complete item bank.
    root.querySelectorAll(".paris-sort,.sorting-activity,.sort-activity").forEach((activity) => {
      const itemNodes = [...activity.querySelectorAll("[data-sort-item],[data-return-item],.paris-sort-item,.sort-item")];
      const items = unique(itemNodes.map(textOf));
      if (!items.length) return;
      itemNodes.forEach((node) => node.remove());
      const bank = activity.querySelector(".paris-sort-bank,.sort-bank,.sorting-bank") || activity;
      const paperBank = document.createElement("p");
      paperBank.className = "lesson-print-sort-bank";
      paperBank.innerHTML = `<strong>Items to sort:</strong> ${items.join(" · ")}`;
      bank.prepend(paperBank);
      activity.querySelectorAll(".sort-zone,.paris-sort-zone,.sorting-zone").forEach((zone) => zone.insertAdjacentHTML("beforeend", '<div class="lesson-print-zone-lines"></div>'));
    });
    return root;
  }

  function buildPrintSection(details, index) {
    const section = document.createElement("section");
    section.className = "lesson-print-section";
    const summary = details.querySelector("summary");
    const title = textOf(summary?.querySelector("span")) || `Lesson section ${index + 1}`;
    const subtitle = textOf(summary?.querySelector("small"));
    section.innerHTML = `<header><span>${String(index + 1).padStart(2, "0")}</span><div><h2>${title.replace(/^\d+\s*/, "")}</h2>${subtitle ? `<p>${subtitle}</p>` : ""}</div></header>`;
    const content = details.querySelector(".lesson-section-content")?.cloneNode(true);
    if (content) section.appendChild(sanitizeActivity(content));
    return section;
  }

  function buildPrintableLesson() {
    const title = textOf(lesson.querySelector(".movie-hero h1")) || document.title;
    const pathParts = location.pathname.split("/").filter(Boolean);
    const lastPart = pathParts.at(-1) || "";
    const slug = lastPart.endsWith(".html") ? pathParts.at(-2) || "" : lastPart;
    const level = window.MYE_LEARNING_CATALOG?.lesson(slug)?.level || "";
    const eyebrow = level ? `${level} · Printable movie lesson` : "Printable movie lesson";
    const introText = textOf(lesson.querySelector(".movie-hero .intro"));
    const poster = lesson.querySelector(".hero-poster")?.src || "";
    exportRoot.innerHTML = `
      <header class="lesson-print-header">
        <div class="lesson-print-brand">MOVIE <strong>YOUR ENGLISH</strong><small>Printable movie lesson</small></div>
        ${poster ? `<img src="${poster}" alt="${title} poster">` : ""}
        <div class="lesson-print-title"><p>${eyebrow}</p><h1>${title}</h1>${introText ? `<div>${introText}</div>` : ""}</div>
      </header>
      <div class="lesson-print-student-fields"><span>Student: ______________________________</span><span>Teacher: __________________________</span><span>Date: ____ / ____ / ______</span></div>`;
    lesson.querySelectorAll("details.lesson-section").forEach((details, index) => exportRoot.appendChild(buildPrintSection(details, index)));
    exportRoot.insertAdjacentHTML("beforeend", '<footer class="lesson-print-footer"><strong>movie your english</strong><span>Practice English. Have fun. Enjoy the movie.</span><span>movieyourenglish.com</span></footer>');
  }

  function cleanup() {
    document.body.classList.remove("lesson-printing");
    exportRoot.setAttribute("aria-hidden", "true");
  }

  button.addEventListener("click", () => {
    buildPrintableLesson();
    exportRoot.setAttribute("aria-hidden", "false");
    document.body.classList.add("lesson-printing");
    const done = () => {
      cleanup();
      window.removeEventListener("afterprint", done);
    };
    window.addEventListener("afterprint", done);
    requestAnimationFrame(() => window.print());
    setTimeout(() => {
      if (document.body.classList.contains("lesson-printing")) cleanup();
    }, 60000);
  });
})();
