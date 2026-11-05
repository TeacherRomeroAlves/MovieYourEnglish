// Reusable select-and-check vocabulary activity. Completion requires the exact answer set.
window.myeCreateVocabGrid = ({ host, answers, distractors, state, onChange }) => {
  const words = [...answers, ...distractors];
  const render = () => {
    const current = state();
    current.gridSelected ||= [];
    current.gridOrder = window.myeEnsureShuffledOrder(words, current.gridOrder);
    const chosen = new Set(current.gridSelected);
    host.innerHTML = `<div class="vocab-selection-grid" role="group" aria-label="Choose five Spider-Man terms">${current.gridOrder.map((word) => {
      const selected = chosen.has(word);
      const checked = current.gridChecked && selected;
      return `<button type="button" class="vocab-grid-word ${selected ? 'is-selected' : ''} ${checked ? answers.includes(word) ? 'is-correct' : 'is-wrong' : ''}" data-vocab-word="${word}" aria-pressed="${selected}" ${current.gridSolved ? 'disabled' : ''}>${word}</button>`;
    }).join('')}</div><div class="vocab-grid-actions"><p class="vocab-grid-status" role="status">${current.gridSolved ? 'Excellent! You found all five Spider-Man terms.' : current.gridChecked ? 'Some selected words do not fit. Change your selection and check again.' : `${chosen.size} / ${answers.length} selected. Choose five words, then check.`}</p><button type="button" class="vocab-grid-check" data-check-vocab ${chosen.size !== answers.length || current.gridSolved ? 'disabled' : ''}>${current.gridSolved ? 'Activity complete' : 'Check'}</button></div>`;
  };
  host.addEventListener('click', (event) => {
    const current = state();
    if (current.gridSolved) return;
    const word = event.target.closest('[data-vocab-word]');
    if (word) {
      const chosen = new Set(current.gridSelected);
      if (chosen.has(word.dataset.vocabWord)) chosen.delete(word.dataset.vocabWord);
      else if (chosen.size < answers.length) chosen.add(word.dataset.vocabWord);
      else return;
      current.gridSelected = [...chosen];
      current.gridChecked = false;
      render();
      host.querySelector(`[data-vocab-word="${word.dataset.vocabWord}"]`)?.focus({ preventScroll: true });
      onChange();
    } else if (event.target.closest('[data-check-vocab]') && current.gridSelected.length === answers.length) {
      current.gridChecked = true;
      current.gridSolved = answers.every((answer) => current.gridSelected.includes(answer));
      render();
      host.querySelector('[data-check-vocab]')?.focus({ preventScroll: true });
      onChange();
    }
  });
  return { render };
};
