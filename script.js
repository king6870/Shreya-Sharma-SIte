const nav = document.getElementById("mainNav");
const menuToggle = document.getElementById("menuToggle");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));

document.body.classList.add("js-enabled");

const autoRevealSelectors = [
  ".section h2",
  ".card",
  ".badge-list span",
  ".timeline li",
  ".impact-card",
  ".subhead",
  ".section p",
];

autoRevealSelectors.forEach((selector) => {
  document.querySelectorAll(selector).forEach((el, index) => {
    const variant = ["slide-left", "slide-right", "zoom-in", "reveal-up"][index % 4];

    if (!el.classList.contains("reveal-up") && !el.classList.contains("slide-left") && !el.classList.contains("slide-right") && !el.classList.contains("zoom-in")) {
      el.classList.add(variant);
    }

    // Cycle delay classes to create a subtle stagger effect.
    const delayClass = `delay-${(index % 4) + 1}`;
    if (!el.classList.contains(delayClass)) {
      el.classList.add(delayClass);
    }
  });
});

const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    nav.classList.toggle("is-open", !isExpanded);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    });
  });
}

const updateActiveLink = (activeId) => {
  navLinks.forEach((link) => {
    const targetId = link.getAttribute("href").replace("#", "");
    link.classList.toggle("is-active", targetId === activeId);
  });
};

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

    if (visible[0]) {
      updateActiveLink(visible[0].target.id);
    }
  },
  {
    root: null,
    rootMargin: "-40% 0px -45% 0px",
    threshold: [0.2, 0.4, 0.6],
  }
);

sections.forEach((section) => observer.observe(section));

const revealItems = Array.from(document.querySelectorAll(".reveal-up, .slide-left, .slide-right, .zoom-in"));

const revealObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        obs.unobserve(entry.target);
      }
    });
  },
  {
    root: null,
    rootMargin: "0px 0px -8% 0px",
    threshold: 0.15,
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

// Set default active state on initial load.
const firstSection = sections[0];
if (firstSection) {
  updateActiveLink(firstSection.id);
}
