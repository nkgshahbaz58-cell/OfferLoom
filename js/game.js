// =====================================================
// MAIN GAME ENGINE — Canvas 2D Top-Down Racing
// =====================================================

const GameState = {
    MENU: "menu",
    CAR_SELECT: "car_select",
    TRACK_SELECT: "track_select",
    COUNTDOWN: "countdown",
    RACING: "racing",
    PAUSED: "paused",
    RESULTS: "results",
};

let state = GameState.MENU;
let selectedCar = CARS[0];
let selectedTrack = TRACKS[0];
let canvas, ctx;
let trackPoints = [];
let aiDrivers = [];
let player, gameLoop;
let raceStartTime = 0;
let lapTimes = [];
let currentLap = 0;
let nitroAmount = 100;
let nitroActive = false;
let countdownVal = 3;
let countdownTimer = 0;
let lastTimestamp = 0;
let keys = {};
let touchLeft = false, touchRight = false, touchUp = false, touchDown = false, touchNitro = false;
let pauseOverlay, hudEl;
let position = 1;
let raceFinished = false;
let finishTime = 0;

// Player object
function createPlayer(car, startPos) {
    return {
        x: startPos.x,
        y: startPos.y,
        angle: 0,
        speed: 0,
        maxSpeed: (car.speed / 10) * 5.5,
        acceleration: car.acceleration / 10 * 0.15,
        handling: car.handling / 10 * 0.055,
        car: car,
        lapsCompleted: 0,
        totalProgress: 0,
        lastPassedStart: false,
        nitro: 100,
        nitroActive: false,
        checkpointIdx: 0,
    };
}

// ── Input ──────────────────────────────────────────
document.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (e.code === "Escape" && state === GameState.RACING) togglePause();
    if (e.code === "Escape" && state === GameState.PAUSED) togglePause();
    if (e.code === "Space" && state === GameState.RACING) activateNitro();
});
document.addEventListener("keyup", (e) => { keys[e.code] = false; });

function isLeft() { return keys["ArrowLeft"] || keys["KeyA"] || touchLeft; }
function isRight() { return keys["ArrowRight"] || keys["KeyD"] || touchRight; }
function isUp() { return keys["ArrowUp"] || keys["KeyW"] || touchUp; }
function isDown() { return keys["ArrowDown"] || keys["KeyS"] || touchDown; }

// ── Touch Controls ─────────────────────────────────
function setupTouchControls() {
    document.getElementById("btn-left").addEventListener("touchstart", (e) => { e.preventDefault(); touchLeft = true; }, { passive: false });
    document.getElementById("btn-left").addEventListener("touchend", () => touchLeft = false);
    document.getElementById("btn-right").addEventListener("touchstart", (e) => { e.preventDefault(); touchRight = true; }, { passive: false });
    document.getElementById("btn-right").addEventListener("touchend", () => touchRight = false);
    document.getElementById("btn-up").addEventListener("touchstart", (e) => { e.preventDefault(); touchUp = true; }, { passive: false });
    document.getElementById("btn-up").addEventListener("touchend", () => touchUp = false);
    document.getElementById("btn-down").addEventListener("touchstart", (e) => { e.preventDefault(); touchDown = true; }, { passive: false });
    document.getElementById("btn-down").addEventListener("touchend", () => touchDown = false);
    document.getElementById("btn-nitro").addEventListener("touchstart", (e) => { e.preventDefault(); activateNitro(); }, { passive: false });
}

// ── Nitro ──────────────────────────────────────────
function activateNitro() {
    if (state !== GameState.RACING || nitroAmount < 20) return;
    nitroActive = true;
    audioEngine.playNitro();
    setTimeout(() => { nitroActive = false; }, 1200);
}

// ── Track Boundary Check ───────────────────────────
function isOnTrack(x, y) {
    let minDist = Infinity;
    const step = 4;
    for (let i = 0; i < trackPoints.length; i += step) {
        const pt = trackPoints[i];
        const d = Math.hypot(x - pt.x, y - pt.y);
        if (d < minDist) minDist = d;
    }
    return minDist < selectedTrack.trackWidth / 2 + 8;
}

// ── Position Calculation ───────────────────────────
function calcPosition() {
    const total = trackPoints.length;
    const playerProg = player.totalProgress;
    let ahead = 0;
    for (const ai of aiDrivers) {
        if (ai.totalProgress > playerProg) ahead++;
    }
    return ahead + 1;
}

// ── Lap Detection ──────────────────────────────────
function checkLap() {
    const sp = trackPoints[0];
    const dist = Math.hypot(player.x - sp.x, player.y - sp.y);
    if (dist < 35 && player.totalProgress > 50 && !player.lastPassedStart) {
        player.lastPassedStart = true;
        if (currentLap > 0) {
            const lapTime = Date.now() - raceStartTime - lapTimes.reduce((a, b) => a + b, 0);
            lapTimes.push(lapTime);
            audioEngine.playLapComplete();
        }
        currentLap++;
        player.lapsCompleted = currentLap - 1;
        updateHUD();
        if (currentLap > selectedTrack.laps) {
            finishRace();
        }
    } else if (dist > 60) {
        player.lastPassedStart = false;
    }
}

// ── Player Update ──────────────────────────────────
function updatePlayer(dt) {
    const onRoad = isOnTrack(player.x, player.y);
    const friction = onRoad ? 0.97 : 0.88;
    const nitroMult = nitroActive ? 1.7 : 1;

    if (isUp()) {
        player.speed = Math.min(player.speed + player.acceleration * nitroMult, player.maxSpeed * nitroMult);
    } else if (isDown()) {
        player.speed = Math.max(player.speed - player.acceleration * 1.5, -player.maxSpeed * 0.4);
    } else {
        player.speed *= friction;
    }

    if (Math.abs(player.speed) > 0.3) {
        const turnAmount = player.handling * (player.speed / player.maxSpeed);
        if (isLeft()) player.angle -= turnAmount;
        if (isRight()) player.angle += turnAmount;
    }

    player.x += Math.cos(player.angle) * player.speed;
    player.y += Math.sin(player.angle) * player.speed;

    // Track progress
    const nearestIdx = findNearestTrackPoint(player.x, player.y);
    if (nearestIdx > player.checkpointIdx || (nearestIdx < 20 && player.checkpointIdx > trackPoints.length - 20)) {
        player.totalProgress++;
        player.checkpointIdx = nearestIdx;
    }

    // Nitro depletion
    if (nitroActive) {
        nitroAmount = Math.max(0, nitroAmount - 1.5);
        if (nitroAmount === 0) nitroActive = false;
    } else {
        nitroAmount = Math.min(100, nitroAmount + 0.15);
    }

    // Engine sound update
    audioEngine.updateEngineSpeed(Math.abs(player.speed) / player.maxSpeed);

    checkLap();
}

function findNearestTrackPoint(x, y) {
    let minDist = Infinity; let minIdx = 0;
    const step = 3;
    for (let i = 0; i < trackPoints.length; i += step) {
        const d = Math.hypot(x - trackPoints[i].x, y - trackPoints[i].y);
        if (d < minDist) { minDist = d; minIdx = i; }
    }
    return minIdx;
}

// ── HUD Update ─────────────────────────────────────
function updateHUD() {
    const spd = Math.abs(Math.round(player.speed * 40));
    document.getElementById("hud-speed").textContent = spd + " km/h";
    document.getElementById("hud-lap").textContent = `Lap ${Math.min(currentLap, selectedTrack.laps)} / ${selectedTrack.laps}`;
    document.getElementById("hud-pos").textContent = `P${position}`;
    const elapsed = Date.now() - raceStartTime;
    document.getElementById("hud-time").textContent = formatTime(elapsed);
    // Nitro bar
    const nitroBar = document.getElementById("nitro-bar-fill");
    if (nitroBar) {
        nitroBar.style.width = nitroAmount + "%";
        nitroBar.style.background = nitroActive
            ? "linear-gradient(90deg, #ff4655, #ff8a00)"
            : "linear-gradient(90deg, #00d4ff, #a259ff)";
    }
}

// ── Finish Race ────────────────────────────────────
function finishRace() {
    if (raceFinished) return;
    raceFinished = true;
    finishTime = Date.now() - raceStartTime;
    audioEngine.stopEngine();
    audioEngine.playFinish();
    setTimeout(() => {
        state = GameState.RESULTS;
        showResults();
    }, 1500);
}

function showResults() {
    document.getElementById("game-canvas-wrap").style.display = "none";
    document.getElementById("hud").style.display = "none";
    document.getElementById("touch-controls").style.display = "none";
    const res = document.getElementById("screen-results");
    res.style.display = "flex";
    document.getElementById("result-time").textContent = formatTime(finishTime);
    document.getElementById("result-pos").textContent = `P${position}`;
    document.getElementById("result-car").textContent = selectedCar.name;
    document.getElementById("result-track").textContent = selectedTrack.name;
    // Lap times
    const lapList = document.getElementById("result-laps");
    lapList.innerHTML = lapTimes.slice(0, selectedTrack.laps).map((lt, i) =>
        `<div class="lap-item"><span>Lap ${i + 1}</span><span>${formatTime(lt)}</span></div>`
    ).join("");
}

// ── Camera / Viewport ──────────────────────────────
function applyCamera() {
    const scale = Math.min(canvas.width, canvas.height) / 650;
    const ox = canvas.width / 2 - player.x * scale;
    const oy = canvas.height / 2 - player.y * scale;
    ctx.setTransform(scale, 0, 0, scale, ox, oy);
}

// ── Render ─────────────────────────────────────────
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    applyCamera();
    drawTrack(ctx, selectedTrack, canvas.width, canvas.height);

    // Draw AI cars
    for (const ai of aiDrivers) {
        drawCar(ctx, ai, ai.x, ai.y, ai.angle, false);
    }

    // Draw player
    drawCar(ctx, selectedCar, player.x, player.y, player.angle, true);

    // Nitro flame
    if (nitroActive) {
        const scale = Math.min(canvas.width, canvas.height) / 650;
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.angle + Math.PI);
        const flameLen = 20 + Math.random() * 15;
        const grad = ctx.createLinearGradient(0, 0, 0, flameLen);
        grad.addColorStop(0, "#FF4655");
        grad.addColorStop(0.5, "#FFD700");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(-6, 5);
        ctx.lineTo(6, 5);
        ctx.lineTo(0, flameLen);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// ── Countdown ──────────────────────────────────────
function renderCountdown() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    applyCamera();
    drawTrack(ctx, selectedTrack, canvas.width, canvas.height);
    for (const ai of aiDrivers) drawCar(ctx, ai, ai.x, ai.y, ai.angle, false);
    drawCar(ctx, selectedCar, player.x, player.y, player.angle, true);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const label = countdownVal > 0 ? String(countdownVal) : "GO!";
    const color = countdownVal > 0 ? "#FF4655" : "#00FF88";
    ctx.font = `bold ${canvas.width * 0.2}px 'Outfit', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 40;
    ctx.fillText(label, canvas.width / 2, canvas.height / 2);
    ctx.shadowBlur = 0;
}

// ── Main Loop ──────────────────────────────────────
function mainLoop(ts) {
    const dt = Math.min((ts - lastTimestamp) / 16, 3);
    lastTimestamp = ts;

    if (state === GameState.COUNTDOWN) {
        countdownTimer += dt;
        if (countdownTimer >= 60) {
            countdownTimer = 0;
            countdownVal--;
            if (countdownVal > 0) audioEngine.playBeep(false);
            if (countdownVal === 0) audioEngine.playBeep(true);
            if (countdownVal < 0) {
                state = GameState.RACING;
                raceStartTime = Date.now();
                audioEngine.startEngine(0.1);
            }
        }
        renderCountdown();
    } else if (state === GameState.RACING) {
        updatePlayer(dt);
        for (const ai of aiDrivers) ai.update(dt);
        position = calcPosition();
        if (Date.now() % 3 === 0) updateHUD();
        render();
    }

    gameLoop = requestAnimationFrame(mainLoop);
}

// ── Start Race ─────────────────────────────────────
function startRace() {
    audioEngine.init();
    audioEngine.resume();

    canvas = document.getElementById("race-canvas");
    ctx = canvas.getContext("2d");
    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    // Generate track
    trackPoints = getTrackPoints(selectedTrack, canvas.width, canvas.height);

    // Player start
    const startPt = trackPoints[0];
    player = createPlayer(selectedCar, startPt);
    player.angle = Math.atan2(
        trackPoints[5].y - trackPoints[0].y,
        trackPoints[5].x - trackPoints[0].x
    );

    // AI
    aiDrivers = createAIDrivers(selectedCar, trackPoints, 3);

    // Reset state
    currentLap = 1;
    lapTimes = [];
    nitroAmount = 100;
    nitroActive = false;
    raceFinished = false;
    countdownVal = 3;
    countdownTimer = 0;
    position = 1;

    state = GameState.COUNTDOWN;

    document.getElementById("screen-menu").style.display = "none";
    document.getElementById("screen-car-select").style.display = "none";
    document.getElementById("screen-track-select").style.display = "none";
    document.getElementById("screen-results").style.display = "none";
    document.getElementById("game-canvas-wrap").style.display = "block";
    document.getElementById("hud").style.display = "flex";

    // Touch controls for mobile
    const isMobile = window.innerWidth < 768;
    document.getElementById("touch-controls").style.display = isMobile ? "flex" : "none";

    if (gameLoop) cancelAnimationFrame(gameLoop);
    lastTimestamp = performance.now();
    gameLoop = requestAnimationFrame(mainLoop);

    setupTouchControls();
}

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (state === GameState.RACING || state === GameState.COUNTDOWN) {
        trackPoints = getTrackPoints(selectedTrack, canvas.width, canvas.height);
        if (player) {
            player.x = trackPoints[0].x;
            player.y = trackPoints[0].y;
        }
        for (const ai of aiDrivers) {
            ai.trackPoints = trackPoints;
        }
    }
}

// ── Pause ──────────────────────────────────────────
function togglePause() {
    if (state === GameState.RACING) {
        state = GameState.PAUSED;
        cancelAnimationFrame(gameLoop);
        audioEngine.stopEngine();
        document.getElementById("pause-overlay").style.display = "flex";
    } else if (state === GameState.PAUSED) {
        state = GameState.RACING;
        document.getElementById("pause-overlay").style.display = "none";
        audioEngine.startEngine(Math.abs(player.speed) / player.maxSpeed);
        lastTimestamp = performance.now();
        gameLoop = requestAnimationFrame(mainLoop);
    }
}

// ── UI Navigation ──────────────────────────────────
function showScreen(screenId) {
    ["screen-menu", "screen-car-select", "screen-track-select", "screen-results"].forEach(id => {
        document.getElementById(id).style.display = "none";
    });
    document.getElementById("game-canvas-wrap").style.display = "none";
    document.getElementById("hud").style.display = "none";
    document.getElementById("touch-controls").style.display = "none";
    document.getElementById(screenId).style.display = "flex";
}

// ── Car Select UI ──────────────────────────────────
function buildCarSelect() {
    const grid = document.getElementById("car-grid");
    grid.innerHTML = "";
    CARS.forEach((car) => {
        const card = document.createElement("div");
        card.className = "car-card" + (car.id === selectedCar.id ? " selected" : "");
        card.innerHTML = `
      <div class="car-preview" style="background:${car.color}22;border-color:${car.color}44">
        <canvas class="car-canvas" width="80" height="100" data-carid="${car.id}"></canvas>
        <span class="tier-badge ${car.tier}">${car.tier.toUpperCase()}</span>
      </div>
      <div class="car-name">${car.name}</div>
      <div class="car-desc">${car.desc}</div>
      <div class="car-stats">
        <div class="stat"><span>Speed</span>${buildBar(car.speed)}</div>
        <div class="stat"><span>Accel</span>${buildBar(car.acceleration)}</div>
        <div class="stat"><span>Handle</span>${buildBar(car.handling)}</div>
      </div>
    `;
        card.addEventListener("click", () => {
            selectedCar = car;
            buildCarSelect();
        });
        grid.appendChild(card);
        // Draw mini car preview
        requestAnimationFrame(() => {
            const miniCanvas = document.querySelector(`.car-canvas[data-carid="${car.id}"]`);
            if (miniCanvas) {
                const mc = miniCanvas.getContext("2d");
                mc.clearRect(0, 0, 80, 100);
                drawCar(mc, car, 40, 55, -Math.PI / 2);
            }
        });
    });
}

function buildBar(val) {
    const pct = (val / 10) * 100;
    return `<div class="stat-bar"><div class="stat-fill" style="width:${pct}%"></div></div>`;
}

// ── Track Select UI ────────────────────────────────
function buildTrackSelect() {
    const grid = document.getElementById("track-grid");
    grid.innerHTML = "";
    TRACKS.forEach((track) => {
        const card = document.createElement("div");
        card.className = "track-card" + (track.id === selectedTrack.id ? " selected" : "");
        card.style.borderColor = track.id === selectedTrack.id ? track.lineColor : "transparent";
        card.innerHTML = `
      <div class="track-thumb" style="background:${track.bgColor};border-color:${track.lineColor}40">
        <span class="track-emoji">${track.thumbnail}</span>
        <span class="tier-badge ${track.tier}">${track.tier.toUpperCase()}</span>
      </div>
      <div class="track-name">${track.name}</div>
      <div class="track-desc">${track.desc}</div>
      <div class="track-meta">
        <span class="difficulty diff-${track.difficulty.toLowerCase()}">${track.difficulty}</span>
        <span>${track.laps} Laps</span>
      </div>
    `;
        card.addEventListener("click", () => {
            selectedTrack = track;
            buildTrackSelect();
        });
        grid.appendChild(card);
    });
}

// ── Save Score ─────────────────────────────────────
function saveResultScore() {
    const name = document.getElementById("player-name-input").value.trim() || "Anonymous";
    saveScore(selectedTrack.id, name, finishTime, selectedCar.name);
    alert("Score saved! 🏆");
}

// ── Init on page load ─────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
    showScreen("screen-menu");

    document.getElementById("btn-play").addEventListener("click", () => {
        buildCarSelect();
        showScreen("screen-car-select");
    });
    document.getElementById("btn-leaderboard").addEventListener("click", () => {
        window.location.href = "../dashboard/";
    });
    document.getElementById("btn-car-next").addEventListener("click", () => {
        buildTrackSelect();
        showScreen("screen-track-select");
    });
    document.getElementById("btn-car-back").addEventListener("click", () => showScreen("screen-menu"));
    document.getElementById("btn-track-race").addEventListener("click", () => startRace());
    document.getElementById("btn-track-back").addEventListener("click", () => {
        buildCarSelect();
        showScreen("screen-car-select");
    });
    document.getElementById("btn-pause").addEventListener("click", togglePause);
    document.getElementById("btn-resume").addEventListener("click", togglePause);
    document.getElementById("btn-quit-race").addEventListener("click", () => {
        cancelAnimationFrame(gameLoop);
        audioEngine.stopEngine();
        state = GameState.MENU;
        document.getElementById("pause-overlay").style.display = "none";
        showScreen("screen-menu");
    });
    document.getElementById("btn-save-score").addEventListener("click", saveResultScore);
    document.getElementById("btn-play-again").addEventListener("click", () => startRace());
    document.getElementById("btn-main-menu").addEventListener("click", () => {
        cancelAnimationFrame(gameLoop);
        audioEngine.stopEngine();
        showScreen("screen-menu");
    });

    // Leaderboard page
    if (document.getElementById("track-tabs")) {
        TRACKS.forEach((t) => {
            const btn = document.createElement("button");
            btn.className = "tab-btn" + (t.id === 0 ? " active" : "");
            btn.textContent = t.name;
            btn.addEventListener("click", () => {
                document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                renderLeaderboardTable("lb-container", t.id);
            });
            document.getElementById("track-tabs").appendChild(btn);
        });
        renderLeaderboardTable("lb-container", 0);
    }
});
