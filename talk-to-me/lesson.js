(function () {
  const storageKey = "mye-talk-to-me-v1";
  const before = [
    ["plot", "Based on the trailer and your knowledge, which plot is correct?", [
      "A young boy uses psychic powers to conjure spirits. His best friend must save him and his family from the underworld.",
      "A girl discovers how to talk to spirits in a cemetery. Soon, her friends are haunted by terrifying spirits.",
      "A group of friends uses a special artifact to conjure spirits and accidentally unleashes terrifying supernatural forces."
    ], 2, "Be prepared for a scary horror movie!", [
      "A girl is the protagonist, and psychic powers are not involved.",
      "The mystery does not involve a cemetery."
    ]],
    ["embalmed", "An ________ hand has been treated with chemicals to prevent decay.", ["empalmed", "terrific", "embalmed", "zombie"], 2, "Have you ever seen an embalmed animal?"],
    ["possessed", "When a person is ________, a supernatural force or spirit is believed to control their body.", ["horrified", "possession", "possessed", "unstable"], 2, "Do you believe this is possible?"],
    ["soul", "The ________ is the spiritual part of a person. Some believe it continues after death.", ["ego", "mind", "soul", "demon"], 2, "Can you mention someone with a good soul?"],
    ["partygoer", "A partygoer is...", ["a person who bullies others.", "an interesting person who likes events.", "a person who goes to parties frequently.", "a person who never goes to parties."], 2, ""],
    ["conjure", "When you ________ a spirit, you summon it.", ["conquer", "buy", "conjure", "strike"], 2, "Do you believe in spirits?"]
  ];
  const after = [
    ["ritual", "How does the ritual work?", ["You say 'talk to me' three times in front of a mirror.", "You hold an ancient hand while your friends chant 'talk to me.'", "You hold a ceramic hand and say some words."], 2, "The words are 'talk to me.' Would you dare to participate?"],
    ["hand", "Who does the hand connect you to?", ["Demons in the underworld.", "Animal-like creatures from a parallel reality.", "Spirits of deceased people."], 2, "The hand is a bridge between two worlds."],
    ["riley", "What goes wrong during one of the rituals?", ["Two spirits possess Mia at the same time.", "An evil spirit possesses Jade.", "An evil spirit possesses Riley."], 2, "Riley is harmed while possessed. What should his friends do?"],
    ["hospital", "Why does Riley possibly hurt himself at the hospital?", ["He wants to meet his mother again.", "He is trying to help his sister and Mia.", "His soul cannot stand the suffering anymore."], 2, "Is it painful?"],
    ["father", "What happens to Mia's father?", ["He attacks Mia at home after a spirit possesses him.", "Mia attacks him with a knife after learning her mother is alive.", "Mia attacks him with scissors while hallucinating."], 2, "Mia injures her father. Is she responsible for her actions?"],
    ["future", "What can we infer about Mia's future?", ["She is dead and will live with her mother forever.", "She will probably be stuck at the hospital with malevolent souls.", "She will probably continue being part of the 'talk to me' ritual."], 2, "But now she is a spirit. Is it fair?"]
  ];
  const during = [
    "What is Mia's family situation? Is it simple?",
    "Why is the sentence 'Talk to me' important?",
    "Why do people want to participate in the game?",
    "Who is Riley? Why is he important?",
    "Who suffers most in the movie?"
  ];
  const parts = [
    { id: "hand", answer: "HAND", emoji: "👋" },
    { id: "foot", answer: "FOOT", emoji: "🦶" },
    { id: "head", answer: "HEAD", emoji: "👤" },
    { id: "elbow", answer: "ELBOW", emoji: "💪" },
    { id: "finger", answer: "FINGER", emoji: "☝️" },
    { id: "eyes", answer: "EYES", emoji: "👀" }
  ];
  const defaults = () => ({ before: {}, after: {}, during: [], partLetters: {}, partOrder: {}, solvedParts: {}, writing: "", name: "", teacher: "", orders: {}, wrong: {} });
  let state;
  try { state = { ...defaults(), ...JSON.parse(localStorage.getItem(storageKey) || "{}") }; } catch { state = defaults(); }
  for (const field of ["before", "after", "partLetters", "partOrder", "solvedParts", "orders", "wrong"]) state[field] ||= {};
  state.during ||= [];
  const save = () => localStorage.setItem(storageKey, JSON.stringify(state));
  const optionOrder = (group, question) => {
    const key = `${group}-${question[0]}`;
    return state.orders[key] = window.myeEnsureShuffledOrder(question[2].map((_, index) => index), state.orders[key]);
  };
  function letterOrder(part) {
    const indexes = [...part.answer].map((_, index) => index);
    let order = window.myeEnsureShuffledOrder(indexes, state.partOrder[part.id]);
    if (order.map((index) => part.answer[index]).join("") === part.answer) order = [...order.slice(1), order[0]];
    state.partOrder[part.id] = order;
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
      const feedback = answer === undefined ? "" : isCorrect ? `Correct.${comment ? ` ${comment}` : ""}` : (wrongComments?.[answer] || "Not quite. Try another answer.");
      return `<div class="question-slide"><p class="slide-number">Question ${position + 1} of ${questions.length}</p><article class="question-card ${isCorrect ? "is-correct" : ""}"><p class="question-text">${prompt}</p><div class="answer-options">${optionOrder(group, question).map((index, label) => `<button class="answer-choice ${answer === index ? "selected" : ""} ${wrong.includes(index) ? "was-wrong" : ""}" type="button" data-group="${group}" data-id="${id}" data-answer="${index}"><span>${String.fromCharCode(65 + label)}</span>${choices[index]}</button>`).join("")}</div><p class="question-feedback" aria-live="polite">${feedback}</p></article></div>`;
    }).join("")}</div></div>`;
    host.querySelector(".question-carousel").scrollLeft = scroll;
  }
  function renderParts() {
    document.querySelector("#body-part-puzzle").innerHTML = parts.map((part, position) => {
      const selected = state.partLetters[part.id] || [];
      const solved = Boolean(state.solvedParts[part.id]);
      const order = letterOrder(part);
      const attempt = selected.map((index) => part.answer[index]).join("");
      const incorrect = selected.length === part.answer.length && !solved;
      return `<article class="body-part-card ${solved ? "is-solved" : ""}"><div class="body-part-card-heading"><span class="body-part-emoji" aria-hidden="true">${part.emoji}</span><div><small>Body part ${position + 1}</small><strong>${solved ? "Correct!" : `${part.answer.length} letters`}</strong></div></div><div class="body-part-answer" aria-label="Your answer for body part ${position + 1}">${Array.from({ length: part.answer.length }, (_, slot) => `<button type="button" class="body-part-slot ${selected[slot] !== undefined ? "is-filled" : ""}" data-part-remove="${part.id}" data-slot="${slot}" ${selected[slot] === undefined || solved ? "disabled" : ""} aria-label="${selected[slot] === undefined ? "Empty letter" : `Remove letter ${part.answer[selected[slot]]}`}">${selected[slot] === undefined ? "_" : part.answer[selected[slot]]}</button>`).join("")}</div><div class="body-part-letters" aria-label="Scrambled letters">${order.map((index) => `<button type="button" class="body-part-letter" data-part-add="${part.id}" data-letter-index="${index}" ${selected.includes(index) || solved ? "disabled" : ""} aria-label="Add letter ${part.answer[index]}">${part.answer[index]}</button>`).join("")}</div><div class="body-part-actions"><button type="button" data-part-undo="${part.id}" ${!selected.length || solved ? "disabled" : ""}>Undo</button><button type="button" data-part-clear="${part.id}" ${!selected.length || solved ? "disabled" : ""}>Clear</button><span class="body-part-result ${incorrect ? "is-incorrect" : ""}" aria-live="polite">${solved ? "Solved ✓" : incorrect ? "Not quite—try again." : ""}</span></div></article>`;
    }).join("");
    const count = Object.keys(state.solvedParts).length;
    document.querySelector("#body-part-feedback").textContent = count === parts.length ? "Excellent! You found all six body parts." : `${count} / ${parts.length} body parts solved.`;
  }
  function renderDuring() {
    document.querySelector("#during-checklist").innerHTML = during.map((question, index) => `<button class="watch-item ${state.during.includes(index) ? "done" : ""}" type="button" data-during="${index}"><span>${state.during.includes(index) ? "✓" : "○"}</span>${question}</button>`).join("");
  }
  function updateProgress() {
    const quizDone = [["before", before], ["after", after]].reduce((count, [group, questions]) => count + questions.filter((question) => state[group][question[0]] === question[3]).length, 0);
    const done = quizDone + Object.keys(state.solvedParts).length + state.during.length + (state.writing.trim().length >= 50 ? 1 : 0);
    document.querySelector("#progress-label").textContent = `${done} / 24 complete`;
    document.querySelector("#progress-bar").style.width = `${done / 24 * 100}%`;
    document.querySelector("#writing-feedback").textContent = state.writing.trim().length >= 50 ? "Writing task complete." : "Write at least 50 characters to complete this activity.";
    save();
  }
  function render() {
    renderQuiz("#before-questions", before, "before");
    renderQuiz("#after-questions", after, "after");
    renderParts(); renderDuring();
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
    const add = event.target.closest("[data-part-add]");
    if (add) {
      const part = parts.find((item) => item.id === add.dataset.partAdd);
      if (!part || state.solvedParts[part.id]) return;
      const selected = state.partLetters[part.id] || [];
      if (selected.length >= part.answer.length) return;
      const index = Number(add.dataset.letterIndex);
      if (selected.includes(index)) return;
      state.partLetters[part.id] = [...selected, index];
      if (state.partLetters[part.id].length === part.answer.length && state.partLetters[part.id].map((value) => part.answer[value]).join("") === part.answer) state.solvedParts[part.id] = true;
      renderParts(); updateProgress();
      return;
    }
    const remove = event.target.closest("[data-part-remove]");
    if (remove) {
      const selected = state.partLetters[remove.dataset.partRemove] || [];
      state.partLetters[remove.dataset.partRemove] = selected.filter((_, index) => index !== Number(remove.dataset.slot));
      renderParts(); updateProgress();
      return;
    }
    const undo = event.target.closest("[data-part-undo]");
    if (undo) {
      state.partLetters[undo.dataset.partUndo] = (state.partLetters[undo.dataset.partUndo] || []).slice(0, -1);
      renderParts(); updateProgress();
      return;
    }
    const clear = event.target.closest("[data-part-clear]");
    if (clear) {
      state.partLetters[clear.dataset.partClear] = [];
      renderParts(); updateProgress();
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
    render();
  });
  render();
})();
