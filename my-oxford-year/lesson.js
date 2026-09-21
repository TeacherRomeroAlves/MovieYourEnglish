(function () {
  const storageKey = "mye-my-oxford-year-v1";
  const totalActivities = 28;
  const before = [
    ["plot", "Based on the trailer and your knowledge, which plot is correct?", [
      "An American student moves to Oxford, but her dream falls apart after she meets a British psychologist.",
      "An American student fulfills her dream of studying at Oxford, but she falls in love with a British man who is hiding something.",
      "An American professor starts studying at Cambridge and falls in love with a handsome British professor."
    ], 1, "Get ready for an emotional journey.", [
      "Oxford is a university, and Jamie is not a psychologist.",
      "",
      "Anna is a student, not a professor, and the university is Oxford rather than Cambridge."
    ]],
    ["library", "I borrowed three mystery novels from the ________ yesterday.", ["bookstore", "movies", "library", "TV"], 2, "Do you go to libraries?"],
    ["poetry", "She writes ________ to express her emotions about love and loss.", ["pantry", "poultry", "poetry", "pottery"], 2, "Do you like poetry?"],
    ["regret", "Regret is a feeling of...", ["remorse about something you saw at college.", "happiness about something you did or did not do.", "sadness or remorse about something you did or did not do.", "sadness only about something you did not do in life."], 2, "Is it easy to deal with regrets?"],
    ["castle", "A ________ is a large fortified building, typically built in the Middle Ages for nobility to live in.", ["pub", "fort", "castle", "cathedral"], 2, "Have you ever visited a castle?"],
    ["groupies", "The rock band was eating fish and chips when some excited ________ started asking for pictures.", ["parents", "kittens", "groupies", "professors"], 2, "Are you a big fan of anyone?"],
    ["punting", "________ is a popular tourist activity in Oxford during the summer.", ["Snowboarding", "Going to the beach", "Punting", "Visiting Big Ben"], 2, "Have you ever gone punting?"]
  ];
  const after = [
    ["mother", "How does Anna's mother feel about Anna going to Oxford?", ["She does not support Anna because Oxford is not a good university.", "She is upset because Anna is abandoning her.", "She is thrilled because Oxford is a great university."], 2, "Would your mother feel the same?"],
    ["choice", "Why did Anna choose Oxford?", ["Because she loves librarians and the way they speak.", "Because she loves flirting with handsome professors.", "Because she loves old books and being surrounded by them."], 2, "Do you like books too?"],
    ["jamie", "Who is Jamie?", ["A nerdy American student who loves poetry.", "Anna's classmate.", "A womanizer."], 2, "What does Jamie do for a living?"],
    ["eddie", "Who is Eddie?", ["Jamie’s sister's boyfriend.", "Jamie’s best friend.", "Jamie’s deceased brother."], 2, "How did Eddie die?"],
    ["father", "Why is Jamie not talking to his father?", ["Because Jamie has decided to go to the hospital.", "Because his father stopped his mother's treatment.", "Because Jamie has decided to stop his own treatment."], 2, "Do you agree with Jamie's decision?"],
    ["dream", "What did Anna and Jamie dream of doing together?", ["Going punting in Venice.", "Taking a trip around Africa.", "Going on a grand tour around Europe."], 2, "Why could they not do that together?"]
  ];
  const during = [
    "Who is Anna?",
    "Where will Anna study, and how does she feel about university?",
    "Is it easy for Anna to adapt to a new culture?",
    "Who is Jamie, and what does he do for a living?",
    "How is Jamie related to Eddie and Cecelia?",
    "What do Anna and Jamie dream of doing together?",
    "Does their dream come true?",
    "How does Anna change during her year at Oxford?"
  ];
  const words = [
    ["OXFORD", "🎓", "A historic university city in England."],
    ["CAMBRIDGE", "🚣", "Another famous English university city."],
    ["MANCHESTER", "🏙️", "A major city and university center in northern England."],
    ["GLASGOW", "🏴", "A large Scottish city with an ancient university."],
    ["EDINBURGH", "🏰", "Scotland's capital and home to a famous university."],
    ["LONDON", "🇬🇧", "The UK capital, home to several universities."]
  ];
  const placements = [[0, 1, "h"], [2, 1, "h"], [4, 1, "h"], [6, 1, "h"], [8, 1, "h"], [0, 11, "v"]];
  const grid = Array.from({ length: 12 }, () => Array(12).fill(""));
  const cells = {};
  words.forEach(([word], index) => {
    const [row, column, direction] = placements[index];
    cells[word] = [...word].map((letter, offset) => {
      const r = direction === "v" ? row + offset : row;
      const c = direction === "h" ? column + offset : column;
      grid[r][c] = letter;
      return `${r}-${c}`;
    });
  });
  const filler = "UNIVERSITYCOLLEGEBOOKSTUDYLEARNENGLAND";
  let fillerIndex = 0;
  grid.forEach((row) => row.forEach((letter, column) => { if (!letter) row[column] = filler[fillerIndex++ % filler.length]; }));
  const defaults = () => ({ before: {}, after: {}, during: [], words: [], writing: "", name: "", teacher: "", orders: {}, wrong: {} });
  let state;
  try { state = { ...defaults(), ...JSON.parse(localStorage.getItem(storageKey) || "{}") }; } catch { state = defaults(); }
  for (const field of ["before", "after", "orders", "wrong"]) state[field] ||= {};
  state.during ||= []; state.words ||= [];
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
  function renderWordSearch() {
    const found = new Set(state.words);
    document.querySelector("#word-grid").innerHTML = grid.map((row, r) => row.map((letter, c) => {
      const wordIndex = words.findIndex(([word]) => found.has(word) && cells[word].includes(`${r}-${c}`));
      return `<button class="letter ${wordIndex >= 0 ? `found color-${wordIndex % 4}` : ""}" data-cell="${r}-${c}" type="button" role="gridcell" aria-label="Letter ${letter}">${letter}</button>`;
    }).join("")).join("");
    document.querySelector("#word-list-items").innerHTML = words.map(([word, emoji, definition]) => `<li class="word-item ${found.has(word) ? "is-found" : ""}"><span class="word-emoji">${emoji}</span><span><strong>${word}</strong><small>${definition}</small></span><span>${found.has(word) ? "✓" : ""}</span></li>`).join("");
  }
  function renderDuring() {
    document.querySelector("#during-checklist").innerHTML = during.map((question, index) => `<button class="watch-item ${state.during.includes(index) ? "done" : ""}" type="button" data-during="${index}"><span>${state.during.includes(index) ? "✓" : "○"}</span>${question}</button>`).join("");
  }
  function updateProgress() {
    const quizDone = [["before", before], ["after", after]].reduce((count, [group, questions]) => count + questions.filter((question) => state[group][question[0]] === question[3]).length, 0);
    const done = quizDone + state.words.length + state.during.length + (state.writing.trim().length >= 50 ? 1 : 0);
    document.querySelector("#progress-label").textContent = `${done} / ${totalActivities} complete`;
    document.querySelector("#progress-bar").style.width = `${done / totalActivities * 100}%`;
    document.querySelector("#writing-feedback").textContent = state.writing.trim().length >= 50 ? "Writing task complete." : "Write at least 50 characters to complete this activity.";
    save();
  }
  function render() {
    renderQuiz("#before-questions", before, "before"); renderQuiz("#after-questions", after, "after"); renderWordSearch(); renderDuring();
    for (const [id, value] of [["student-writing", state.writing], ["student-name", state.name], ["teacher-name", state.teacher]]) document.getElementById(id).value = value;
    updateProgress();
  }
  document.addEventListener("click", (event) => {
    const answer = event.target.closest("[data-group][data-answer]");
    if (answer) {
      const { group, id } = answer.dataset;
      const questions = group === "before" ? before : after;
      const question = questions.find((item) => item[0] === id);
      const choice = Number(answer.dataset.answer);
      if (state[group][id] === question[3]) return;
      state[group][id] = choice;
      if (choice !== question[3]) {
        const key = `${group}-${id}`;
        state.wrong[key] = [...new Set([...(state.wrong[key] || []), choice])];
      }
      renderQuiz(group === "before" ? "#before-questions" : "#after-questions", questions, group); updateProgress(); return;
    }
    const letter = event.target.closest("[data-cell]");
    if (letter) {
      const match = words.find(([word]) => cells[word].includes(letter.dataset.cell) && !state.words.includes(word));
      if (match) state.words.push(match[0]);
      renderWordSearch(); updateProgress(); return;
    }
    const watch = event.target.closest("[data-during]");
    if (watch) {
      const index = Number(watch.dataset.during);
      state.during = state.during.includes(index) ? state.during.filter((value) => value !== index) : [...state.during, index];
      renderDuring(); updateProgress();
    }
  });
  for (const [id, field] of [["student-writing", "writing"], ["student-name", "name"], ["teacher-name", "teacher"]]) document.getElementById(id).addEventListener("input", (event) => { state[field] = event.target.value; updateProgress(); });
  document.querySelector("#reset-lesson").addEventListener("click", () => { if (confirm("Reset lesson progress?")) { state = defaults(); render(); } });
  render();
})();
