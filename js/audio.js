// Web Audio API sound engine — no external files needed
class AudioEngine {
    constructor() {
        this.ctx = null;
        this.engineNode = null;
        this.engineGain = null;
        this.masterGain = null;
        this.enabled = true;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.ctx.destination);
            this.initialized = true;
        } catch (e) {
            this.enabled = false;
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
    }

    setVolume(v) {
        if (this.masterGain) this.masterGain.gain.value = v;
    }

    // Start looping engine sound
    startEngine(speed = 0.3) {
        if (!this.enabled || !this.initialized) return;
        this.stopEngine();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.value = 80 + speed * 200;
        gain.gain.value = 0.12;
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();

        // Add some harmonics
        const osc2 = this.ctx.createOscillator();
        osc2.type = "square";
        osc2.frequency.value = 160 + speed * 400;
        const gain2 = this.ctx.createGain();
        gain2.gain.value = 0.04;
        osc2.connect(gain2);
        gain2.connect(this.masterGain);
        osc2.start();

        this.engineNode = [osc, osc2];
        this.engineGain = [gain, gain2];
    }

    updateEngineSpeed(speed) {
        if (!this.engineNode || !this.enabled) return;
        const t = this.ctx.currentTime;
        this.engineNode[0].frequency.linearRampToValueAtTime(
            80 + speed * 300,
            t + 0.1
        );
        this.engineNode[1].frequency.linearRampToValueAtTime(
            160 + speed * 600,
            t + 0.1
        );
    }

    stopEngine() {
        if (this.engineNode) {
            this.engineNode.forEach((n) => {
                try { n.stop(); } catch (e) { }
            });
            this.engineNode = null;
        }
    }

    // One-shot collision sound
    playCollision() {
        if (!this.enabled || !this.initialized) return;
        const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.3, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.05));
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const gain = this.ctx.createGain();
        gain.gain.value = 0.6;
        src.connect(gain);
        gain.connect(this.masterGain);
        src.start();
    }

    // Nitro whoosh
    playNitro() {
        if (!this.enabled || !this.initialized) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
    }

    // Lap complete chime
    playLapComplete() {
        if (!this.enabled || !this.initialized) return;
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "sine";
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.12);
            gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + i * 0.12 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.12 + 0.3);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(this.ctx.currentTime + i * 0.12);
            osc.stop(this.ctx.currentTime + i * 0.12 + 0.35);
        });
    }

    // Race finish fanfare
    playFinish() {
        if (!this.enabled || !this.initialized) return;
        const notes = [523, 659, 784, 659, 1047];
        const durs = [0.15, 0.15, 0.15, 0.1, 0.4];
        let t = this.ctx.currentTime;
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "square";
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + durs[i]);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(t);
            osc.stop(t + durs[i] + 0.05);
            t += durs[i];
        });
    }

    // Countdown beep
    playBeep(high = false) {
        if (!this.enabled || !this.initialized) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = high ? 880 : 440;
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.22);
    }
}

const audioEngine = new AudioEngine();
