// Opinion activities have no correct answer: selecting either option completes a prompt.
window.myeCreatePreferenceActivity = ({ host, questions, selections, onChange }) => {
  const render = () => {
    const previousCarousel = host.querySelector('.question-carousel');
    const activeIndex = previousCarousel ? Math.round(previousCarousel.scrollLeft / Math.max(previousCarousel.clientWidth, 1)) : 0;
    host.innerHTML = `<div class="question-carousel-shell"><div class="question-carousel-toolbar"><span>This or that?</span><div><button class="question-carousel-button" type="button" data-nav="previous" aria-label="Previous discussion question">←</button><button class="question-carousel-button" type="button" data-nav="next" aria-label="Next discussion question">→</button></div></div><div class="question-carousel" aria-label="This or that discussion questions">` + questions.map((question, index) => {
      const chosen = selections()[question.id];
      const option = question.options[chosen];
      return `<div class="question-slide"><article class="preference-card" data-preference-card="${question.id}"><p class="slide-number">Question ${index + 1} of ${questions.length}</p><h3>${question.question}</h3><div class="preference-options" role="group" aria-label="${question.question}">${question.options.map((item, position) => `<button type="button" class="preference-option ${chosen === position ? 'is-selected' : ''}" data-preference="${question.id}" data-preference-option="${position}" aria-pressed="${chosen === position}"><span aria-hidden="true">${item.emoji}</span>${item.label}</button>`).join('')}</div><p class="preference-follow-up" aria-live="polite">${option ? `<strong>Let’s talk:</strong> ${option.followUp}` : 'Choose the option you prefer. There is no right or wrong answer.'}</p></article></div>`;
    }).join('') + '</div></div>';
    const carousel = host.querySelector('.question-carousel');
    carousel.scrollLeft = activeIndex * carousel.clientWidth;
    host.querySelectorAll('[data-preference]').forEach((button) => {
      const question = questions.find((item) => item.id === button.dataset.preference);
      button.dataset.followUp = question.options[Number(button.dataset.preferenceOption)].followUp;
    });
  };
  host.addEventListener('click', (event) => {
    const button = event.target.closest('[data-preference]');
    if (!button) return;
    selections()[button.dataset.preference] = Number(button.dataset.preferenceOption);
    render();
    host.querySelector(`[data-preference="${button.dataset.preference}"][data-preference-option="${button.dataset.preferenceOption}"]`)?.focus({ preventScroll: true });
    onChange();
  });
  return { render };
};
