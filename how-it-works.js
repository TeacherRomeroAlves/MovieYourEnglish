(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealItems = document.querySelectorAll(".how-reveal");

  if (reducedMotion) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.from(".how-hero-copy > *", { opacity: 0, y: 26, duration: 0.85, stagger: 0.09, ease: "power3.out" });
    window.gsap.from(".how-poster", { opacity: 0, scale: 0.88, y: 40, duration: 1, stagger: 0.12, ease: "power3.out" });
    revealItems.forEach((item) => {
      window.gsap.fromTo(item, { opacity: 0, y: 48 }, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: { trigger: item, start: "top 84%", once: true }
      });
    });
    window.gsap.to(".how-poster-stage", {
      y: -42,
      ease: "none",
      scrollTrigger: { trigger: ".how-hero", start: "top top", end: "bottom top", scrub: 0.7 }
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
})();
