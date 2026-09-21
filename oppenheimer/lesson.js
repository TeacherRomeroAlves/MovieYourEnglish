(function () {
  const storageKey = "mye-oppenheimer-v1";
  const totalActivities = 25;
  const before = [
    ["plot", "Based on the trailer and your knowledge, which plot is correct?", [
      "During World War I, Robert Oppenheimer works alone on a bomb project but decides not to explode it because of his wife.",
      "During World War II, an army general appoints physicist J. Robert Oppenheimer to a top-secret project. Oppenheimer and a team of scientists spend years developing the atomic bomb, forever changing history.",
      "During World War II, a lieutenant secretly makes Oppenheimer's team build an atomic bomb to use in Germany without telling the scientists what they are creating."
    ], 1, "Get ready for an explosive experience!", [
      "The project took place during World War II. Oppenheimer did not work alone, and the bomb was tested.",
      "",
      "The scientists knew what they were building, and the atomic bombs were not dropped on Germany."
    ]],
    ["physicist", "Oppenheimer is a ________.", ["physician", "teacher", "physicist", "physical"], 2, "Do you like physics?"],
    ["nazi", "A member of the National Socialist Party led by Adolf Hitler was called a ________.", ["Nazism", "Buddhist", "Nazi", "soldier"], 2, "Are there still Nazis nowadays?"],
    ["bomb", "An ________ is an explosive device that gets its destructive force from nuclear reactions.", ["cannonball", "machine gun", "atomic bomb", "grenade"], 2, "Is it a common weapon in the world?"],
    ["trial", "The process in a court of law used to decide whether a person is guilty is called a ________.", ["judge", "jury", "trial", "witness"], 2, "Do you remember any iconic trials?"],
    ["classified", "A top-secret military project is ________.", ["available", "uncovered", "classified", "isolated"], 2, "Are there any classified documents at your company?"]
  ];
  const after = [
    ["purpose", "What was the main purpose of the Manhattan Project in the film?", ["To develop a new airplane for carrying a nuclear bomb.", "To produce atomic energy for a minor explosion.", "To create a powerful weapon to end World War II."], 2, "Who were the scientists competing with?"],
    ["location", "Where did the atomic bomb test take place?", ["Los Alamos, New Mexico.", "Tokyo, Japan.", "The Trinity Test Site in New Mexico."], 2, "Trinity was located more than 200 miles from Los Alamos."],
    ["test", "How was the atomic bomb tested in the film?", ["It was dropped from an airplane onto a city.", "It was buried underground in the desert.", "It was detonated from a tower in the desert."], 2, "How were the bombs dropped in Japan?"],
    ["accused", "What specific act was Oppenheimer accused of?", ["Sabotaging the project.", "Killing thousands of innocent people with the atomic bomb.", "Spying and sharing secrets about the atomic bomb."], 2, "Some military officials believed Oppenheimer was a Soviet spy. What do you think?"],
    ["guilt", "How did Oppenheimer feel about the consequences of the bombings in Japan?", ["Extremely proud and excited.", "Completely indifferent.", "Haunted by guilt and regret."], 2, "The film shows his uncertainty about what he helped create. Can you understand him?"]
  ];
  const scene = [
    ["cost", "The bomb project was short and inexpensive.", ["True", "False"], 1, "General Groves says they spent three years and two billion dollars on the project."],
    ["world", "There is a great chance that the world will end during the test.", ["True", "False"], 1, "There is a theoretical chance, but it is near zero."],
    ["timing", "This scene takes place after the bomb was tested.", ["True", "False"], 1, "They are going to test the bomb in about two hours."]
  ];
  const during = [
    "What is the historical context of the movie?",
    "What is the Manhattan Project?",
    "Who are Lewis Strauss and Leslie Groves?",
    "Was it easy to build the bomb?",
    "Were the tests successful?",
    "Was Oppenheimer a good man?"
  ];
  const starterItems = [
    { id: "fedora", answer: "FEDORA", emoji: "🎩", label: "Accessory 1" },
    { id: "suit", answer: "SUIT", emoji: "🤵", label: "Clothing 2" },
    { id: "pipe", answer: "PIPE", emoji: "🚬", label: "Object 3" },
    { id: "blue-eyes", answer: "BLUEEYES", emoji: "👁️", label: "Feature 4" }
  ];
  const defaults = () => ({ before: {}, after: {}, scene: {}, during: [], starterLetters: {}, starterOrder: {}, solvedStarter: {}, writing: "", name: "", teacher: "", orders: {}, wrong: {} });
  let state;
  try { state = { ...defaults(), ...JSON.parse(localStorage.getItem(storageKey) || "{}") }; } catch { state = defaults(); }
  for (const field of ["before", "after", "scene", "starterLetters", "starterOrder", "solvedStarter", "orders", "wrong"]) state[field] ||= {};
  state.during ||= [];
  const save = () => localStorage.setItem(storageKey, JSON.stringify(state));
  const optionOrder = (group, question) => {
    const key = `${group}-${question[0]}`;
    return state.orders[key] = window.myeEnsureShuffledOrder(question[2].map((_, index) => index), state.orders[key]);
  };
  function letterOrder(item) {
    const indexes = [...item.answer].map((_, index) => index);
    let order = window.myeEnsureShuffledOrder(indexes, state.starterOrder[item.id]);
    if (order.map((index) => item.answer[index]).join("") === item.answer) order = [...order.slice(1), order[0]];
    state.starterOrder[item.id] = order;
    return order;
  }
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
  function renderStarter() {
    document.querySelector("#starter-puzzle").innerHTML = starterItems.map((item) => {
      const selected = state.starterLetters[item.id] || [];
      const solved = Boolean(state.solvedStarter[item.id]);
      const order = letterOrder(item);
      const incorrect = selected.length === item.answer.length && !solved;
      return `<article class="body-part-card ${solved ? "is-solved" : ""}"><div class="body-part-card-heading"><span class="body-part-emoji" aria-hidden="true">${item.emoji}</span><div><small>${item.label}</small><strong>${solved ? item.id === "blue-eyes" ? "Blue eyes" : item.id[0].toUpperCase() + item.id.slice(1) : `${item.answer.length} letters`}</strong></div></div><div class="body-part-answer" aria-label="Your answer for ${item.label}">${Array.from({ length: item.answer.length }, (_, slot) => `<button type="button" class="body-part-slot ${selected[slot] !== undefined ? "is-filled" : ""}" data-starter-remove="${item.id}" data-slot="${slot}" ${selected[slot] === undefined || solved ? "disabled" : ""}>${selected[slot] === undefined ? "_" : item.answer[selected[slot]]}</button>`).join("")}</div><div class="body-part-letters" aria-label="Scrambled letters">${order.map((index) => `<button type="button" class="body-part-letter" data-starter-add="${item.id}" data-letter-index="${index}" ${selected.includes(index) || solved ? "disabled" : ""}>${item.answer[index]}</button>`).join("")}</div><div class="body-part-actions"><button type="button" data-starter-undo="${item.id}" ${!selected.length || solved ? "disabled" : ""}>Undo</button><button type="button" data-starter-clear="${item.id}" ${!selected.length || solved ? "disabled" : ""}>Clear</button><span class="body-part-result ${incorrect ? "is-incorrect" : ""}" aria-live="polite">${solved ? "Solved ✓" : incorrect ? "Not quite—try again." : ""}</span></div></article>`;
    }).join("");
    const solved = Object.keys(state.solvedStarter).length;
    document.querySelector("#starter-feedback").textContent = solved === starterItems.length ? "Excellent! The starter pack is complete." : `${solved} / ${starterItems.length} anagrams solved.`;
  }
  function renderDuring() {
    document.querySelector("#during-checklist").innerHTML = during.map((question, index) => `<button class="watch-item ${state.during.includes(index) ? "done" : ""}" type="button" data-during="${index}"><span>${state.during.includes(index) ? "✓" : "○"}</span>${question}</button>`).join("");
  }
  function updateProgress() {
    const quizDone = [["before", before], ["after", after], ["scene", scene]].reduce((count, [group, questions]) => count + questions.filter((question) => state[group][question[0]] === question[3]).length, 0);
    const done = quizDone + Object.keys(state.solvedStarter).length + state.during.length + (state.writing.trim().length >= 50 ? 1 : 0);
    document.querySelector("#progress-label").textContent = `${done} / ${totalActivities} complete`;
    document.querySelector("#progress-bar").style.width = `${done / totalActivities * 100}%`;
    document.querySelector("#writing-feedback").textContent = state.writing.trim().length >= 50 ? "Writing task complete." : "Write at least 50 characters to complete this activity.";
    save();
  }
  function render() {
    renderQuiz("#before-questions", before, "before"); renderQuiz("#after-questions", after, "after"); renderQuiz("#scene-questions", scene, "scene");
    renderStarter(); renderDuring();
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
      updateProgress(); return;
    }
    const add = event.target.closest("[data-starter-add]");
    if (add) {
      const item = starterItems.find((candidate) => candidate.id === add.dataset.starterAdd);
      if (!item || state.solvedStarter[item.id]) return;
      const selected = state.starterLetters[item.id] || [];
      const index = Number(add.dataset.letterIndex);
      if (selected.length >= item.answer.length || selected.includes(index)) return;
      state.starterLetters[item.id] = [...selected, index];
      if (state.starterLetters[item.id].length === item.answer.length && state.starterLetters[item.id].map((value) => item.answer[value]).join("") === item.answer) state.solvedStarter[item.id] = true;
      renderStarter(); updateProgress(); return;
    }
    const remove = event.target.closest("[data-starter-remove]");
    if (remove) {
      const selected = state.starterLetters[remove.dataset.starterRemove] || [];
      state.starterLetters[remove.dataset.starterRemove] = selected.filter((_, index) => index !== Number(remove.dataset.slot));
      renderStarter(); updateProgress(); return;
    }
    const undo = event.target.closest("[data-starter-undo]");
    if (undo) { state.starterLetters[undo.dataset.starterUndo] = (state.starterLetters[undo.dataset.starterUndo] || []).slice(0, -1); renderStarter(); updateProgress(); return; }
    const clear = event.target.closest("[data-starter-clear]");
    if (clear) { state.starterLetters[clear.dataset.starterClear] = []; renderStarter(); updateProgress(); return; }
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
