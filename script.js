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

const buildGeoClusters = () => {
  if (!geoLayer) {
    return;
  }

  const clusterConfigs = [
    { centerX: 8, centerY: 10, count: 36, spreadX: 8, spreadY: 5, seed: 11 },
    { centerX: 26, centerY: 18, count: 34, spreadX: 10, spreadY: 6, seed: 23 },
    { centerX: 58, centerY: 12, count: 38, spreadX: 12, spreadY: 7, seed: 37 },
    { centerX: 80, centerY: 24, count: 36, spreadX: 10, spreadY: 7, seed: 41 },
    { centerX: 14, centerY: 56, count: 40, spreadX: 12, spreadY: 8, seed: 53 },
    { centerX: 46, centerY: 64, count: 42, spreadX: 12, spreadY: 8, seed: 67 },
    { centerX: 78, centerY: 74, count: 40, spreadX: 10, spreadY: 9, seed: 71 },
    { centerX: 18, centerY: 88, count: 32, spreadX: 9, spreadY: 6, seed: 89 },
  ];

  const shapeTypes = ["diamond", "square", "hexagon", "triangle", "bar"];

  const makeShape = (type, rand) => {
    const element = document.createElement("span");
    element.className = `geo geo-${type}`;

    const size = 18 + Math.round(rand() * 58);
    const opacity = 0.55 + rand() * 0.35;
    const rotate = Math.round(rand() * 360);

    element.style.opacity = opacity.toFixed(2);
    element.style.transform = `rotate(${rotate}deg)`;

    if (type === "diamond" || type === "square" || type === "hexagon") {
      element.style.width = `${size}px`;
      element.style.height = `${size}px`;
    }

    if (type === "bar") {
      element.style.width = `${size + 48}px`;
      element.style.height = `${10 + Math.round(rand() * 10)}px`;
    }

    if (type === "triangle") {
      const tri = 14 + Math.round(rand() * 26);
      element.style.borderLeftWidth = `${tri}px`;
      element.style.borderRightWidth = `${tri}px`;
      element.style.borderBottomWidth = `${tri + 18}px`;
    }

    return element;
  };

  clusterConfigs.forEach((cluster) => {
    const rand = createSeededRandom(cluster.seed);

    for (let index = 0; index < cluster.count; index += 1) {
      const type = shapeTypes[index % shapeTypes.length];
      const offsetX = (rand() - 0.5) * cluster.spreadX;
      const offsetY = (rand() - 0.5) * cluster.spreadY;
      const x = Math.max(0, Math.min(100, cluster.centerX + offsetX));
      const y = Math.max(0, Math.min(100, cluster.centerY + offsetY));
      const shape = makeShape(type, rand);

      shape.style.left = `${x}%`;
      shape.style.top = `${y}%`;
      geoLayer.appendChild(shape);
    }
  });
};

buildGeoClusters();

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
  const variant = variants[index % variants.length];

  element.classList.add(variant, `delay-${(index % 4) + 1}`);
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
