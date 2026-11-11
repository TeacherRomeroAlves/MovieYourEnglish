(() => {
  const hero = document.querySelector('.streaming-home > .platform-hero');
  if (!hero || hero.classList.contains('featured-rotation')) return;
  const movies = [
    { title: 'The Odyssey', first: 'The', accent: 'Odyssey', poster: 'assets/the-odyssey-poster.webp', href: './odyssey/index.html', description: 'An epic English voyage: trailer, mythology, vocabulary, a viewing guide, comprehension, and writing.' },
    { title: 'Project Hail Mary', first: 'Project', accent: 'Hail Mary', poster: 'assets/project-hail-mary-poster.png', href: './project-hail-mary/index.html', description: 'Take your English into space with science vocabulary, an unexpected friendship, and a mission to save the world.' },
    { title: 'Spider-Man: Brand New Day', first: 'Spider-Man:', accent: 'Brand New Day', poster: 'assets/spider-man-brand-new-day-poster.webp', href: './spider-man-brand-new-day/index.html', description: 'A fresh adventure for your English: explore friendship, superpowers, and Spider-Man’s brand new chapter.' },
    { title: 'Toy Story 5', first: 'Toy Story', accent: '5', poster: 'assets/toy-story-5-poster.webp', href: './toy-story-5/index.html', description: 'Build your English with Woody, Buzz, and Jessie: friendship, play, and technology in a Beginner adventure.' }
  ];
  hero.classList.add('featured-rotation');
  hero.removeAttribute('aria-labelledby');
  hero.setAttribute('aria-label', 'Featured movie lessons');
  hero.setAttribute('aria-roledescription', 'carousel');
  hero.innerHTML = movies.map((movie, index) => `<div class="featured-slide ${index === 0 ? 'is-active' : ''}" role="group" aria-roledescription="slide" aria-label="${index + 1} of ${movies.length}: ${movie.title}" aria-hidden="${index !== 0}" ${index !== 0 ? 'inert' : ''}><a class="platform-feature-poster" href="${movie.href}" aria-label="Open ${movie.title} lesson"><img src="${movie.poster}" alt="${movie.title} movie poster" width="400" height="600" ${index === 0 ? 'fetchpriority="high"' : ''}></a><div class="platform-hero-content"><p class="eyebrow">Featured lesson</p><${index === 0 ? 'h1' : 'h2'} class="featured-title">${movie.first} <span class="hero-accent">${movie.accent}</span></${index === 0 ? 'h1' : 'h2'}><p>${movie.description}</p><div class="hero-actions"><a class="activity-link" href="${movie.href}">Start lesson</a><a class="hero-secondary" href="#activity-library">Browse activities</a></div></div></div>`).join('') + `<div class="featured-rotation-controls"><div class="featured-dots" role="group" aria-label="Choose a featured movie">${movies.map((movie, index) => `<button type="button" class="featured-dot ${index === 0 ? 'is-active' : ''}" data-featured-slide="${index}" aria-label="Show ${movie.title}" aria-pressed="${index === 0}"><span></span></button>`).join('')}</div><button type="button" class="featured-next featured-pause" aria-label="Next featured movie">Next →</button><button type="button" class="featured-pause" aria-label="Pause featured movie rotation">Pause</button></div>`;
  const slides = [...hero.querySelectorAll('.featured-slide')];
  const dots = [...hero.querySelectorAll('.featured-dot')];
  const pause = hero.querySelector('.featured-pause:not(.featured-next)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, timer, paused = reducedMotion.matches, hovered = false, focused = false, visible = true;
  const schedule = () => {
    clearTimeout(timer);
    if (!paused && !hovered && !focused && visible && !document.hidden) timer = setTimeout(() => show((current + 1) % movies.length), 3000);
  };
  const show = (index) => {
    current = index;
    slides.forEach((slide, position) => {
      const active = position === index;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.inert = !active;
      dots[position].classList.toggle('is-active', active);
      dots[position].setAttribute('aria-pressed', String(active));
    });
    schedule();
  };
  const updatePause = () => {
    pause.textContent = paused ? 'Play' : 'Pause';
    pause.setAttribute('aria-label', `${paused ? 'Play' : 'Pause'} featured movie rotation`);
    schedule();
  };
  dots.forEach((dot, index) => dot.addEventListener('click', () => show(index)));
  hero.querySelector('.featured-next').addEventListener('click', () => show((current + 1) % movies.length));
  pause.addEventListener('click', () => { paused = !paused; updatePause(); });
  hero.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  hero.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  hero.addEventListener('focusin', () => { focused = true; schedule(); });
  hero.addEventListener('focusout', (event) => { focused = hero.contains(event.relatedTarget); schedule(); });
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; updatePause(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }).observe(hero);
  updatePause();
})();
