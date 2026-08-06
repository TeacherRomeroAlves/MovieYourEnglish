const SOCIAL_PROOF_DATA = {
  stats: [
    { value: 60000, display: "60.000+", format: "dot", suffix: "+", label: "Website views", support: "Growing discovery through movie-based English practice.", icon: "views" },
    { value: 14000, display: "14,000+", format: "comma", suffix: "+", label: "Visitors", support: "Teachers and learners exploring the platform.", icon: "visitors" },
    { value: 50, display: "50+", format: "plain", suffix: "+", label: "Countries reached", support: "An international community with a shared love of film.", icon: "globe" },
    { value: 8.85, display: "8.85/10", format: "decimal", suffix: "/10", label: "Average satisfaction score", support: "Feedback collected directly from English teachers.", icon: "score" }
  ],
  testimonials: [
    { quote: "I like that the platform is always up to date with recent movies while still including classic titles.", name: "Lauren Stigliano", role: "English Teacher", country: "Portugal", marker: "PT", initials: "LS", url: "https://www.instagram.com/laurenstigliano/" },
    { quote: "My students actually ask when we'll use another movie.", homeQuote: "It is visually appealing, easy to use, and my students love it.", name: "Julieta", role: "English Teacher", country: "Argentina", marker: "AR", initials: "J", url: "https://www.instagram.com/julidenna/" },
    { quote: "I like the variety of genres and the clear instructions.", name: "Carmen Arce", role: "English Teacher", country: "Mexico", marker: "MX", initials: "CA", url: "https://www.instagram.com/carmen.arce.o/" },
    { quote: "The activities are engaging, challenging, and easy to use in class.", name: "Carlos Eduardo da Silva", role: "English Teacher", country: "Brazil", marker: "BR", initials: "CS", url: "https://www.instagram.com/mr.carloseduardosilva/" },
    { quote: "The platform offers a wide range of genres and interactive activities for visual learners.", name: "Waaed Belgacem", role: "English Professor", country: "Tunisia", marker: "TN", initials: "WB", url: "https://www.linkedin.com/in/waaed-belgacem-030ab4ba/" },
    { quote: "My students love it. I’ve even recommended it to my colleagues and they find it really useful.", name: "Roxanna", role: "English Teacher", country: "Argentina", marker: "AR", initials: "R", url: "https://www.instagram.com/roxannaplayuk/" }
  ],
  communityStories: [
    { platform: "Instagram", kind: "Post", embed: "https://www.instagram.com/p/DVyeFEMjrwV/embed/", url: "https://www.instagram.com/p/DVyeFEMjrwV/?img_index=4", title: "Movie Your English community post on Instagram" },
    { platform: "Instagram", kind: "Reel", embed: "https://www.instagram.com/reel/DHbWnXmueHK/embed/", url: "https://www.instagram.com/reel/DHbWnXmueHK/", title: "Movie Your English community reel on Instagram" },
    { platform: "Instagram", kind: "Post", embed: "https://www.instagram.com/p/DG8GbBFNBrV/embed/", url: "https://www.instagram.com/p/DG8GbBFNBrV/", title: "Movie Your English teacher post on Instagram" },
    { platform: "TikTok", kind: "Video", embed: "https://www.tiktok.com/player/v1/7605329736205651221?autoplay=0&music_info=1&description=1", url: "https://www.tiktok.com/@englishwithsoliofficial/video/7605329736205651221", title: "Movie Your English community video on TikTok" },
    { platform: "Instagram", kind: "Post", embed: "https://www.instagram.com/p/DQ-ISA_iW0w/embed/", url: "https://www.instagram.com/p/DQ-ISA_iW0w/", title: "Movie Your English community post on Instagram" },
    { platform: "Instagram", kind: "Post", embed: "https://www.instagram.com/p/DOuGHPQkfxo/embed/", url: "https://www.instagram.com/p/DOuGHPQkfxo/", title: "Movie Your English community post on Instagram" },
    { platform: "Instagram", kind: "Post", embed: "https://www.instagram.com/p/DNTdbyuRMlv/embed/", url: "https://www.instagram.com/p/DNTdbyuRMlv/", title: "Movie Your English community post on Instagram" }
  ],
  countries: [
    { name: "Brazil", marker: "BR" }, { name: "Argentina", marker: "AR" },
    { name: "Portugal", marker: "PT" }, { name: "Spain", marker: "ES" },
    { name: "Iran", marker: "IR" }, { name: "Tunisia", marker: "TN" },
    { name: "Pakistan", marker: "PK" }, { name: "Moldova", marker: "MD" }
  ],
  pairs: [
    { metric: "81%", label: "Rated the platform 8 or higher", quote: "The platform is easy to use and has a friendly look.", name: "Vanina", country: "Argentina" },
    { metric: "58%", label: "Visit weekly or more often", quote: "I use it with different classes and appreciate the variety of options.", name: "Charly", country: "Spain" }
  ]
};

const proofIcon = (name) => {
  const paths = {
    views: '<path d="M2.5 12s3.5-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.5 5.5-9.5 5.5S2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.5"/>',
    visitors: '<path d="M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 4 18.5V20"/><circle cx="10" cy="7" r="4"/><path d="M18 8v6m-3-3h6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9S14.4 18.5 12 21c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3Z"/>',
    score: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>',
    recommendation: '<path d="M7 21H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3m0 11V10l4-7a3 3 0 0 1 3 3v4h5.2a2.8 2.8 0 0 1 2.7 3.5l-1.5 6A2 2 0 0 1 18.5 21H7Z"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
};

const statCard = (stat, compact = false) => `<article class="proof-stat ${stat.research ? "proof-stat--research" : ""} ${compact ? "proof-stat--compact" : ""}"><span class="proof-stat__icon">${proofIcon(stat.icon)}</span><strong class="proof-number" data-count-value="${stat.value}" data-count-format="${stat.format}" data-count-prefix="${stat.prefix || ""}" data-count-suffix="${stat.suffix || ""}" aria-label="${stat.display}">${stat.display}</strong><h3>${stat.label}</h3>${compact ? "" : `<p>${stat.support}</p>`}</article>`;

const countryFlag = (code, country, className = "") => code ? `<span class="country-flag ${className}" title="${country}" role="img" aria-label="Flag of ${country}"><img src="https://flagcdn.com/w40/${code.toLowerCase()}.png" srcset="https://flagcdn.com/w80/${code.toLowerCase()}.png 2x" width="40" height="27" alt="" loading="lazy"><span>${code}</span></span>` : "";
const testimonialCard = (item) => `<article class="proof-testimonial"><span class="proof-quote-mark" aria-hidden="true">&ldquo;</span><blockquote>${item.quote}</blockquote><footer><span class="proof-avatar" aria-hidden="true">${item.initials}</span><div><a href="${item.url}" target="_blank" rel="noreferrer">${item.name}</a><p>${item.role}${item.country ? ` <span aria-hidden="true">&middot;</span> ${item.country}` : ""}</p></div>${countryFlag(item.marker, item.country, "proof-country")}</footer></article>`;
const communityStoryCard = (item) => `<article class="community-story-card"><div class="community-embed"><iframe src="${item.embed}" title="${item.title}" loading="lazy" allow="encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe></div><footer><span>${item.platform} &middot; ${item.kind}</span><a href="${item.url}" target="_blank" rel="noreferrer">View original <b aria-hidden="true">&#8599;</b></a></footer></article>`;

function initCountUps(root = document) {
  const numbers = root.querySelectorAll("[data-count-value]");
  if (!numbers.length) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const format = (value, type) => type === "dot" ? Math.round(value).toLocaleString("de-DE") : type === "comma" ? Math.round(value).toLocaleString("en-US") : type === "decimal" ? Number(value).toFixed(2) : Math.round(value).toString();
  const animate = (element) => {
    if (element.dataset.counted) return;
    element.dataset.counted = "true";
    const target = Number(element.dataset.countValue), prefix = element.dataset.countPrefix, suffix = element.dataset.countSuffix, type = element.dataset.countFormat;
    if (reduced) { element.textContent = `${prefix}${format(target, type)}${suffix}`; return; }
    const start = performance.now(), duration = 1100;
    const frame = (now) => { const progress = Math.min((now - start) / duration, 1), eased = 1 - Math.pow(1 - progress, 3); element.textContent = `${prefix}${format(target * eased, type)}${suffix}`; if (progress < 1) requestAnimationFrame(frame); };
    requestAnimationFrame(frame);
  };
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { animate(entry.target); observer.unobserve(entry.target); } }), { threshold: .35 });
  numbers.forEach((number) => observer.observe(number));
}

function renderHomeProof() {
  const host = document.querySelector("[data-social-proof-home]");
  if (!host) return;
  const homepageTestimonial = { ...SOCIAL_PROOF_DATA.testimonials[1], quote: SOCIAL_PROOF_DATA.testimonials[1].homeQuote || SOCIAL_PROOF_DATA.testimonials[1].quote };
  host.innerHTML = `<div class="proof-home-heading"><div><p class="eyebrow">Real classroom impact</p><h2>Trusted by English Teachers Around the World</h2><p>Movie Your English is already being used by teachers and learners across different countries to make English practice more engaging, practical, and enjoyable.</p></div><a class="proof-text-link" href="social-proof.html">Explore our impact <span aria-hidden="true">&#8594;</span></a></div><div class="proof-home-grid">${SOCIAL_PROOF_DATA.stats.slice(0,4).map((stat) => statCard(stat, true)).join("")}</div><div class="proof-home-quote">${testimonialCard(homepageTestimonial)}<a class="hero-primary" href="social-proof.html">Read teacher stories <span aria-hidden="true">&#8594;</span></a></div>`;
  initCountUps(host);
}

function renderFullProof() {
  const stats = document.querySelector("[data-impact-stats]"), testimonials = document.querySelector("[data-testimonials]"), communityStories = document.querySelector("[data-community-stories]"), reach = document.querySelector("[data-global-reach]"), pairs = document.querySelector("[data-proof-pairs]");
  if (!stats) return;
  stats.innerHTML = SOCIAL_PROOF_DATA.stats.map((stat) => statCard(stat)).join("");
  testimonials.innerHTML = SOCIAL_PROOF_DATA.testimonials.map(testimonialCard).join("");
  communityStories.innerHTML = SOCIAL_PROOF_DATA.communityStories.map(communityStoryCard).join("");
  reach.innerHTML = `<div class="reach-country-list reach-country-list--featured" aria-label="Countries represented in teacher feedback">${SOCIAL_PROOF_DATA.countries.map((country) => `<span>${countryFlag(country.marker, country.name)}${country.name}</span>`).join("")}</div>`;
  pairs.innerHTML = SOCIAL_PROOF_DATA.pairs.map((pair) => `<article class="proof-pair"><div><strong>${pair.metric}</strong><p>${pair.label}</p></div><blockquote><span aria-hidden="true">&ldquo;</span>${pair.quote}<footer>&mdash; ${pair.name}, ${pair.country}</footer></blockquote></article>`).join("");
  const track = testimonials.closest(".proof-carousel");
  track?.addEventListener("keydown", (event) => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); testimonials.scrollBy({ left: testimonials.clientWidth * (event.key === "ArrowRight" ? .78 : -.78), behavior: "smooth" }); } });
  document.querySelectorAll("[data-proof-carousel]").forEach((button) => button.addEventListener("click", () => testimonials.scrollBy({ left: testimonials.clientWidth * (button.dataset.proofCarousel === "next" ? .78 : -.78), behavior: "smooth" })));
  const communityCarousel = communityStories.closest(".community-carousel");
  communityCarousel?.addEventListener("keydown", (event) => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); communityStories.scrollBy({ left: communityStories.clientWidth * (event.key === "ArrowRight" ? .82 : -.82), behavior: "smooth" }); } });
  document.querySelectorAll("[data-community-carousel]").forEach((button) => button.addEventListener("click", () => communityStories.scrollBy({ left: communityStories.clientWidth * (button.dataset.communityCarousel === "next" ? .82 : -.82), behavior: "smooth" })));
  initCountUps(document);
}

renderHomeProof();
renderFullProof();
