(function () {
  const lessons = [
    ["alien-romulus", "alien-romulus", "Alien: Romulus", "Intermediate+", "assets/alien-romulus-poster.webp"],
    ["conclave", "conclave", "Conclave", "Intermediate+", "assets/conclave-poster.webp"],
    ["devil-wears-prada", "devil-wears-prada", "The Devil Wears Prada", "Pre-Intermediate", "assets/devil-wears-prada-poster.webp"],
    ["eternity", "eternity", "Eternity", "Pre-Intermediate", "assets/Eternity-poster.webp"],
    ["f1-the-movie-beginner", "f1-the-movie", "F1: The Movie", "Beginner", "assets/f1-poster.webp"],
    ["f1-the-movie", "f1-the-movie", "F1: The Movie", "Pre-Intermediate", "assets/f1-poster.webp"],
    ["forrest-gump", "forrest-gump", "Forrest Gump", "Pre-Intermediate", "assets/forrest-gump-poster.webp"],
    ["frankenstein-easier", "frankenstein", "Frankenstein", "Elementary", "assets/frankenstein-poster.webp"],
    ["frankenstein-harder", "frankenstein", "Frankenstein", "Intermediate+", "assets/frankenstein-poster.webp"],
    ["harry-potter-philosophers-stone", "harry-potter-philosophers-stone", "Harry Potter and the Philosopher’s Stone", "Pre-Intermediate", "assets/harry-potter-1-poster.webp"],
    ["inside-out-2", "inside-out-2", "Inside Out 2", "Elementary", "assets/inside-out-2-poster.webp"],
    ["kpop-demon-hunters", "kpop-demon-hunters", "KPop Demon Hunters", "Beginner", "assets/kpop-demon-hunters-poster.webp"],
    ["lilo-and-stitch", "lilo-and-stitch", "Lilo & Stitch", "Elementary", "assets/lilo-and-stitch-poster.png"],
    ["materialists", "materialists", "Materialists", "Pre-Intermediate", "assets/materialists-poster.webp"],
    ["moana-2-beginner", "moana-2", "Moana 2", "Beginner", "assets/Moana-2-poster.webp"],
    ["moana-2", "moana-2", "Moana 2", "Elementary", "assets/Moana-2-poster.webp"],
    ["odyssey", "odyssey", "The Odyssey", "Intermediate+", "assets/the-odyssey-poster.webp"],
    ["project-hail-mary", "project-hail-mary", "Project Hail Mary", "Intermediate+", "assets/project-hail-mary-poster.png"],
    ["se7en", "se7en", "Se7en", "Intermediate+", "assets/Se7en-poster.png"],
    ["sheep-detectives", "sheep-detectives", "The Sheep Detectives", "Elementary", "assets/sheep-detectives-poster.png"],
    ["superman-beginner", "superman", "Superman", "Beginner", "assets/superman-poster.webp"],
    ["superman-intermediate-plus", "superman", "Superman", "Intermediate+", "assets/superman-poster.webp"],
    ["the-batman", "the-batman", "The Batman", "Intermediate+", "assets/batman-poster.webp"],
    ["the-housemaid", "the-housemaid", "The Housemaid", "Intermediate+", "assets/the-housemaid-poster.webp"],
    ["the-wrong-paris", "the-wrong-paris", "The Wrong Paris", "Pre-Intermediate", "assets/the-wrong-paris-poster.webp"],
    ["zootopia-2", "zootopia-2", "Zootopia 2", "Elementary", "assets/zootopia-2-logo.webp"]
  ].map(([slug, movieSlug, title, level, poster]) => ({ slug, movieSlug, title, level, poster, href: `${slug}/index.html` }));
  const storageKeyOverrides = {
    "moana-2": "mye-moana-2-v2",
    "project-hail-mary": "mye-project-hail-mary-lesson-v1",
    "sheep-detectives": "mye-sheep-detectives-lesson-v2"
  };
  lessons.forEach((lesson) => { lesson.storageKey = storageKeyOverrides[lesson.slug] || `mye-${lesson.slug}-v1`; });
  window.MYE_LEARNING_CATALOG = {
    lessons,
    lesson(slug) { return lessons.find((item) => item.slug === slug); },
    movie(slug) { return lessons.find((item) => item.movieSlug === slug); },
    slugFromHref(href) {
      try { return new URL(href, location.href).pathname.split("/").filter(Boolean).at(-2) || ""; } catch { return ""; }
    }
  };
})();
