(function () {
  const storageKey = "mye-barbie-v1";
  const totalActivities = 28;
  const before = [
    ["plot", "Based on the trailer and your knowledge, which plot is correct?", [
      "Barbie and Ken are unhappy in perfect Barbieland, so they get a chance to find true happiness in the real world.",
      "Barbie and Ken are having the time of their lives in colorful, apparently perfect Barbieland. When they go to the real world, they discover the joys and dangers of living among humans.",
      "Barbie goes to the real world to find her biological mother, and Ken follows her to rescue her."
    ], 1, "Get ready to leave Barbieland and discover the real world!", [
      "Barbie and Ken have a great life in Barbieland at the beginning.",
      "",
      "Barbie is a doll, so she does not have a biological mother. Ken also travels with her rather than going later to rescue her."
    ]],
    ["doll", "Barbie is the most famous ________ in history.", ["Woman", "Girl", "Doll", "Dull"], 2, "Did you have any dolls when you were younger?"],
    ["company", "She was made by the American toy ________ Mattel.", ["Fabric", "Cars", "Company", "Executives"], 2, "Is Mattel a big company?"],
    ["patriarchy", "A society controlled by men who use their power to their own advantage is called a ________.", ["Matriarchy", "Fatherhood", "Patriarchy", "Childhood"], 2, "Who is the head of your family?"],
    ["fashion", "Barbie is normally considered a ________ icon.", ["Expensive", "Replaceable", "Fashion", "Plastic"], 2, "Does Barbie have beautiful outfits?"],
    ["feminism", "________ is the belief that women should have the same rights as men.", ["Machismo", "Sexism", "Feminism", "Corporatism"], 2, "Is feminism popular nowadays?"]
  ];
  const after = [
    ["barbieland", "What is Barbieland like?", ["A perfect place for boys and girls to play with every kind of toy.", "A beach house full of happiness and joy.", "An imaginary city where all the Barbies can live the same amazing routine every day."], 2, "Every day is magical in Barbieland."],
    ["leave", "Why does Barbie leave Barbieland?", ["She refuses to wear the standard pink clothes.", "She accidentally breaks an important artifact.", "She starts to have some unusual thoughts."], 2, "She starts thinking about death and questioning her role."],
    ["ken-real-world", "How does Ken react to seeing men in the real world?", ["He gets scared and decides to return to Barbieland.", "He is simply happy to see more people like him.", "He feels encouraged to do things that men commonly do in society."], 2, "Ken notices that men are privileged and starts acting like them."],
    ["executives", "Why do the executives want Barbie to return to Barbieland?", ["The stereotypical Barbie is too naive to understand the company.", "The stereotypical Barbie should be president of Barbieland.", "The stereotypical Barbie is too profitable and important to the company."], 2, "The executives want to avoid major problems related to Barbie's image."],
    ["patriarchy-result", "What happens to Barbieland after Ken discovers patriarchy?", ["It becomes a better place for everybody.", "Ken controls the Barbies because he wants to invade the real world.", "It becomes a reflection of the real world."], 2, "Ken creates a system that favors all the Kens over the Barbies."],
    ["happiness", "What ultimately helps Barbie achieve happiness?", ["Finding a romantic partner like Ken.", "Discovering a hidden treasure guarded by Mattel.", "Embracing her true self and inspiring others to do the same."], 2, "Barbie discovers she can be much more than what other people impose on her."]
  ];
  const scene = [
    ["arguing", "Ken is arguing with Barbie about the beach.", ["True", "False"], 1, "Ken is arguing with another Ken."],
    ["ice-cream", "Ken asks another Ken to hold his ice cream before confronting Ken.", ["False", "True"], 1, "Ken gets angry with the other Ken because of his comments."],
    ["beach-off", "Ken says he will 'beach' Ken on.", ["True", "False"], 1, "He says he will beach Ken off, not on."]
  ];
  const during = [
    "Is Barbie happy in Barbieland?",
    "What about Ken? Is he happy there?",
    "Why do Barbie and Ken go to the real world?",
    "How does Barbieland contrast with the real world?",
    "Does the movie have a traditional happily-ever-after ending?"
  ];
  const gapWords = ["dolls", "Mattel", "1959", "careers", "jobs", "types", "icon"];
  const defaults = () => ({ before: {}, gaps: Array(gapWords.length).fill(null), during: [], after: {}, scene: {}, writing: "", name: "", teacher: "", orders: {}, wordOrder: [], wrong: {} });
  let state;
  try { state = { ...defaults(), ...JSON.parse(localStorage.getItem(storageKey) || "{}") }; } catch { state = defaults(); }
  for (const field of ["before", "after", "scene", "orders", "wrong"]) state[field] ||= {};
  state.during ||= [];
  state.gaps = Array.isArray(state.gaps) && state.gaps.length === gapWords.length ? state.gaps : Array(gapWords.length).fill(null);
  state.wordOrder = window.myeEnsureShuffledOrder(gapWords, state.wordOrder);
  const save = () => localStorage.setItem(storageKey, JSON.stringify(state));
  const optionOrder = (group, question) => {
    const key = `${group}-${question[0]}`;
    return state.orders[key] = window.myeEnsureShuffledOrder(question[2].map((_, index) => index), state.orders[key]);
  };
  function renderQuiz(selector, questions, group) {
    const host = document.querySelector(selector);
    const scroll = host.querySelector(".question-carousel")?.scrollLeft || 0;
    host.innerHTML = `<div class="question-carousel-shell"><div class="question-carousel-toolbar"><span>Questions</span><div><button class="question-carousel-button" data-nav="previous" type="button" aria-label="Previous question">←</button><button class="question-carousel-button" data-nav="next" type="button" aria-label="Next question">→</button></div></div><div class="question-carousel">${questions.map((question, position) => {
      const [id, prompt, choices, correct, comment, wrongComments] = question;
      const answer = state[group][id];
      const isCorrect = answer === correct;
      const wrong = state.wrong[`${group}-${id}`] || [];
      const feedback = answer === undefined ? "" : isCorrect ? `Correct. ${comment}` : (wrongComments?.[answer] || "Not quite. Try another answer.");
      return `<div class="question-slide"><p class="slide-number">Question ${position + 1} of ${questions.length}</p><article class="question-card ${isCorrect ? "is-correct" : ""}"><p class="question-text">${prompt}</p><div class="answer-options">${optionOrder(group, question).map((index, label) => `<button class="answer-choice ${answer === index ? "selected" : ""} ${wrong.includes(index) ? "was-wrong" : ""}" type="button" data-group="${group}" data-id="${id}" data-answer="${index}"><span>${String.fromCharCode(65 + label)}</span>${choices[index]}</button>`).join("")}</div><p class="question-feedback" aria-live="polite">${feedback}</p></article></div>`;
    }).join("")}</div></div>`;
    host.querySelector(".question-carousel").scrollLeft = scroll;
  }
  function renderGaps() {
    document.querySelectorAll("[data-slot]").forEach((slot, index) => {
      const word = state.gaps[index];
      slot.textContent = word || "_____";
      slot.classList.toggle("is-filled", Boolean(word));
      slot.dataset.dropSlot = index;
    });
    const used = new Set(state.gaps.filter(Boolean));
    document.querySelector("#word-bank").innerHTML = state.wordOrder.filter((word) => !used.has(word)).map((word) => `<button class="match-button" type="button" draggable="true" data-gap-word="${word}">${word}</button>`).join("");
    const correct = state.gaps.filter((word, index) => word === gapWords[index]).length;
    document.querySelector("#gap-feedback").textContent = correct === gapWords.length ? "Excellent! Barbie's story is complete." : `${correct} / ${gapWords.length} words in the correct gap`;
  }
  function renderDuring() {
    document.querySelector("#during-checklist").innerHTML = during.map((question, index) => `<button class="watch-item ${state.during.includes(index) ? "done" : ""}" type="button" data-during="${index}"><span>${state.during.includes(index) ? "✓" : "○"}</span>${question}</button>`).join("");
  }
  function updateProgress() {
    const quizDone = [["before", before], ["after", after], ["scene", scene]].reduce((count, [group, questions]) => count + questions.filter((question) => state[group][question[0]] === question[3]).length, 0);
    const gapDone = state.gaps.filter((word, index) => word === gapWords[index]).length;
    const done = quizDone + gapDone + state.during.length + (state.writing.trim().length >= 50 ? 1 : 0);
    document.querySelector("#progress-label").textContent = `${done} / ${totalActivities} complete`;
    document.querySelector("#progress-bar").style.width = `${done / totalActivities * 100}%`;
    document.querySelector("#writing-feedback").textContent = state.writing.trim().length >= 50 ? "Writing task complete." : "Write at least 50 characters to complete this activity.";
    save();
  }
  function render() {
    renderQuiz("#before-questions", before, "before");
    renderQuiz("#after-questions", after, "after");
    renderQuiz("#scene-questions", scene, "scene");
    renderGaps(); renderDuring();
    for (const [id, value] of [["student-writing", state.writing], ["student-name", state.name], ["teacher-name", state.teacher]]) document.getElementById(id).value = value;
    updateProgress();
  }
  function placeWord(word, slotIndex) {
    const previous = state.gaps.indexOf(word);
    if (previous >= 0) state.gaps[previous] = null;
    const displaced = state.gaps[slotIndex];
    state.gaps[slotIndex] = word;
    if (displaced && previous >= 0 && previous !== slotIndex) state.gaps[previous] = displaced;
    renderGaps(); updateProgress();
  }
  document.addEventListener("click", (event) => {
    const answer = event.target.closest("[data-group][data-answer]");
    if (answer) {
      const { group, id } = answer.dataset;
      const questions = group === "before" ? before : group === "after" ? after : scene;
      const question = questions.find((item) => item[0] === id);
      const choice = Number(answer.dataset.answer);
      if (state[group][id] === question[3]) return;
      state[group][id] = choice;
      if (choice !== question[3]) {
        const key = `${group}-${id}`;
        state.wrong[key] = [...new Set([...(state.wrong[key] || []), choice])];
      }
      renderQuiz(group === "before" ? "#before-questions" : group === "after" ? "#after-questions" : "#scene-questions", questions, group);
      updateProgress(); return;
    }
    const word = event.target.closest("[data-gap-word]");
    if (word) {
      const empty = state.gaps.findIndex((item) => !item);
      if (empty >= 0) placeWord(word.dataset.gapWord, empty);
      return;
    }
    const slot = event.target.closest("[data-slot]");
    if (slot && state.gaps[Number(slot.dataset.slot)]) {
      state.gaps[Number(slot.dataset.slot)] = null;
      renderGaps(); updateProgress(); return;
    }
    const watch = event.target.closest("[data-during]");
    if (watch) {
      const index = Number(watch.dataset.during);
      state.during = state.during.includes(index) ? state.during.filter((value) => value !== index) : [...state.during, index];
      renderDuring(); updateProgress();
    }
  });
  document.addEventListener("dragstart", (event) => {
    const word = event.target.closest("[data-gap-word]");
    if (word) event.dataTransfer.setData("text/plain", word.dataset.gapWord);
  });
  document.addEventListener("dragover", (event) => { if (event.target.closest("[data-drop-slot]")) event.preventDefault(); });
  document.addEventListener("drop", (event) => {
    const slot = event.target.closest("[data-drop-slot]");
    if (!slot) return;
    event.preventDefault();
    const word = event.dataTransfer.getData("text/plain");
    if (gapWords.includes(word)) placeWord(word, Number(slot.dataset.dropSlot));
  });
  for (const [id, field] of [["student-writing", "writing"], ["student-name", "name"], ["teacher-name", "teacher"]]) document.getElementById(id).addEventListener("input", (event) => { state[field] = event.target.value; updateProgress(); });
  document.querySelector("#reset-lesson").addEventListener("click", () => {
    if (!confirm("Reset lesson progress?")) return;
    state = defaults();
    state.wordOrder = window.myeEnsureShuffledOrder(gapWords);
    render();
  });
  render();
})();
