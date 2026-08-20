const balloonLayer = document.getElementById("balloons");
const candlesLayer = document.getElementById("candles");
const blowBtn = document.getElementById("blowBtn");
const relightBtn = document.getElementById("relightBtn");
const statusEl = document.getElementById("status");
const toast = document.getElementById("toast");
const canvas = document.getElementById("confetti");
const wishEl = document.getElementById("wish");
const ctx = canvas.getContext("2d");

const BALLOON_COUNT = 7;
const CANDLE_COUNT = 6;
const GOLD = ["#c9a441", "#e8d48a", "#6fbf45", "#2d8a4a", "#fff4c2"];

const balloonLayout = [
  { x: "6%", y: "2%", size: 108, duration: 6.8, delay: "0s" },
  { x: "28%", y: "-4%", size: 86, duration: 5.6, delay: ".4s" },
  { x: "46%", y: "8%", size: 124, duration: 7.4, delay: ".8s" },
  { x: "18%", y: "22%", size: 96, duration: 6.2, delay: "1.1s" },
  { x: "40%", y: "28%", size: 78, duration: 5.2, delay: ".2s" },
  { x: "2%", y: "38%", size: 90, duration: 7.1, delay: "1.6s" },
  { x: "24%", y: "52%", size: 100, duration: 6.4, delay: ".9s" },
];

let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createBalloons() {
  balloonLayer.innerHTML = "";
  balloonLayout.slice(0, BALLOON_COUNT).forEach((config, index) => {
    const balloon = document.createElement("button");
    balloon.className = "balloon";
    balloon.type = "button";
    balloon.setAttribute("aria-label", `Globo ${index + 1}. Pulsa para reventar`);
    balloon.style.left = config.x;
    balloon.style.top = config.y;
    balloon.style.setProperty("--size", `${config.size}px`);
    balloon.style.setProperty("--duration", `${config.duration}s`);
    balloon.style.setProperty("--delay", config.delay);
    balloon.innerHTML = `
      <span class="balloon-body">
        <span class="balloon-sticker">Ft<small>FACTOTAL</small></span>
      </span>
      <span class="balloon-knot"></span>
      <span class="balloon-string"></span>
    `;
    balloon.addEventListener("click", () => popBalloon(balloon, config));
    balloonLayer.appendChild(balloon);
  });
}

function popBalloon(balloon, config) {
  if (balloon.classList.contains("popping")) return;
  balloon.classList.add("popping");
  const rect = balloon.getBoundingClientRect();
  burst(rect.left + rect.width / 2, rect.top + rect.height / 3, 18);
  window.setTimeout(() => {
    balloon.remove();
    window.setTimeout(() => respawnBalloon(config), 1400);
  }, 360);
}

function respawnBalloon(config) {
  const exists = [...balloonLayer.children].some(
    (el) => el.style.left === config.x && el.style.top === config.y
  );
  if (exists) return;
  const balloon = document.createElement("button");
  balloon.className = "balloon";
  balloon.type = "button";
  balloon.setAttribute("aria-label", "Globo. Pulsa para reventar");
  balloon.style.left = config.x;
  balloon.style.top = config.y;
  balloon.style.setProperty("--size", `${config.size}px`);
  balloon.style.setProperty("--duration", `${config.duration}s`);
  balloon.style.setProperty("--delay", "0s");
  balloon.innerHTML = `
    <span class="balloon-body">
      <span class="balloon-sticker">Ft<small>FACTOTAL</small></span>
    </span>
    <span class="balloon-knot"></span>
    <span class="balloon-string"></span>
  `;
  balloon.addEventListener("click", () => popBalloon(balloon, config));
  balloonLayer.appendChild(balloon);
}

function createCandles() {
  candlesLayer.innerHTML = "";
  for (let i = 0; i < CANDLE_COUNT; i += 1) {
    const candle = document.createElement("button");
    candle.className = "candle";
    candle.type = "button";
    candle.setAttribute("aria-label", "Vela encendida. Pulsa para apagar o encender");
    candle.innerHTML = `<span class="wick"></span><span class="flame"></span><span class="smoke"></span>`;
    candle.addEventListener("click", () => {
      candle.classList.toggle("out");
      candle.setAttribute(
        "aria-label",
        candle.classList.contains("out") ? "Vela apagada" : "Vela encendida"
      );
      updateStatus();
    });
    candlesLayer.appendChild(candle);
  }
}

function candles() {
  return [...candlesLayer.querySelectorAll(".candle")];
}

function blowCandles() {
  const lit = candles().filter((c) => !c.classList.contains("out"));
  if (!lit.length) {
    statusEl.textContent = "Las velas ya están apagadas. Enciéndelas de nuevo.";
    return;
  }
  lit.forEach((candle, i) => {
    window.setTimeout(() => candle.classList.add("out"), i * 90);
  });
  const cake = document.getElementById("cake").getBoundingClientRect();
  burst(cake.left + cake.width / 2, cake.top + 20, 42);
  window.setTimeout(() => {
    showWish();
    updateStatus();
  }, 700);
}

function relightCandles() {
  candles().forEach((candle) => candle.classList.remove("out"));
  statusEl.textContent = "Velas encendidas. Pide un deseo y sopla.";
}

function updateStatus() {
  const remaining = candles().filter((c) => !c.classList.contains("out")).length;
  if (remaining === 0) {
    statusEl.textContent = "Todas las velas están apagadas.";
  } else {
    statusEl.textContent = `${remaining} vela${remaining === 1 ? "" : "s"} encendida${remaining === 1 ? "" : "s"}.`;
  }
}

function showWish() {
  toast.hidden = false;
  window.setTimeout(() => {
    toast.hidden = true;
  }, 1800);
}

function burst(x, y, count) {
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 9,
      vy: Math.random() * -8 - 2,
      g: 0.16 + Math.random() * 0.08,
      size: 4 + Math.random() * 5,
      rot: Math.random() * 360,
      vr: (Math.random() - 0.5) * 12,
      color: GOLD[Math.floor(Math.random() * GOLD.length)],
      life: 90 + Math.random() * 40,
    });
  }
}

function spawnAmbientConfetti() {
  particles.push({
    x: Math.random() * canvas.width,
    y: -12,
    vx: (Math.random() - 0.5) * 1.2,
    vy: 1.2 + Math.random() * 1.6,
    g: 0.02,
    size: 3 + Math.random() * 4,
    rot: Math.random() * 360,
    vr: (Math.random() - 0.5) * 8,
    color: GOLD[Math.floor(Math.random() * GOLD.length)],
    life: 220,
  });
}

function tick() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (Math.random() < 0.18) spawnAmbientConfetti();
  particles = particles.filter((p) => p.life > 0 && p.y < canvas.height + 20);
  particles.forEach((p) => {
    p.vy += p.g;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.life -= 1;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rot * Math.PI) / 180);
    ctx.globalAlpha = Math.max(p.life / 120, 0.15);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    ctx.restore();
  });
  requestAnimationFrame(tick);
}

function personalize() {
  const name = new URLSearchParams(window.location.search).get("nombre");
  if (!name) return;
  const safe = name.trim().slice(0, 40);
  if (!safe) return;
  wishEl.textContent = `¡Feliz cumpleaños, ${safe}! Te deseamos un día increíble, que hoy y el año que se viene te traiga éxitos, alegrías y muchos más.`;
}

toast.addEventListener("click", () => {
  toast.hidden = true;
});

blowBtn.addEventListener("click", blowCandles);
relightBtn.addEventListener("click", relightCandles);
window.addEventListener("resize", resizeCanvas);

resizeCanvas();
createBalloons();
createCandles();
personalize();
updateStatus();
tick();
