const IMAGES = [
  "apple.png",
  "pear.png",
  "lemon.png",
  "peach.png",
  "cherry.png"
];

const VISIBLE = 1;
const SYMBOL_H = 160; 

let user = prompt("Введіть своє ім’я:");
if (!user || !user.trim()) {
  do {
    user = prompt("Будь ласка, введіть своє ім’я:");
  } while (!user || !user.trim());
}

document.getElementById("userTitle").innerText = user;

let attempts = 0;
let win = false;
const maxAttempts = 3;
document.getElementById("attemptInfo").innerText = `Спроба ${attempts} з ${maxAttempts}`;

const spinBtn = document.getElementById("spinBtn");
const reelEls = [
  document.getElementById("reel1"),
  document.getElementById("reel2"),
  document.getElementById("reel3")
];

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function populateReel(reelEl) {
  reelEl.innerHTML = "";
  const order = shuffle([...IMAGES]);
  for (let r = 0; r < 6; r++) {
    for (let i = 0; i < order.length; i++) {
      const img = document.createElement("img");
      img.src = order[i];
      reelEl.appendChild(img);
    }
  }
  for (let i = 0; i < VISIBLE; i++) {
    const img = document.createElement("img");
    img.src = order[i];
    reelEl.appendChild(img);
  }
}

reelEls.forEach(r => populateReel(r));

let spinning = false;

spinBtn.addEventListener("click", async () => {
  if (spinning || attempts >= maxAttempts) return;
  spinning = true;
  spinBtn.disabled = true;
  attempts++;
  document.getElementById("attemptInfo").innerText = `Спроба ${attempts} з ${maxAttempts}`;
  document.getElementById("result").innerText = "";

  const spinDur = 1500;
  const stopDelay = 500;

  const spinIntervals = [];

  reelEls.forEach(reelEl => {
    reelEl.style.transition = "transform 100ms linear";
    let step = 0;
    spinIntervals.push(setInterval(() => {
      step = (step + 3) % reelEl.children.length;
      reelEl.style.transform = `translateY(${-step * SYMBOL_H}px)`;
    }, 100));
  });

  const finalIndices = [];

  for (let i = 0; i < reelEls.length; i++) {
    await wait(spinDur);

    clearInterval(spinIntervals[i]);
    const reelEl = reelEls[i];
    const pick = Math.floor(Math.random() * IMAGES.length);
    const blockSize = IMAGES.length;
    const repeatedBlocks = 3;
    const absIndex = (repeatedBlocks * blockSize) + pick;

    reelEl.style.transition = "transform 1200ms cubic-bezier(0.1, 0.9, 0.3, 1)";
    reelEl.style.transform = `translateY(${-absIndex * SYMBOL_H}px)`;

    finalIndices.push(reelEl.children[absIndex].src);

    await wait(stopDelay);
  }

  await wait(1300);

  const centerSymbols = reelEls.map(reelEl => {
    const transform = reelEl.style.transform;
    const match = transform.match(/-?(\d+(\.\d+)?)px/);
    if (!match) return "";
    const offset = parseFloat(match[1]);
    const index = Math.round(offset / SYMBOL_H);
    const img = reelEl.children[index + 1];
    return img ? img.src.split("/").pop() : "";
  });

  const allEqual = centerSymbols.every(s => s && s === centerSymbols[0]);

  if (allEqual) {
    document.getElementById("result").innerText = "Ви виграли";
    win = true;
  } else {
    document.getElementById("result").innerText = "Програш";
  }
  spinning = false;
  spinBtn.disabled = attempts >= maxAttempts;
});

function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}
