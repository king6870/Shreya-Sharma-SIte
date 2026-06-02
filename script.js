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

const buildGeoField = (layer, configs, options = {}) => {
  if (!layer) {
    return;
  }

  const shapeTypes = options.shapeTypes || ["diamond", "square", "hexagon"];
  const baseOpacity = options.baseOpacity ?? 0.52;
  const opacitySpread = options.opacitySpread ?? 0.3;

  const makeShape = (type, rand, outline, tone) => {
    const element = document.createElement("span");
    element.className = `geo geo-${type}${outline ? " geo-outline" : ""} geo-tone-${tone}`;

    const size = 12 + Math.round(rand() * 24);
    const opacity = baseOpacity + rand() * opacitySpread;
    const rotate = Math.round(rand() * 360);

    element.style.opacity = opacity.toFixed(2);
    element.style.transformOrigin = "center center";
    element.style.transform = `translate(-50%, -50%) rotate(${rotate}deg)`;

    if (type === "diamond" || type === "square" || type === "hexagon") {
      element.style.width = `${size}px`;
      element.style.height = `${size}px`;
    }

    if (type === "bar") {
      element.style.width = `${size + 28}px`;
      element.style.height = `${8 + Math.round(rand() * 4)}px`;
    }

    if (type === "triangle") {
      const tri = 8 + Math.round(rand() * 14);
      element.style.borderLeftWidth = `${tri}px`;
      element.style.borderRightWidth = `${tri}px`;
      element.style.borderBottomWidth = `${tri + 8}px`;
    }

    if (outline) {
      element.style.background = "transparent";
      if (type !== "triangle") {
        element.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.44), 0 10px 18px rgba(8,47,111,0.14)";
      }
    }

    return element;
  };

  configs.forEach((band, bandIndex) => {
    const rand = createSeededRandom(band.seed);

    for (let index = 0; index < band.count; index += 1) {
      const type = shapeTypes[index % shapeTypes.length];
      const outline = (index + bandIndex) % 2 === 0;
      const x = band.xMin + rand() * (band.xMax - band.xMin);
      const y = band.yMin + rand() * (band.yMax - band.yMin);
      const shape = makeShape(type, rand, outline, options.tone || "blue");

      shape.style.left = `${Math.max(0, Math.min(100, x))}%`;
      shape.style.top = `${Math.max(0, Math.min(100, y))}%`;

      if (type === "bar") {
        shape.style.transform = `translate(-50%, -50%) rotate(${Math.round(rand() * 180)}deg)`;
      }

      layer.appendChild(shape);
    }
  });
};

buildGeoField(geoLayer, [
  { xMin: 10, xMax: 24, yMin: 8, yMax: 92, count: 14, seed: 11 },
  { xMin: 76, xMax: 90, yMin: 8, yMax: 92, count: 14, seed: 23 },
  { xMin: 18, xMax: 82, yMin: 16, yMax: 26, count: 6, seed: 37 },
  { xMin: 18, xMax: 82, yMin: 74, yMax: 84, count: 6, seed: 41 },
], { tone: "blue", shapeTypes: ["diamond", "square", "hexagon"], baseOpacity: 0.44, opacitySpread: 0.18 });

buildGeoField(document.querySelector(".geo-layer-hero"), [
  { xMin: 12, xMax: 24, yMin: 14, yMax: 88, count: 10, seed: 53 },
  { xMin: 76, xMax: 88, yMin: 14, yMax: 88, count: 10, seed: 67 },
  { xMin: 22, xMax: 78, yMin: 16, yMax: 28, count: 4, seed: 71 },
], { tone: "yellow", shapeTypes: ["diamond", "square", "hexagon"], baseOpacity: 0.4, opacitySpread: 0.14 });

buildGeoField(document.querySelector(".geo-layer-impact"), [
  { xMin: 12, xMax: 24, yMin: 14, yMax: 88, count: 8, seed: 89 },
  { xMin: 76, xMax: 88, yMin: 14, yMax: 88, count: 8, seed: 97 },
  { xMin: 22, xMax: 78, yMin: 16, yMax: 28, count: 4, seed: 101 },
], { tone: "yellow", shapeTypes: ["diamond", "square", "hexagon"], baseOpacity: 0.38, opacitySpread: 0.12 });

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
