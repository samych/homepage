
/* ========================================
   1. LIGHT / DARK MODE
======================================== */

const themeToggle = document.querySelector("#theme-toggle");
const themeIcon = document.querySelector(".theme-icon");
const themeLabel = document.querySelector(".theme-label");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");

  if (document.body.classList.contains("light-theme")) {
    themeIcon.textContent = "☾";
    themeLabel.textContent = "Dark mode";
    themeToggle.setAttribute("aria-label", "Switch to dark mode");
  } else {
    themeIcon.textContent = "☀";
    themeLabel.textContent = "Light mode";
    themeToggle.setAttribute("aria-label", "Switch to light mode");
  }
});


/* ========================================
   2. HERO — GENERATIVE DATA VISUALISATION
======================================== */

const svg = d3.select("#hero-svg");

const width = 600;
const height = 450;
const numberOfLines = 32;

// Animation speed: smaller = slower
const animationSpeed = 0.00015;


/* ========================================
   3. SVG OPACITY MASK
======================================== */


/* ========================================
   3. SVG OPACITY MASK
   Horizontal + vertical fading
======================================== */

const defs = svg.append("defs");

// Horizontal gradient
const horizontalGradient = defs
  .append("linearGradient")
  .attr("id", "fade-horizontal")
  .attr("x1", "0%")
  .attr("x2", "100%")
  .attr("y1", "0%")
  .attr("y2", "0%");

const horizontalStops = [
  { offset: "0%", opacity: 0 },
  { offset: "18%", opacity: 1 },
  { offset: "82%", opacity: 1 },
  { offset: "100%", opacity: 0 }
];

horizontalGradient
  .selectAll("stop")
  .data(horizontalStops)
  .join("stop")
  .attr("offset", d => d.offset)
  .attr("stop-color", "white")
  .attr("stop-opacity", d => d.opacity);

// Vertical gradient
const verticalGradient = defs
  .append("linearGradient")
  .attr("id", "fade-vertical")
  .attr("x1", "0%")
  .attr("x2", "0%")
  .attr("y1", "0%")
  .attr("y2", "100%");

const verticalStops = [
  { offset: "0%", opacity: 0 },
  { offset: "16%", opacity: 1 },
  { offset: "84%", opacity: 1 },
  { offset: "100%", opacity: 0 }
];

verticalGradient
  .selectAll("stop")
  .data(verticalStops)
  .join("stop")
  .attr("offset", d => d.offset)
  .attr("stop-color", "white")
  .attr("stop-opacity", d => d.opacity);

// Combine the two gradients using nested masks
const horizontalMask = defs
  .append("mask")
  .attr("id", "mask-horizontal");

horizontalMask
  .append("rect")
  .attr("width", width)
  .attr("height", height)
  .attr("fill", "url(#fade-horizontal)");

const verticalMask = defs
  .append("mask")
  .attr("id", "mask-vertical");

verticalMask
  .append("rect")
  .attr("width", width)
  .attr("height", height)
  .attr("fill", "url(#fade-vertical)");

// Outer group applies vertical fade
const verticalGroup = svg
  .append("g")
  .attr("mask", "url(#mask-vertical)");

// Inner group applies horizontal fade
const linesGroup = verticalGroup
  .append("g")
  .attr("mask", "url(#mask-horizontal)");



/* ========================================
   4. LINE GENERATOR
======================================== */

// Calculate Y for any X position and line index.
// Time controls the animated wave movement.
function getY(x, i, time = 0) {
  return (
    90 +
    i * 8 +
    Math.sin(x * 0.012 + i * 0.19 + time) * 90 +
    Math.sin(x * 0.023 + i * 0.37 + time * 0.5) * 8
  );
}

// Convert an array of points into an SVG path
const lineGenerator = d3.line()
  .x(d => d.x)
  .y(d => d.y)
  .curve(d3.curveBasis);

// Generate coordinates for one curve at a given time
function generatePoints(i, time = 0) {
  const points = [];

  for (let x = 20; x <= width - 20; x += 10) {
    points.push({
      x: x,
      y: getY(x, i, time)
    });
  }

  return points;
}


/* ========================================
   5. GENERATE FLOWING LINES
======================================== */

// Store references to all SVG paths
const paths = [];

for (let i = 0; i < numberOfLines; i++) {

  const points = generatePoints(i);

  const isAccentLine = i === 6 || i === 15;

  const path = linesGroup
    .append("path")
    .datum(points)
    .attr("d", lineGenerator)
    .attr("fill", "none")
    .attr(
      "stroke",
      isAccentLine
        ? "var(--svg-accent)"
        : "var(--svg-muted)"
    )
    .attr("stroke-width", isAccentLine ? 1.8 : 0.85)
    .attr("opacity", isAccentLine ? 0.9 : 0.25);

  // Save this path so we can animate it later
  paths.push(path);
}


/* ========================================
   6. DATA POINTS
======================================== */

// Each point is associated with an orange curve
const dataPoints = [
  { x: 150, line: 6, r: 3 },
  { x: 312, line: 6, r: 4 },
  { x: 452, line: 15, r: 3 },
  { x: 510, line: 15, r: 3 }
];

const circles = linesGroup
  .selectAll(".data-point")
  .data(dataPoints)
  .join("circle")
  .attr("class", "data-point")
  .attr("cx", d => d.x)
  .attr("cy", d => getY(d.x, d.line))
  .attr("r", d => d.r)
  .attr("fill", "var(--svg-accent)");


/* ========================================
   7. SUBTLE WAVE ANIMATION
======================================== */

// Respect the user's accessibility preferences
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

// Animate only if reduced motion is not requested
if (!reducedMotion.matches) {

  d3.timer(elapsed => {

    // Convert elapsed milliseconds into slow movement
    const time = elapsed * animationSpeed;

    // Update all 32 curves
    paths.forEach((path, i) => {
      const animatedPoints = generatePoints(i, time);

      path.attr("d", lineGenerator(animatedPoints));
    });

    // Move orange points along with their curves
    circles
      .attr("cy", d => getY(d.x, d.line, time));

  });
}
// ========================================
// 8. MOBILE NAVIGATION
// ========================================

const menuToggle = document.querySelector("#menu-toggle");
const mainNav = document.querySelector("#main-nav");

menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");

  menuToggle.setAttribute("aria-expanded", isOpen);
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Close menu" : "Open menu"
  );
});

// Close the menu when a link is clicked
mainNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
  });
});