const nav = document.getElementById("mainNav");
const menuToggle = document.getElementById("menuToggle");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));

document.body.classList.add("js-enabled");

const motionTargets = Array.from(
  document.querySelectorAll(
    ".hero-copy > *, .section h2, .section p, .card, .badge-list span, .timeline li, .impact-card"
  )
);

motionTargets.forEach((element, index) => {
  const variants = ["reveal-up", "slide-left", "slide-right", "zoom-in"];
  const variant = variants[index % variants.length];

  if (!element.classList.contains("reveal-up") && !element.classList.contains("slide-left") && !element.classList.contains("slide-right") && !element.classList.contains("zoom-in")) {
    element.classList.add(variant);
  }

  element.classList.add(`delay-${(index % 4) + 1}`);
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

const setActiveLink = (activeId) => {
  navLinks.forEach((link) => {
    const targetId = link.getAttribute("href").replace("#", "");
    link.classList.toggle("is-active", targetId === activeId);
  });
};

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

    if (visible[0]) {
      setActiveLink(visible[0].target.id);
    }
  },
  {
    root: null,
    rootMargin: "-38% 0px -46% 0px",
    threshold: [0.2, 0.4, 0.6],
  }
);

sections.forEach((section) => sectionObserver.observe(section));

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    root: null,
    rootMargin: "0px 0px -10% 0px",
    threshold: 0.15,
  }
);

motionTargets.forEach((element) => revealObserver.observe(element));

if (sections[0]) {
  setActiveLink(sections[0].id);
}
