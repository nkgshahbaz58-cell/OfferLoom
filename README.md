# TurboRush — Browser Car Racing Game SaaS 🏎️

A **fully browser-based, zero-dependency** car racing game SaaS product ready to deploy on GitHub Pages with a custom domain.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-green.svg)

## 🚀 Live Demo

After deployment, your game will be at:
- Landing page: `https://yourdomain.com`
- Game: `https://yourdomain.com/game.html`
- Leaderboard: `https://yourdomain.com/leaderboard.html`

---

## 🎮 Features

| Feature | Details |
|---|---|
| **5 Unique Cars** | Blaze X, Storm V12, Phantom GT, Viper RS, Titan Ultra |
| **3 Tracks** | Neon City, Desert Dunes, Mountain Pass |
| **3 AI Opponents** | Adaptive difficulty with waypoint-following AI |
| **Nitro Boost** | Space bar to unleash nitro |
| **Procedural Audio** | Engine, collision, nitro, lap chimes via Web Audio API |
| **Leaderboard** | localStorage-based top 10 per track |
| **Mobile Support** | Touch D-pad controls |
| **SaaS Landing Page** | Hero, features, pricing, car showcase |

---

## 🛠️ Deploy to GitHub Pages

### Step 1 — Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name your repo (e.g. `turborush`)
3. Push all files:
```bash
git init
git add .
git commit -m "Initial commit — TurboRush"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/turborush.git
git push -u origin main
```

### Step 2 — Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. The `deploy.yml` workflow will auto-run and deploy your site

### Step 3 — Custom Domain

1. Edit `CNAME` file: replace `yourdomain.com` with your actual domain
2. In your domain registrar (Namecheap, GoDaddy, etc.) add:
   - Type: `CNAME` | Host: `www` | Value: `YOUR_USERNAME.github.io`
   - Or for apex domain, 4 A records pointing to GitHub Pages IPs:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
3. In GitHub → Settings → Pages → Custom domain → enter your domain
4. Enable **Enforce HTTPS**

---

## 🎯 Controls

| Key | Action |
|---|---|
| `↑ / W` | Accelerate |
| `↓ / S` | Brake / Reverse |
| `← / A` | Steer Left |
| `→ / D` | Steer Right |
| `Space` | Nitro Boost |
| `Esc` | Pause |

---

## 💰 Pricing (Customize)

The pricing page is **cosmetic only** by default. To add payments:
- **Stripe**: Add Stripe.js and create a payment link
- **Gumroad**: Replace pricing buttons with Gumroad overlay links
- **LemonSqueezy**: Use their JS embed

---

## 📁 Project Structure

```
car-racing-game/
├── index.html          # SaaS landing page
├── game.html           # Game application
├── leaderboard.html    # Global leaderboard
├── css/
│   ├── style.css       # Landing page styles
│   └── game.css        # Game UI styles
├── js/
│   ├── main.js         # Landing page JS & hero animation
│   ├── game.js         # Game engine (physics, rendering, input)
│   ├── cars.js         # Car definitions & drawing
│   ├── tracks.js       # Track definitions & spline renderer
│   ├── ai.js           # AI opponent logic
│   ├── audio.js        # Web Audio API sound engine
│   └── leaderboard.js  # localStorage leaderboard
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Pages auto-deploy
├── CNAME               # Your custom domain
└── README.md
```

---

## 🔧 Local Development

No build step required! Just open `index.html` in your browser:

```bash
# Option 1: Python (any OS)
python -m http.server 8080

# Option 2: Node.js
npx serve .

# Option 3: VS Code Live Server extension
# Right-click index.html → Open with Live Server
```

Then visit `http://localhost:8080`

---

## 📄 License

MIT — Free to use, modify, and deploy commercially.

---

Made with ❤️ and pure JavaScript. No frameworks, no dependencies.
