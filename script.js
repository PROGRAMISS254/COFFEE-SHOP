
const reveal = document.getElementById("reveal");
const background = document.getElementById("revealBackground");
const replayButton = document.getElementById("replayButton");

const milkFile = "mi.png";
const chocolateFile = "choco.png";
const iceFile = "icecube.png";

let started = false;
let timers = [];
let iceInterval = null;

let milkSpill = null;
let chocolateSpill = null;
let iceLayer = null;
let effectsCreated = false;

/* =========================================
   TIMERS
========================================= */

function later(callback, delay) {
  const timer = setTimeout(callback, delay);
  timers.push(timer);
}

function clearSequence() {
  timers.forEach((timer) => clearTimeout(timer));
  timers = [];
}

/* =========================================
   PRELOAD IMAGES
========================================= */

function preloadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error(`Cannot load ${file}`));

    image.src = file;

    if (image.complete && image.naturalWidth > 0) {
      resolve(image);
    }
  });
}

/* =========================================
   CREATE LAYER 2 EFFECTS
   All effects belong to revealBackground.
========================================= */

function createEffects() {
  if (effectsCreated) return;

  milkSpill = document.createElement("img");
  milkSpill.className = "spill milk-spill";
  milkSpill.src = milkFile;
  milkSpill.alt = "";
  milkSpill.draggable = false;

  chocolateSpill = document.createElement("img");
  chocolateSpill.className = "spill chocolate-spill";
  chocolateSpill.src = chocolateFile;
  chocolateSpill.alt = "";
  chocolateSpill.draggable = false;

  iceLayer = document.createElement("div");
  iceLayer.className = "ice-layer";
  iceLayer.id = "iceLayer";

  background.appendChild(milkSpill);
  background.appendChild(chocolateSpill);
  background.appendChild(iceLayer);

  effectsCreated = true;
}

/* =========================================
   DROP ONE ICE CUBE
========================================= */

function dropIceCube() {
  if (!iceLayer || !started) return;

  const cube = document.createElement("img");

  cube.className = "ice-cube";
  cube.src = iceFile;
  cube.alt = "";
  cube.draggable = false;

  const size = 28 + Math.random() * 42;
  const duration = 2.5 + Math.random() * 2.5;
  const drift = -70 + Math.random() * 140;

  cube.style.setProperty("--size", `${size}px`);
  cube.style.setProperty("--duration", `${duration}s`);
  cube.style.setProperty("--drift", `${drift}px`);

  cube.style.left = `${Math.random() * 95}%`;

  iceLayer.appendChild(cube);

  cube.addEventListener(
    "animationend",
    () => cube.remove(),
    { once: true }
  );
}

/* =========================================
   START ICE ANIMATION
   Called only when Layer 2 opens.
========================================= */

function startIceCubes() {
  if (iceInterval) return;

  if (!iceLayer) createEffects();

  iceLayer.classList.add("active");

  // Create the first group of cubes.
  for (let i = 0; i < 8; i++) {
    later(dropIceCube, i * 180);
  }

  // Continue dropping cubes.
  iceInterval = setInterval(dropIceCube, 350);
}

/* =========================================
   STOP AND REMOVE FALLING ICE
========================================= */

function stopIceCubes() {
  if (iceInterval) {
    clearInterval(iceInterval);
    iceInterval = null;
  }

  if (iceLayer) {
    iceLayer.classList.remove("active");
    iceLayer.replaceChildren();
  }
}

/* =========================================
   RESET MILK AND CHOCOLATE
========================================= */

function resetEffects() {
  if (milkSpill) {
    milkSpill.classList.remove("visible");
  }

  if (chocolateSpill) {
    chocolateSpill.classList.remove("visible");
  }

  stopIceCubes();
}

/* =========================================
   MILK AND CHOCOLATE SEQUENCE
========================================= */

function runSpillSequence() {
  // Milk appears three seconds after Layer 2 opens.
  later(() => {
    if (!started) return;

    milkSpill.classList.add("visible");
  }, 3000);

  // Chocolate appears after the milk.
  later(() => {
    if (!started) return;

    chocolateSpill.classList.add("visible");
    replayButton.hidden = false;
  }, 6000);
}

/* =========================================
   START EXPERIENCE
========================================= */

async function startExperience() {
  if (started) return;

  started = true;
  replayButton.hidden = true;

  clearSequence();
  resetEffects();
  createEffects();

  background.style.backgroundImage = 'url("layer2.jpg")';

  // Reveal Layer 2.
  reveal.classList.add("active");

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.add("transitioning");
      reveal.classList.add("open");

      // Ice starts ONLY after Layer 2 opens.
      startIceCubes();

      // Milk and chocolate follow.
      runSpillSequence();
    });
  });
}

/* =========================================
   START WHEN USER REACHES PAGE BOTTOM
========================================= */

function checkBottom() {
  const atBottom =
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight - 5;

  if (atBottom && !started) {
    startExperience();
  }
}

window.addEventListener("scroll", checkBottom, {
  passive: true
});

window.addEventListener("load", checkBottom);

/* =========================================
   REPLAY EXPERIENCE
========================================= */

replayButton.addEventListener("click", () => {
  clearSequence();
  stopIceCubes();

  started = false;

  document.body.classList.remove("transitioning");
  reveal.classList.remove("active", "open");

  replayButton.hidden = true;

  resetEffects();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      startExperience();
    });
  });
});
