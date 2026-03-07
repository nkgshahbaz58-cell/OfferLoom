// Track definitions
const TRACKS = [
    {
        id: 0,
        name: "Neon City",
        desc: "Urban circuit with tight corners",
        difficulty: "Easy",
        laps: 3,
        bgColor: "#0a0a1a",
        roadColor: "#1a1a3e",
        lineColor: "#00D4FF",
        borderColor: "#FF4655",
        grassColor: "#0d1f12",
        thumbnail: "🏙️",
        tier: "free",
        trackWidth: 120,
        // Waypoints as percentage of canvas (0-1)
        waypoints: [
            { x: 0.5, y: 0.85 },
            { x: 0.85, y: 0.75 },
            { x: 0.9, y: 0.5 },
            { x: 0.85, y: 0.25 },
            { x: 0.65, y: 0.12 },
            { x: 0.35, y: 0.12 },
            { x: 0.15, y: 0.25 },
            { x: 0.1, y: 0.5 },
            { x: 0.15, y: 0.75 },
        ],
    },
    {
        id: 1,
        name: "Desert Dunes",
        desc: "Wide open track with long straights",
        difficulty: "Medium",
        laps: 3,
        bgColor: "#1a0f00",
        roadColor: "#3d2b00",
        lineColor: "#FFD700",
        borderColor: "#FF8C00",
        grassColor: "#2d1a00",
        thumbnail: "🏜️",
        tier: "free",
        trackWidth: 140,
        waypoints: [
            { x: 0.5, y: 0.88 },
            { x: 0.8, y: 0.8 },
            { x: 0.88, y: 0.55 },
            { x: 0.75, y: 0.3 },
            { x: 0.5, y: 0.15 },
            { x: 0.25, y: 0.3 },
            { x: 0.12, y: 0.55 },
            { x: 0.2, y: 0.8 },
        ],
    },
    {
        id: 2,
        name: "Mountain Pass",
        desc: "Treacherous alpine route",
        difficulty: "Hard",
        laps: 3,
        bgColor: "#0a0f1a",
        roadColor: "#1a2030",
        lineColor: "#A259FF",
        borderColor: "#00FF88",
        grassColor: "#0f1a10",
        thumbnail: "⛰️",
        tier: "pro",
        trackWidth: 100,
        waypoints: [
            { x: 0.5, y: 0.88 },
            { x: 0.78, y: 0.82 },
            { x: 0.88, y: 0.65 },
            { x: 0.82, y: 0.45 },
            { x: 0.65, y: 0.35 },
            { x: 0.7, y: 0.2 },
            { x: 0.5, y: 0.1 },
            { x: 0.3, y: 0.2 },
            { x: 0.35, y: 0.35 },
            { x: 0.18, y: 0.45 },
            { x: 0.12, y: 0.65 },
            { x: 0.22, y: 0.82 },
        ],
    },
];

// Catmull-Rom spline interpolation for smooth track drawing
function catmullRom(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    return {
        x:
            0.5 *
            (2 * p1.x +
                (-p0.x + p2.x) * t +
                (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
                (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y:
            0.5 *
            (2 * p1.y +
                (-p0.y + p2.y) * t +
                (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
                (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
    };
}

function getTrackPoints(track, cw, ch, steps = 600) {
    const wps = track.waypoints;
    const n = wps.length;
    const points = [];
    for (let i = 0; i < n; i++) {
        const p0 = wps[(i - 1 + n) % n];
        const p1 = wps[i];
        const p2 = wps[(i + 1) % n];
        const p3 = wps[(i + 2) % n];
        const seg = Math.ceil(steps / n);
        for (let j = 0; j < seg; j++) {
            const t = j / seg;
            const pt = catmullRom(p0, p1, p2, p3, t);
            points.push({ x: pt.x * cw, y: pt.y * ch });
        }
    }
    return points;
}

function drawTrack(ctx, track, cw, ch) {
    const pts = getTrackPoints(track, cw, ch);
    const tw = track.trackWidth;

    // Background
    ctx.fillStyle = track.bgColor;
    ctx.fillRect(0, 0, cw, ch);

    // Draw grass texture-like pattern
    ctx.fillStyle = track.grassColor;
    ctx.fillRect(0, 0, cw, ch);

    // Road border (wider path)
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.lineWidth = tw + 16;
    ctx.strokeStyle = track.borderColor;
    ctx.stroke();

    // Road surface
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.lineWidth = tw;
    ctx.strokeStyle = track.roadColor;
    ctx.stroke();

    // Center dashed line
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = track.lineColor;
    ctx.stroke();
    ctx.setLineDash([]);

    // Start/Finish line
    const sp = pts[0];
    const sp2 = pts[4];
    const ang = Math.atan2(sp2.y - sp.y, sp2.x - sp.x) + Math.PI / 2;
    ctx.save();
    ctx.translate(sp.x, sp.y);
    ctx.rotate(ang);
    // Checkerboard pattern
    const sqSize = 10;
    const numSq = Math.floor(tw / sqSize);
    for (let i = -Math.floor(numSq / 2); i < Math.ceil(numSq / 2); i++) {
        ctx.fillStyle = (i % 2 === 0) ? "#fff" : "#000";
        ctx.fillRect(i * sqSize, -sqSize, sqSize, sqSize * 2);
    }
    ctx.restore();

    return pts;
}
