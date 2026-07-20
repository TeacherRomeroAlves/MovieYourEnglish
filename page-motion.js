const motionTargets = document.querySelectorAll(".activity-page > section, .activity-page > .watch-provider");

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
  const pageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        pageObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  motionTargets.forEach((target, index) => {
    target.classList.add("page-reveal");
    target.style.setProperty("--reveal-delay", `${Math.min(index * 45, 180)}ms`);
    pageObserver.observe(target);
  });
}
