// Car definitions for the racing game
const CARS = [
  {
    id: 0,
    name: "Blaze X",
    desc: "Balanced all-rounder",
    color: "#FF4655",
    accentColor: "#FF8A93",
    speed: 7,
    acceleration: 6,
    handling: 7,
    tier: "free",
    width: 30,
    height: 54,
  },
  {
    id: 1,
    name: "Storm V12",
    desc: "Top speed monster",
    color: "#00D4FF",
    accentColor: "#80EAFF",
    speed: 10,
    acceleration: 5,
    handling: 5,
    tier: "free",
    width: 30,
    height: 56,
  },
  {
    id: 2,
    name: "Phantom GT",
    desc: "Corner master",
    color: "#A259FF",
    accentColor: "#C99DFF",
    speed: 7,
    acceleration: 7,
    handling: 10,
    tier: "pro",
    width: 28,
    height: 52,
  },
  {
    id: 3,
    name: "Viper RS",
    desc: "Blazing acceleration",
    color: "#00FF88",
    accentColor: "#80FFC3",
    speed: 8,
    acceleration: 10,
    handling: 6,
    tier: "pro",
    width: 29,
    height: 53,
  },
  {
    id: 4,
    name: "Titan Ultra",
    desc: "Supreme performance",
    color: "#FFD700",
    accentColor: "#FFE97D",
    speed: 10,
    acceleration: 9,
    handling: 9,
    tier: "premium",
    width: 32,
    height: 58,
  },
];

function drawCar(ctx, car, x, y, angle = 0, isPlayer = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const w = car.width;
  const h = car.height;
  const hw = w / 2;
  const hh = h / 2;

  // ── Underglow Effect ──
  if (isPlayer) {
    const glowGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, hw + 20);
    glowGrad.addColorStop(0, car.color + "50");
    glowGrad.addColorStop(1, "transparent");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(-hw - 20, -hh - 20, w + 40, h + 40);
  }

  // ── Car Shadow ──
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 5;

  // ── Wheels (drawn first, behind body) ──
  const wheelW = 7;
  const wheelH = 14;
  const wheelInset = 2;
  const wheelPositions = [
    { x: -hw - wheelInset, y: -hh + 8 },   // Front-left
    { x: hw - wheelW + wheelInset, y: -hh + 8 },  // Front-right
    { x: -hw - wheelInset, y: hh - wheelH - 6 },  // Rear-left
    { x: hw - wheelW + wheelInset, y: hh - wheelH - 6 }, // Rear-right
  ];

  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  wheelPositions.forEach((wp, i) => {
    // Tire
    ctx.fillStyle = "#111118";
    ctx.beginPath();
    ctx.roundRect(wp.x, wp.y, wheelW, wheelH, 2);
    ctx.fill();

    // Tire tread marks
    ctx.strokeStyle = "#222230";
    ctx.lineWidth = 0.5;
    for (let t = 2; t < wheelH - 2; t += 3) {
      ctx.beginPath();
      ctx.moveTo(wp.x + 1, wp.y + t);
      ctx.lineTo(wp.x + wheelW - 1, wp.y + t);
      ctx.stroke();
    }

    // Rim
    const rimX = wp.x + wheelW / 2;
    const rimY = wp.y + wheelH / 2;
    ctx.fillStyle = "#555566";
    ctx.beginPath();
    ctx.arc(rimX, rimY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Rim highlight
    ctx.fillStyle = car.accentColor + "80";
    ctx.beginPath();
    ctx.arc(rimX, rimY, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // ── Car Body (Aerodynamic Shape) ──
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;

  // Main body gradient
  const bodyGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
  bodyGrad.addColorStop(0, car.accentColor);
  bodyGrad.addColorStop(0.4, car.color);
  bodyGrad.addColorStop(1, darkenColor(car.color, 40));
  ctx.fillStyle = bodyGrad;

  // Aerodynamic body path
  ctx.beginPath();
  ctx.moveTo(-hw + 4, -hh + 6);      // Top-left (front nose)
  ctx.quadraticCurveTo(-hw + 2, -hh, 0, -hh - 2);  // Front nose curve left
  ctx.quadraticCurveTo(hw - 2, -hh, hw - 4, -hh + 6); // Front nose curve right
  ctx.lineTo(hw - 2, -hh + 12);       // Right front fender
  ctx.quadraticCurveTo(hw + 1, -hh + 16, hw, hh - 12); // Right side
  ctx.quadraticCurveTo(hw + 1, hh - 6, hw - 3, hh - 2); // Rear right
  ctx.lineTo(hw - 6, hh);             // Rear right corner
  ctx.lineTo(-hw + 6, hh);            // Rear left corner
  ctx.lineTo(-hw + 3, hh - 2);        // Rear left
  ctx.quadraticCurveTo(-hw - 1, hh - 6, -hw, hh - 12); // Left side
  ctx.quadraticCurveTo(-hw - 1, -hh + 16, -hw + 2, -hh + 12); // Left front fender
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // ── Specular Highlight (reflective paint) ──
  const specGrad = ctx.createLinearGradient(-hw, -hh, hw * 0.3, hh * 0.5);
  specGrad.addColorStop(0, "rgba(255,255,255,0.25)");
  specGrad.addColorStop(0.5, "rgba(255,255,255,0.08)");
  specGrad.addColorStop(1, "transparent");
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.moveTo(-hw + 5, -hh + 8);
  ctx.quadraticCurveTo(-hw + 3, -hh + 2, 0, -hh);
  ctx.quadraticCurveTo(hw * 0.3, -hh + 2, hw * 0.3, -hh + 10);
  ctx.lineTo(-hw + 5, hh * 0.3);
  ctx.closePath();
  ctx.fill();

  // ── Windshield ──
  const wsGrad = ctx.createLinearGradient(0, -hh + 7, 0, -hh + 7 + h * 0.28);
  wsGrad.addColorStop(0, "rgba(120,200,255,0.55)");
  wsGrad.addColorStop(1, "rgba(80,150,220,0.25)");
  ctx.fillStyle = wsGrad;
  ctx.beginPath();
  ctx.moveTo(-hw + 6, -hh + 10);
  ctx.quadraticCurveTo(-hw + 5, -hh + 7, 0, -hh + 5);
  ctx.quadraticCurveTo(hw - 5, -hh + 7, hw - 6, -hh + 10);
  ctx.lineTo(hw - 7, -hh + 7 + h * 0.28);
  ctx.lineTo(-hw + 7, -hh + 7 + h * 0.28);
  ctx.closePath();
  ctx.fill();

  // Windshield frame
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // ── Rear Window ──
  ctx.fillStyle = "rgba(100,170,230,0.25)";
  ctx.beginPath();
  ctx.roundRect(-hw + 6, h * 0.15, w - 12, h * 0.18, 4);
  ctx.fill();

  // ── Side Mirrors ──
  ctx.fillStyle = car.color;
  // Left mirror
  ctx.beginPath();
  ctx.ellipse(-hw - 3, -hh + 14, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  // Right mirror
  ctx.beginPath();
  ctx.ellipse(hw + 3, -hh + 14, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mirror glass
  ctx.fillStyle = "rgba(150,220,255,0.5)";
  ctx.beginPath();
  ctx.ellipse(-hw - 3, -hh + 14, 2, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(hw + 3, -hh + 14, 2, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Hood Scoop / Intake ──
  ctx.fillStyle = darkenColor(car.color, 60);
  ctx.beginPath();
  ctx.roundRect(-4, -hh + h * 0.3, 8, 6, 2);
  ctx.fill();
  // Intake grille lines
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 0.5;
  for (let i = -2; i <= 2; i += 2) {
    ctx.beginPath();
    ctx.moveTo(i, -hh + h * 0.3 + 1);
    ctx.lineTo(i, -hh + h * 0.3 + 5);
    ctx.stroke();
  }

  // ── Spoiler (rear wing) ──
  ctx.fillStyle = darkenColor(car.color, 30);
  ctx.beginPath();
  ctx.roundRect(-hw + 2, hh - 4, w - 4, 3, 1);
  ctx.fill();
  // Spoiler supports
  ctx.fillStyle = darkenColor(car.color, 50);
  ctx.fillRect(-hw + 6, hh - 7, 2, 5);
  ctx.fillRect(hw - 8, hh - 7, 2, 5);

  // ── Headlights ──
  ctx.fillStyle = "#FFFDE0";
  ctx.shadowColor = "#FFFDE0";
  ctx.shadowBlur = 12;
  // Left headlight
  ctx.beginPath();
  ctx.moveTo(-hw + 4, -hh + 4);
  ctx.lineTo(-hw + 10, -hh + 3);
  ctx.lineTo(-hw + 10, -hh + 7);
  ctx.lineTo(-hw + 4, -hh + 8);
  ctx.closePath();
  ctx.fill();
  // Right headlight
  ctx.beginPath();
  ctx.moveTo(hw - 4, -hh + 4);
  ctx.lineTo(hw - 10, -hh + 3);
  ctx.lineTo(hw - 10, -hh + 7);
  ctx.lineTo(hw - 4, -hh + 8);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // ── Taillights ──
  ctx.fillStyle = "#FF2020";
  ctx.shadowColor = car.color;
  ctx.shadowBlur = 10;
  // Left taillight
  ctx.beginPath();
  ctx.roundRect(-hw + 4, hh - 6, 8, 3, 1);
  ctx.fill();
  // Right taillight
  ctx.beginPath();
  ctx.roundRect(hw - 12, hh - 6, 8, 3, 1);
  ctx.fill();
  ctx.shadowBlur = 0;

  // ── Racing Stripe (center) ──
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(0, -hh + 3);
  ctx.lineTo(0, hh - 3);
  ctx.stroke();
  ctx.setLineDash([]);

  // ── Player Indicator Glow ──
  if (isPlayer) {
    ctx.shadowColor = car.color;
    ctx.shadowBlur = 25;
    ctx.strokeStyle = car.accentColor + "80";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-hw + 4, -hh + 6);
    ctx.quadraticCurveTo(-hw + 2, -hh, 0, -hh - 2);
    ctx.quadraticCurveTo(hw - 2, -hh, hw - 4, -hh + 6);
    ctx.lineTo(hw - 2, -hh + 12);
    ctx.quadraticCurveTo(hw + 1, -hh + 16, hw, hh - 12);
    ctx.quadraticCurveTo(hw + 1, hh - 6, hw - 3, hh - 2);
    ctx.lineTo(hw - 6, hh);
    ctx.lineTo(-hw + 6, hh);
    ctx.lineTo(-hw + 3, hh - 2);
    ctx.quadraticCurveTo(-hw - 1, hh - 6, -hw, hh - 12);
    ctx.quadraticCurveTo(-hw - 1, -hh + 16, -hw + 2, -hh + 12);
    ctx.closePath();
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

// Utility: darken a hex color
function darkenColor(hex, amount) {
  hex = hex.replace('#', '');
  let r = Math.max(0, parseInt(hex.substring(0, 2), 16) - amount);
  let g = Math.max(0, parseInt(hex.substring(2, 4), 16) - amount);
  let b = Math.max(0, parseInt(hex.substring(4, 6), 16) - amount);
  return `rgb(${r},${g},${b})`;
}
