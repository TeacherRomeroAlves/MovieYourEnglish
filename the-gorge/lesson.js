(function () {
  const storageKey = "mye-the-gorge-v1";
  const before = [
    ["plot", "Based on the trailer and your knowledge, which plot is correct?", [
      "Two special agents guard opposite sides of a beautiful and calm gorge. After an accident, they are forced to hunt each other.",
      "Two siblings guard opposite sides of a mysterious gorge and work together to protect forest animals.",
      "Two agents guard opposite sides of a mysterious gorge. When an evil emerges, they must work together to survive."
    ], 2, "Get ready for a great adventure!", [
      "They are not enemies, and the gorge is not calm.",
      "They are not siblings, and protecting animals is not their mission."
    ]],
    ["gorge", "A _______ is a deep and narrow valley.", ["River", "Peninsula", "Gorge", "Mountain"], 2, "Do you know any examples of gorges?"],
    ["sniper", "A sniper is...", ["a trained shooter who uses a pistol to hit targets from a long distance.", "a trained shooter who uses a rifle to hit targets from a short distance.", "a trained shooter who uses a rifle to hit targets from a long distance.", "a trained shooter who uses a pistol to hit targets from a short distance."], 2, "Would you like to be a sniper?"],
    ["secret", "The government's ________ remained classified for years.", ["project planner", "police officer", "secret project", "public project"], 2, "Have you ever heard any rumors about secret projects?"],
    ["hollow", "The tree trunk was _______, and a small bird lived inside it.", ["whole", "halo", "hollow", "hole"], 2, "Can you mention one object that is hollow inside?"],
    ["mutation", "A mutation is...", ["the structure of genes or DNA.", "a change in the structure of hair and nails.", "a change in the structure of genes or DNA.", "a person's DNA in its original form."], 2, "Can you mention famous cinema mutants?"],
    ["zipline", "A _______ is a cable stretched between two points that a person can slide along.", ["outline", "lipline", "zipline", "airline"], 2, "Have you ever gone ziplining?"]
  ];
  const after = [
    ["agents", "Who are Drasa and Levi?", ["A couple deeply in love since adolescence.", "Cousins born in different countries.", "Snipers from different backgrounds."], 2, "Do they have anything else in common?"],
    ["guard", "Why are Levi and Drasa guarding the gorge?", ["To help the mutants climb.", "To protect what is inside.", "To stop the monsters."], 2, "Is it easy?"],
    ["hollow-men", "Who are the Hollow Men?", ["Men who have nothing inside their heads.", "Mutants who study at a school.", "Monstrous creatures in the gorge."], 2, "Are they scary?"],
    ["dinner", "Why does Levi zipline across the gorge?", ["To fix the automated guns and explosive mines.", "To save Drasa's father.", "To have dinner with Drasa."], 2, "Was it a good decision? Did he return?"],
    ["bottom", "What do they discover at the bottom of the gorge?", ["Soldiers from the past are planning to explode the gorge.", "Humans and animals mixed their DNA in an explosion.", "Humans suffered mutations because of experiments."], 2, "Who were the Hollow Men?"],
    ["towers", "Why do Drasa and Levi leave the towers at the end?", ["To go to the Caribbean, open a restaurant, and live happily.", "Because they set a trap to destroy the government.", "Because they set up an explosion to destroy everything in the gorge."], 2, "Did they meet again after the explosion?"]
  ];
  const during = [
    "Who are Levi and Drasa? What do they do, and what do they have in common?",
    "Why are they at the gorge? Do they have a good time there?",
    "What is happening at the bottom of the gorge? Can they do something to help?",
    "Does the movie have a happy ending?"
  ];
  const landscapes = [
    ["gorge", "🏞️ Gorge", "A deep, narrow valley with steep sides."],
    ["valley", "🌄 Valley", "Low land between hills or mountains."],
    ["peninsula", "🗺️ Peninsula", "Land with water on three sides."],
    ["cliff", "🪨 Cliff", "A very steep wall of rock."],
    ["mountain", "⛰️ Mountain", "A very high area of land."]
  ];
  const defaults = () => ({ before: {}, after: {}, during: [], matches: {}, matchOrder: [], writing: "", name: "", teacher: "", orders: {}, wrong: {} });
  let state;
  try { state = { ...defaults(), ...JSON.parse(localStorage.getItem(storageKey) || "{}") }; } catch { state = defaults(); }
  for (const field of ["before", "after", "matches", "orders", "wrong"]) state[field] ||= {};
  state.during ||= [];
  state.matchOrder = window.myeEnsureShuffledOrder(landscapes.map(([id]) => id), state.matchOrder);
  let selectedTerm = "";
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
  function renderMatching() {
    const paired = new Set(Object.keys(state.matches));
    const pairColor = (id) => landscapes.findIndex(([term]) => term === id);
    document.querySelector("#landscape-terms").innerHTML = landscapes.map(([id, label]) => `<button class="match-button term-button ${selectedTerm === id ? "selected" : ""} ${paired.has(id) ? "matched" : ""}" type="button" data-landscape-term="${id}" ${paired.has(id) ? `data-match-color="${pairColor(id)}" aria-disabled="true"` : ""}>${label}</button>`).join("");
    document.querySelector("#landscape-definitions").innerHTML = state.matchOrder.map((id) => {
      const definition = landscapes.find(([term]) => term === id)?.[2];
      return `<button class="match-button definition-button ${paired.has(id) ? "matched" : ""}" type="button" data-landscape-definition="${id}" ${paired.has(id) ? `data-match-color="${pairColor(id)}" aria-disabled="true"` : ""}>${definition}</button>`;
    }).join("");
    document.querySelector("#landscape-count").textContent = paired.size;
    document.querySelector("#landscape-feedback").textContent = paired.size === landscapes.length ? "Excellent! You matched all five landscape words." : "Select a word, then its matching meaning.";
  }
  function renderDuring() {
    document.querySelector("#during-checklist").innerHTML = during.map((question, index) => `<button class="watch-item ${state.during.includes(index) ? "done" : ""}" type="button" data-during="${index}"><span>${state.during.includes(index) ? "✓" : "○"}</span>${question}</button>`).join("");
  }
  function updateProgress() {
    const quizDone = [["before", before], ["after", after]].reduce((count, [group, questions]) => count + questions.filter((question) => state[group][question[0]] === question[3]).length, 0);
    const done = quizDone + Object.keys(state.matches).length + state.during.length + (state.writing.trim().length >= 50 ? 1 : 0);
    document.querySelector("#progress-label").textContent = `${done} / 23 complete`;
    document.querySelector("#progress-bar").style.width = `${done / 23 * 100}%`;
    document.querySelector("#writing-feedback").textContent = state.writing.trim().length >= 50 ? "Writing task complete." : "Write at least 50 characters to complete this activity.";
    save();
  }
  function render() {
    renderQuiz("#before-questions", before, "before");
    renderQuiz("#after-questions", after, "after");
    renderMatching(); renderDuring();
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
      renderQuiz(group === "before" ? "#before-questions" : "#after-questions", questions, group);
      updateProgress();
      return;
    }
    const term = event.target.closest("[data-landscape-term]");
    if (term) {
      const id = term.dataset.landscapeTerm;
      if (state.matches[id]) return;
      selectedTerm = selectedTerm === id ? "" : id;
      renderMatching();
      return;
    }
    const definition = event.target.closest("[data-landscape-definition]");
    if (definition && selectedTerm) {
      const id = definition.dataset.landscapeDefinition;
      if (state.matches[id]) return;
      if (id === selectedTerm) {
        state.matches[id] = true;
        selectedTerm = "";
        renderMatching(); updateProgress();
      } else {
        document.querySelector("#landscape-feedback").textContent = "Not quite. Try another meaning.";
      }
      return;
    }
    const watch = event.target.closest("[data-during]");
    if (watch) {
      const index = Number(watch.dataset.during);
      state.during = state.during.includes(index) ? state.during.filter((value) => value !== index) : [...state.during, index];
      renderDuring(); updateProgress();
    }
  });
  for (const [id, field] of [["student-writing", "writing"], ["student-name", "name"], ["teacher-name", "teacher"]]) {
    document.getElementById(id).addEventListener("input", (event) => { state[field] = event.target.value; updateProgress(); });
  }
  document.querySelector("#reset-lesson").addEventListener("click", () => {
    if (!confirm("Reset lesson progress?")) return;
    state = defaults();
    state.matchOrder = window.myeEnsureShuffledOrder(landscapes.map(([id]) => id));
    selectedTerm = "";
    render();
  });
  render();
})();
