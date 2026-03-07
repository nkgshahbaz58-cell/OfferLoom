// Landing Page JavaScript — Hero animation, navbar scroll, mobile menu

// ── Hero Canvas Animation ──────────────────────────
(function () {
    const canvas = document.getElementById("hero-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Animated cars for hero BG
    const heroCars = Array.from({ length: 6 }, (_, i) => ({
        x: Math.random() * canvas.width,
        y: 100 + Math.random() * (canvas.height - 200),
        speed: 1.5 + Math.random() * 2.5,
        color: ["#FF4655", "#00D4FF", "#A259FF", "#00FF88", "#FFD700"][i % 5],
        size: 14 + Math.random() * 8,
        lane: i,
    }));

    const trail = [];

    function drawHeroCar(car) {
        const w = car.size;
        const h = car.size * 1.8;
        ctx.save();
        ctx.translate(car.x, car.y);

        // Trail
        trail.push({ x: car.x, y: car.y, color: car.color, alpha: 0.5 });

        // Glow
        ctx.shadowColor = car.color;
        ctx.shadowBlur = 20;

        ctx.fillStyle = car.color;
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, 4);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    function animHero(ts) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw fading trails
        for (let i = trail.length - 1; i >= 0; i--) {
            const t = trail[i];
            t.alpha -= 0.015;
            if (t.alpha <= 0) { trail.splice(i, 1); continue; }
            ctx.save();
            ctx.globalAlpha = t.alpha * 0.3;
            ctx.fillStyle = t.color;
            ctx.shadowColor = t.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.roundRect(t.x - 4, t.y - 8, 8, 16, 3);
            ctx.fill();
            ctx.restore();
        }

        // Draw race lines
        ctx.strokeStyle = "rgba(255,255,255,0.03)";
        ctx.lineWidth = 60;
        for (let i = 0; i < 6; i++) {
            const y = (canvas.height / 6) * i + 30;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        heroCars.forEach((car) => {
            car.x += car.speed;
            if (car.x > canvas.width + 40) car.x = -40;
            drawHeroCar(car);
        });

        requestAnimationFrame(animHero);
    }
    requestAnimationFrame(animHero);
})();

// ── Navbar scroll effect ───────────────────────────
window.addEventListener("scroll", () => {
    const nav = document.querySelector(".navbar");
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 50);
});

// ── Mobile menu toggle ─────────────────────────────
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobile-menu");
if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
        mobileMenu.classList.toggle("open");
    });
}

// ── Scroll reveal animations ───────────────────────
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                e.target.style.opacity = "1";
                e.target.style.transform = "translateY(0)";
            }
        });
    },
    { threshold: 0.15 }
);

document.querySelectorAll(".feature-card, .pricing-card, .car-showcase-card").forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
});
