const carousel = document.querySelector("#poster-carousel");
document.querySelectorAll("[data-carousel-direction]").forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.carouselDirection === "next" ? 1 : -1;
    const tile = carousel.querySelector(".movie-tile");
    const distance = (tile?.getBoundingClientRect().width || 260) + 20;
    carousel.scrollBy({ left: distance * direction, behavior: "smooth" });
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".home-reveal").forEach((section) => revealObserver.observe(section));
