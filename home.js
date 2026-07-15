const carousel = document.querySelector("#poster-carousel");
document.querySelectorAll("[data-carousel-direction]").forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.carouselDirection === "next" ? 1 : -1;
    const tile = carousel.querySelector(".movie-tile");
    const distance = (tile?.getBoundingClientRect().width || 260) + 20;
    carousel.scrollBy({ left: distance * direction, behavior: "smooth" });
  });
});
