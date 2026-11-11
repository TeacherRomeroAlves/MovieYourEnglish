// Shared clue-first word search. Match the behavior of the site's existing searches.
window.myeCreateClueWordSearch = ({ host, words, state, onChange }) => {
  const size = 12;
  const grid = Array.from({ length: size }, () => Array(size).fill(''));
  const paths = new Map();
  words.forEach((word) => {
    // Always read left to right or top to bottom, even if future data uses a negative direction.
    const startRow = word.row + Math.min(0, (word.answer.length - 1) * word.dr);
    const startCol = word.col + Math.min(0, (word.answer.length - 1) * word.dc);
    const path = [...word.answer].map((letter, index) => {
      const row = startRow + index * Math.abs(word.dr), col = startCol + index * Math.abs(word.dc);
      grid[row][col] = letter;
      return `${row}-${col}`;
    });
    paths.set(word.answer, path);
  });
  const filler = 'QJXVTKZMRBPHFNDYSCWLAEIOU';
  grid.forEach((row, r) => row.forEach((letter, c) => { if (!letter) row[c] = filler[(r * size + c * 7) % filler.length]; }));
  const render = () => {
    const found = new Set(state().wordSearchFound || []);
    host.innerHTML = `<div class="puzzle-layout lesson-puzzle-layout"><div class="word-grid" role="group" aria-label="Alien vocabulary word search">${grid.map((row, r) => row.map((letter, c) => {
      const cell = `${r}-${c}`;
      const index = words.findIndex((word) => found.has(word.answer) && paths.get(word.answer).includes(cell));
      return `<button type="button" class="letter ${index >= 0 ? `found color-${index % 4}` : ''}" data-search-cell="${cell}" aria-label="Row ${r + 1}, column ${c + 1}: ${letter}">${letter}</button>`;
    }).join('')).join('')}</div><aside class="word-list mission-log"><p class="word-list-title">Clues</p><ul>${words.map((word) => `<li class="word-item ${found.has(word.answer) ? 'is-found' : ''}"><span class="word-emoji" aria-hidden="true">${word.emoji}</span><span><strong>${found.has(word.answer) ? word.answer : `${word.answer.length} letters`}</strong><small>${word.clue}</small></span><span class="found-mark">${found.has(word.answer) ? '✓' : ''}</span></li>`).join('')}</ul></aside></div><p class="completion-message" role="status">${found.size} / ${words.length} words found${found.size === words.length ? '. Excellent!' : '.'}</p>`;
  };
  host.addEventListener('click', (event) => {
    const cell = event.target.closest('[data-search-cell]');
    if (!cell) return;
    const current = state();
    current.wordSearchFound ||= [];
    const word = words.find((item) => paths.get(item.answer).includes(cell.dataset.searchCell) && !current.wordSearchFound.includes(item.answer));
    if (!word) return;
    current.wordSearchFound.push(word.answer);
    render();
    host.querySelector(`[data-search-cell="${cell.dataset.searchCell}"]`)?.focus({ preventScroll: true });
    onChange();
  });
  return { render };
};
