const nav = document.getElementById("mainNav");
const menuToggle = document.getElementById("menuToggle");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const geoLayer = document.querySelector(".geo-layer");

document.body.classList.add("js-enabled");

const createSeededRandom = (seed) => {
  let value = seed % 2147483647;

  if (value <= 0) {
    value += 2147483646;
  }

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
};

const buildGeoField = () => {
  if (!geoLayer) {
    return;
  }

  const bandConfigs = [
    { xMin: 0, xMax: 14, yMin: 0, yMax: 100, count: 80, seed: 11 },
    { xMin: 86, xMax: 100, yMin: 0, yMax: 100, count: 80, seed: 23 },
    { xMin: 14, xMax: 86, yMin: 0, yMax: 14, count: 52, seed: 37 },
    { xMin: 14, xMax: 86, yMin: 86, yMax: 100, count: 52, seed: 41 },
    { xMin: 0, xMax: 18, yMin: 18, yMax: 84, count: 52, seed: 53 },
    { xMin: 82, xMax: 100, yMin: 18, yMax: 84, count: 52, seed: 67 },
    { xMin: 0, xMax: 100, yMin: 0, yMax: 100, count: 36, seed: 71 },
    { xMin: 0, xMax: 100, yMin: 0, yMax: 100, count: 36, seed: 89 },
  ];

  const shapeTypes = ["diamond", "square", "hexagon", "triangle", "bar"];

  const makeShape = (type, rand, outline) => {
    const element = document.createElement("span");
    element.className = `geo geo-${type}${outline ? " geo-outline" : ""}`;

    const size = 16 + Math.round(rand() * 62);
    const opacity = 0.48 + rand() * 0.42;
    const rotate = Math.round(rand() * 360);

    element.style.opacity = opacity.toFixed(2);
    element.style.transform = `rotate(${rotate}deg)`;

    if (type === "diamond" || type === "square" || type === "hexagon") {
      element.style.width = `${size}px`;
      element.style.height = `${size}px`;
    }

    if (type === "bar") {
      element.style.width = `${size + 60}px`;
      element.style.height = `${10 + Math.round(rand() * 10)}px`;
    }

    if (type === "triangle") {
      const tri = 12 + Math.round(rand() * 28);
      element.style.borderLeftWidth = `${tri}px`;
      element.style.borderRightWidth = `${tri}px`;
      element.style.borderBottomWidth = `${tri + 16}px`;
    }

    if (outline) {
      element.style.background = "transparent";
      if (type !== "triangle") {
        element.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.55), 0 10px 18px rgba(8,47,111,0.16)";
      }
    }

    return element;
  };

  bandConfigs.forEach((band, bandIndex) => {
    const rand = createSeededRandom(band.seed);

    for (let index = 0; index < band.count; index += 1) {
      const type = shapeTypes[index % shapeTypes.length];
      const outline = (index + bandIndex) % 2 === 0;
      const x = band.xMin + rand() * (band.xMax - band.xMin);
      const y = band.yMin + rand() * (band.yMax - band.yMin);
      const shape = makeShape(type, rand, outline);

      const baseX = Math.max(0, Math.min(100, x));
      const baseY = Math.max(0, Math.min(100, y));

      shape.style.left = `${baseX}%`;
      shape.style.top = `${baseY}%`;

      if (type === "bar") {
        shape.style.transform = `rotate(${Math.round(rand() * 180)}deg)`;
      }

      geoLayer.appendChild(shape);
    }
  });
};

buildGeoField();

const revealSections = ["#education", "#leadership", "#tennis", "#achievements", "#service", "#timeline", "#contact"];
const motionTargets = revealSections.flatMap((selector) => {
  const section = document.querySelector(selector);

  if (!section) {
    return [];
  }

  return Array.from(section.querySelectorAll("h2, .subhead, .card, .badge-list span, .timeline li, p"));
});

motionTargets.forEach((element, index) => {
  const variants = ["reveal-up", "slide-left", "slide-right", "zoom-in"];
  element.classList.add(variants[index % variants.length], `delay-${(index % 4) + 1}`);
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
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);

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
