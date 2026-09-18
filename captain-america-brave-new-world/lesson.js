(function () {
  const storageKey = "mye-captain-america-brave-new-world-v1";
  const before = [
    ["plot", "Based on the trailer and your knowledge, which plot is correct?", [
      "The new Captain America is in the middle of an international problem and must discover the reason behind it.",
      "After a secret operation in China, the new Captain America has to fight his biggest enemy: the Green Hulk!",
      "The new Captain America is causing a lot of problems for Japan's president. Now each wants to eliminate the other."
    ], 0, "Get ready for a lot of action!", [null, "There is no secret operation in China. What color is the Hulk in the trailer?", "Japan's president and Captain America do not have problems."]],
    ["president", "A _________ is the leader of a country.", ["senator", "prince", "president", "governor"], 2, "Who is the president of your country?"],
    ["japan", "Japan...", ["is a state in the United States.", "is a country in Africa.", "is a country in Asia.", "is a North American country."], 2, "Is it a beautiful country?"],
    ["captain", "A _________ is a person in charge of a group of soldiers.", ["cop", "cap", "captain", "president"], 2, "Is it easy to be a captain?"],
    ["marvel", "Adamantium and Vibranium are fictional metals from ________ Comics.", ["Dodge", "Apple", "Marvel", "Coca-Cola"], 2, "Do you know Marvel?"],
    ["scientist", "The _______ works in a _______ to find new medicines.", ["teacher – lab", "laboratorist – lab", "scientist – lab", "scientist – library"], 2, "Would you like to be a scientist?"],
    ["treaty", "The two countries signed a peace _______ to end the war.", ["tricky", "ship", "treaty", "paper"], 2, "Is it an important document?"],
    ["hulk", "The _______ is a Marvel superhero who is big, green, and super strong.", ["Falcon", "Captain America", "Hulk", "Iron Man"], 2, "Do you like Hulk?"]
  ];
  const after = [
    ["sam", "Who is Sam Wilson?", ["The Falcon", "The old Captain America", "The new Captain America"], 2, "Who were the old Captain America and the Falcon?"],
    ["ross", "Who is Thaddeus Ross?", ["The original Hulk", "The President of Japan", "The President of the United States"], 2, "Is he a good man?"],
    ["japan", "Why are the US and Japan fighting?", ["The Japanese president wants to kill Captain America.", "Ross became Hulk and destroyed Japanese ships.", "They disagree about a new, powerful material."], 2, "What is the material?"],
    ["camp", "What is Camp Echo One?", ["The lab where Ruth Bat-Seraph was born.", "The facility where Ross produced the Red Hulk.", "The place where Sterns planned his revenge."], 2, "Revenge against whom?"],
    ["control", "How did Sterns control the soldiers?", ["He used light and a lot of money.", "He used medication and a beautiful woman.", "He used cellphones and music."], 2, "What did he force Isaiah to do?"],
    ["red-hulk", "Will Red Hulk come back in the next movie?", ["No. His daughter killed him in the end.", "Definitely. Captain America did not arrest him.", "Maybe. But right now, he is in prison."], 2, "Is he okay with that decision?"]
  ];
  const scene = [
    ["avengers", "The president wants to restart the Avengers.", ["False", "True"], 1, "Do you like this idea?"],
    ["confused", "Captain America is confused by the president's idea.", ["False", "True"], 1, "Why?"],
    ["need", "Ross thinks Americans need the Avengers.", ["False", "True"], 1, "Why?"]
  ];
  const during = [
    "Who is Sam Wilson? Does he have powers? Does he have good friends?",
    "Who is Thaddeus Ross? Is he a good man? Why or why not?",
    "Why is Japan important to the story? What do they have?",
    "Who is Sterns? Is he smart?"
  ];
  const outfit = [
    ["goggles", "🥽 Goggles", "Protective glasses worn over the eyes."],
    ["shield", "🛡️ Shield", "An object used to block attacks."],
    ["backpack", "🎒 Backpack", "A bag carried on your back."],
    ["star", "⭐ Star", "A five-pointed symbol on the uniform and shield."],
    ["wristband", "⌚ Wristband", "A band worn around your wrist."],
    ["boots", "🥾 Boots", "Strong shoes that cover your feet and ankles."]
  ];
  const defaults = () => ({ before: {}, after: {}, scene: {}, during: [], matches: {}, matchOrder: [], writing: "", name: "", teacher: "", orders: {}, wrong: {} });
  let state;
  try { state = { ...defaults(), ...JSON.parse(localStorage.getItem(storageKey) || "{}") }; } catch { state = defaults(); }
  for (const field of ["before", "after", "scene", "matches", "orders", "wrong"]) state[field] ||= {};
  state.during ||= [];
  state.matchOrder = window.myeEnsureShuffledOrder(outfit.map((entry) => entry[0]), state.matchOrder);
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
  function renderOutfit() {
    const paired = new Set(Object.keys(state.matches));
    const pairColor = (id) => outfit.findIndex((entry) => entry[0] === id);
    document.querySelector("#outfit-terms").innerHTML = outfit.map(([id, label]) => `<button class="match-button term-button ${selectedTerm === id ? "selected" : ""} ${paired.has(id) ? "matched" : ""}" type="button" data-outfit-term="${id}" ${paired.has(id) ? `data-match-color="${pairColor(id)}" aria-disabled="true"` : ""}>${label}</button>`).join("");
    document.querySelector("#outfit-definitions").innerHTML = state.matchOrder.map((id) => {
      const definition = outfit.find((entry) => entry[0] === id)?.[2];
      return `<button class="match-button definition-button ${paired.has(id) ? "matched" : ""}" type="button" data-outfit-definition="${id}" ${paired.has(id) ? `data-match-color="${pairColor(id)}" aria-disabled="true"` : ""}>${definition}</button>`;
    }).join("");
    document.querySelector("#outfit-count").textContent = paired.size;
    if (paired.size === outfit.length) document.querySelector("#outfit-feedback").textContent = "Great work! You matched every part of Captain America's outfit.";
    else if (!selectedTerm) document.querySelector("#outfit-feedback").textContent = "Select an item, then its matching meaning.";
  }
  const progress = () => [["before", before], ["after", after], ["scene", scene]].reduce((count, [group, questions]) => count + questions.filter((question) => state[group][question[0]] === question[3]).length, 0) + Object.keys(state.matches).length + state.during.length + (state.writing.trim().length >= 50 ? 1 : 0);
  function updateProgress() {
    const done = progress();
    document.querySelector("#progress-label").textContent = `${done} / 28 complete`;
    document.querySelector("#progress-bar").style.width = `${done / 28 * 100}%`;
    document.querySelector("#writing-feedback").textContent = state.writing.trim().length >= 50 ? "Writing task complete." : "Write at least 50 characters to complete this activity.";
    save();
  }
  function renderDuring() {
    document.querySelector("#during-checklist").innerHTML = during.map((question, index) => `<button class="watch-item ${state.during.includes(index) ? "done" : ""}" type="button" data-during="${index}"><span>${state.during.includes(index) ? "✓" : "○"}</span>${question}</button>`).join("");
  }
  function render() {
    renderQuiz("#before-questions", before, "before");
    renderQuiz("#after-questions", after, "after");
    renderQuiz("#scene-questions", scene, "scene");
    renderOutfit(); renderDuring();
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
    const term = event.target.closest("[data-outfit-term]");
    if (term) {
      const id = term.dataset.outfitTerm;
      if (state.matches[id]) return;
      selectedTerm = selectedTerm === id ? "" : id;
      renderOutfit();
      return;
    }
    const definition = event.target.closest("[data-outfit-definition]");
    if (definition && selectedTerm) {
      const id = definition.dataset.outfitDefinition;
      if (state.matches[id]) return;
      if (id === selectedTerm) {
        state.matches[id] = true;
        selectedTerm = "";
        renderOutfit(); updateProgress();
      } else {
        document.querySelector("#outfit-feedback").textContent = "Not quite. Try another meaning.";
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
    state.matchOrder = window.myeEnsureShuffledOrder(outfit.map((entry) => entry[0]));
    selectedTerm = "";
    render();
  });
  render();
})();
