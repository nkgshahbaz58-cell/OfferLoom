// Leaderboard — localStorage based
const LEADERBOARD_KEY = "carRacingLeaderboard_v2";

function getLeaderboard() {
    try {
        return JSON.parse(localStorage.getItem(LEADERBOARD_KEY)) || {};
    } catch {
        return {};
    }
}

function saveScore(trackId, playerName, timeMs, carName) {
    const lb = getLeaderboard();
    if (!lb[trackId]) lb[trackId] = [];
    lb[trackId].push({
        name: playerName || "Anonymous",
        time: timeMs,
        car: carName,
        date: new Date().toLocaleDateString(),
    });
    lb[trackId].sort((a, b) => a.time - b.time);
    lb[trackId] = lb[trackId].slice(0, 10); // top 10
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(lb));
}

function getTrackLeaderboard(trackId) {
    return getLeaderboard()[trackId] || [];
}

function formatTime(ms) {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${m}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

function clearLeaderboard() {
    localStorage.removeItem(LEADERBOARD_KEY);
}

// Render leaderboard table into a container element
function renderLeaderboardTable(containerId, trackId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const entries = getTrackLeaderboard(trackId);
    if (entries.length === 0) {
        container.innerHTML = '<p class="no-scores">No scores yet. Be the first!</p>';
        return;
    }
    const medals = ["🥇", "🥈", "🥉"];
    container.innerHTML = `
    <table class="lb-table">
      <thead>
        <tr><th>#</th><th>Player</th><th>Car</th><th>Time</th><th>Date</th></tr>
      </thead>
      <tbody>
        ${entries.map((e, i) => `
          <tr class="${i === 0 ? "first" : i === 1 ? "second" : i === 2 ? "third" : ""}">
            <td>${medals[i] || (i + 1)}</td>
            <td>${e.name}</td>
            <td>${e.car}</td>
            <td class="time-cell">${formatTime(e.time)}</td>
            <td>${e.date}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}
