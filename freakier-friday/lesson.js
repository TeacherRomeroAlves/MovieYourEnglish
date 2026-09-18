(function () {
  const storageKey = "mye-freakier-friday-v1";
  const plot = [
    ["plot", "Based on the trailer and your knowledge, which plot is correct?", [
      "Two women decide to switch bodies with their grandchildren. Now they will have a crazy day.",
      "Last year a mom and a daughter switched bodies; now they switch bodies with their husbands.",
      "Some years after a mom and a daughter switched bodies, it happens again. But this time the problem is bigger."
    ], 2, "Get ready for a freaky experience!", [
      "They do not decide to switch, and the other girls are not their grandchildren.",
      "They do not switch bodies with their husbands."
    ]]
  ];
  const vocabulary = [
    ["freaky", "______ means strange, unusual, or scary.", ["Week", "Friday", "Freaky", "Weak"], 2, "Can you tell me something that is freaky?"],
    ["british", "My neighbor is a _______ man who was born in London.", ["Japanese", "Brazilian", "British", "German"], 2, "Do you know anyone British?"],
    ["stepsisters", "Stepsisters are...", ["girls who become brothers because their parents marry each other.", "boys who become brothers because their parents marry each other.", "girls who become sisters because their parents marry each other.", "boys who become sisters because their parents marry each other."], 2, "Do you have any sisters?"],
    ["bachelorette", "They planned a _________ party with games and dancing for the bride before the ________.", ["farewell – graduation", "birthday – bachelorette", "bachelorette – wedding", "graduation – groom"], 2, "Are you married?"],
    ["sabotage", "The rockstar accused his bandmate of ________ after his guitar strings were mysteriously cut before the concert.", ["perform", "music", "sabotage", "concert"], 2, "Do you play any instruments?"],
    ["psychic", "A _________ is someone who claims to have special abilities to see the future.", ["psychiatrist", "psychologist", "psychic", "psychopath"], 2, "Do you believe in psychics?"]
  ];
  const before = [...plot, ...vocabulary];
  const after = [
    ["tess", "What is Tess's profession?", ["She is a pickleball player.", "She is Pink Slip's singer.", "She is a therapist."], 2, "Is it a good profession?"],
    ["girls", "Do Lily and Harper have a good relationship?", ["No, because they had problems during a math project.", "Yes, they love each other because they are family.", "No, they hate each other."], 2, "Why?"],
    ["party", "What happens at Anna's bachelorette party?", ["Lily and Harper switch bodies with their best friends at school.", "Anna and Tess switch bodies with each other for the first time.", "Anna, Tess, Lily and Harper switch bodies after talking to a psychic."], 2, "Is it the first time?"],
    ["jake", "Who's Jake?", ["Lily's father.", "Anna's fiancé.", "Anna's first love."], 2, "And who is Eric?"],
    ["wedding", "Why are the girls upset with their parents' wedding?", ["They think it is not a good idea for the band.", "They want to continue as stepsisters.", "They do not want each other as stepsisters."], 2, "What do their parents think about this?"],
    ["change", "When do the girls change back?", ["During the concert, when Eric discovers the secret.", "Before Tess's concert, when they understand each other.", "After the concert, when they understand and make peace with each other."], 2, "Whose concert?"]
  ];
  const scene = [
    ["grandmother", "Harper switched bodies with her grandmother.", ["True", "False"], 1, "Who switched with whom?"],
    ["happy", "Everybody is happy with the switch.", ["True", "False"], 1, "Who is the saddest person?"],
    ["incontinence", "The older woman has urinary incontinence.", ["False", "True"], 1, "How do you know?"]
  ];
  const during = [
    "Is it a normal day in the movie? Why or why not?",
    "Who are Anna and Tess Coleman? Are they family or friends? Do they have a normal connection?",
    "Who are Harper and Lily? What is their plan, and why?",
    "Who are Jake and Eric?",
    "What do the people learn from the experience?"
  ];
  // Normalized coordinates keep the seven words connected without accidental crossings.
  const crosswordWords = [
    { number: 1, word: "MONDAY", row: 0, col: 4, direction: "down", clue: "The day after Sunday." },
    { number: 2, word: "FRIDAY", row: 0, col: 9, direction: "down", clue: "The day before Saturday." },
    { number: 3, word: "THURSDAY", row: 2, col: 6, direction: "down", clue: "The day after Wednesday." },
    { number: 4, word: "SATURDAY", row: 4, col: 3, direction: "across", clue: "The day after Friday." },
    { number: 5, word: "WEDNESDAY", row: 7, col: 4, direction: "across", clue: "The day in the middle of the workweek." },
    { number: 6, word: "TUESDAY", row: 9, col: 0, direction: "across", clue: "The day after Monday." },
    { number: 7, word: "SUNDAY", row: 9, col: 3, direction: "down", clue: "The day before Monday." }
  ];
  const cellKey = (row, col) => `${row}-${col}`;
  const cellsFor = (entry) => [...entry.word].map((_, index) => cellKey(entry.row + (entry.direction === "down" ? index : 0), entry.col + (entry.direction === "across" ? index : 0)));
  const cellWords = new Map();
  crosswordWords.forEach((entry) => cellsFor(entry).forEach((key) => cellWords.set(key, [...(cellWords.get(key) || []), entry.number])));
  const defaults = () => ({ before: {}, after: {}, scene: {}, during: [], crossword: {}, writing: "", name: "", teacher: "", orders: {}, wrong: {} });
  let state;
  try { state = { ...defaults(), ...JSON.parse(localStorage.getItem(storageKey) || "{}") }; } catch { state = defaults(); }
  for (const group of ["before", "after", "scene", "crossword", "orders", "wrong"]) state[group] ||= {};
  state.during ||= [];
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
  let activeWord = 1;
  const solved = (entry) => cellsFor(entry).every((key, index) => state.crossword[key] === entry.word[index]);
  function updateCrossword() {
    const solvedWords = crosswordWords.filter(solved);
    document.querySelectorAll("[data-crossword-clue]").forEach((button) => {
      const entry = crosswordWords.find((word) => word.number === Number(button.dataset.crosswordClue));
      button.classList.toggle("is-complete", solved(entry));
      button.classList.toggle("is-active", activeWord === entry.number);
      button.setAttribute("aria-pressed", String(activeWord === entry.number));
    });
    document.querySelectorAll(".crossword-cell input").forEach((input) => {
      const key = input.dataset.cell;
      input.closest(".crossword-cell").classList.toggle("is-complete", (cellWords.get(key) || []).some((number) => solved(crosswordWords.find((word) => word.number === number))));
    });
    document.querySelector("#crossword-feedback").textContent = solvedWords.length === 7 ? "Excellent! You found all seven days." : `${solvedWords.length} / 7 days complete. Select a clue to fill its squares.`;
  }
  function renderCrossword() {
    const starts = new Map(crosswordWords.map((entry) => [cellKey(entry.row, entry.col), entry.number]));
    const grid = document.querySelector("#crossword-grid");
    grid.innerHTML = Array.from({ length: 15 }, (_, row) => Array.from({ length: 13 }, (_, col) => {
      const key = cellKey(row, col);
      if (!cellWords.has(key)) return '<span class="crossword-cell is-empty" aria-hidden="true"></span>';
      const number = starts.get(key);
      return `<label class="crossword-cell">${number ? `<span class="crossword-number" aria-hidden="true">${number}</span>` : ""}<input type="text" inputmode="text" autocapitalize="characters" autocomplete="off" spellcheck="false" maxlength="1" data-cell="${key}" aria-label="Row ${row + 1}, column ${col + 1}${number ? `, clue ${number}` : ""}" value="${state.crossword[key] || ""}"></label>`;
    }).join("")).join("");
    document.querySelector("#crossword-clues").innerHTML = ["across", "down"].map((direction) => `<div><h3>${direction === "across" ? "Across" : "Down"}</h3>${crosswordWords.filter((entry) => entry.direction === direction).map((entry) => `<button class="crossword-clue" type="button" data-crossword-clue="${entry.number}" aria-pressed="false"><strong>${entry.number}.</strong> ${entry.clue} <span>${entry.word.length} letters</span></button>`).join("")}</div>`).join("");
    updateCrossword();
  }
  function focusWord(number) {
    const entry = crosswordWords.find((word) => word.number === number);
    if (!entry) return;
    activeWord = number;
    updateCrossword();
    const firstUnfilled = cellsFor(entry).find((key) => !state.crossword[key]);
    gridInput(firstUnfilled || cellsFor(entry)[0])?.focus();
  }
  const gridInput = (key) => document.querySelector(`#crossword-grid input[data-cell="${key}"]`);
  function updateProgress() {
    const correct = [["before", before], ["after", after], ["scene", scene]].reduce((count, [group, questions]) => count + questions.filter((question) => state[group][question[0]] === question[3]).length, 0);
    const done = correct + crosswordWords.filter(solved).length + state.during.length + (state.writing.trim().length >= 50 ? 1 : 0);
    document.querySelector("#progress-label").textContent = `${done} / 29 complete`;
    document.querySelector("#progress-bar").style.width = `${done / 29 * 100}%`;
    document.querySelector("#writing-feedback").textContent = state.writing.trim().length >= 50 ? "Writing task complete." : "Write at least 50 characters to complete this activity.";
    save();
  }
  function render() {
    renderQuiz("#before-questions", before, "before");
    renderQuiz("#after-questions", after, "after");
    renderQuiz("#scene-questions", scene, "scene");
    renderCrossword();
    document.querySelector("#during-checklist").innerHTML = during.map((question, index) => `<button class="watch-item ${state.during.includes(index) ? "done" : ""}" type="button" data-during="${index}"><span>${state.during.includes(index) ? "✓" : "○"}</span>${question}</button>`).join("");
    for (const [id, value] of [["student-writing", state.writing], ["student-name", state.name], ["teacher-name", state.teacher]]) document.getElementById(id).value = value;
    updateProgress();
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
      updateProgress();
      return;
    }
    const clue = event.target.closest("[data-crossword-clue]");
    if (clue) { focusWord(Number(clue.dataset.crosswordClue)); return; }
    const watch = event.target.closest("[data-during]");
    if (watch) {
      const index = Number(watch.dataset.during);
      state.during = state.during.includes(index) ? state.during.filter((value) => value !== index) : [...state.during, index];
      document.querySelector("#during-checklist").innerHTML = during.map((question, position) => `<button class="watch-item ${state.during.includes(position) ? "done" : ""}" type="button" data-during="${position}"><span>${state.during.includes(position) ? "✓" : "○"}</span>${question}</button>`).join("");
      updateProgress();
    }
  });
  document.querySelector("#crossword-grid").addEventListener("focusin", (event) => {
    const key = event.target.dataset.cell;
    const choices = cellWords.get(key) || [];
    if (choices.length && !choices.includes(activeWord)) { activeWord = choices[0]; updateCrossword(); }
  });
  document.querySelector("#crossword-grid").addEventListener("input", (event) => {
    const input = event.target.closest("input[data-cell]");
    if (!input) return;
    const key = input.dataset.cell;
    const letter = input.value.replace(/[^a-z]/gi, "").slice(-1).toUpperCase();
    input.value = letter;
    if (letter) state.crossword[key] = letter; else delete state.crossword[key];
    updateCrossword();
    updateProgress();
    if (letter) {
      const entry = crosswordWords.find((word) => word.number === activeWord);
      const keys = cellsFor(entry);
      const next = keys[keys.indexOf(key) + 1];
      if (next) gridInput(next)?.focus();
    }
  });
  document.querySelector("#crossword-grid").addEventListener("keydown", (event) => {
    const input = event.target.closest("input[data-cell]");
    if (!input || event.key !== "Backspace" || input.value) return;
    const entry = crosswordWords.find((word) => word.number === activeWord);
    const keys = cellsFor(entry);
    const previous = keys[keys.indexOf(input.dataset.cell) - 1];
    if (previous) { event.preventDefault(); gridInput(previous)?.focus(); }
  });
  for (const [id, field] of [["student-writing", "writing"], ["student-name", "name"], ["teacher-name", "teacher"]]) {
    document.getElementById(id).addEventListener("input", (event) => { state[field] = event.target.value; updateProgress(); });
  }
  document.querySelector("#reset-lesson").addEventListener("click", () => {
    if (!confirm("Reset lesson progress?")) return;
    state = defaults();
    render();
  });
  render();
})();
