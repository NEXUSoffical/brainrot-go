// audio.js - Dynamic Procedural Horror Audio System for Ghost Hunter Go

class GameAudioSystem {
    constructor() {
        this.ctx = null;
        this.bgmEnabled = false;
        this.bgmTimer = null;
    }

    initContext() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleBgm() {
        this.initContext();
        this.bgmEnabled = !this.bgmEnabled;
        
        const btn = document.getElementById('bgmToggleBtn');
        if (btn) {
            btn.innerText = this.bgmEnabled ? '🎵 CREEPY BGM: ON' : '🔇 CREEPY BGM: OFF';
            btn.style.color = this.bgmEnabled ? '#00ff55' : '#ff0055';
            btn.style.borderColor = this.bgmEnabled ? '#00ff55' : '#ff0055';
        }

        if (this.bgmEnabled) {
            this.startDynamicLoop();
        } else {
            this.stopDynamicLoop();
        }
    }

    startDynamicLoop() {
        if (this.bgmTimer) clearInterval(this.bgmTimer);
        
        // 👻 HAUNTED MUSIC BOX SEQUENCE (Minor keys, dissonant intervals)
        const songSequence = [
            // Phrase 1: The Creeping Intro
            { l: 880.00, b: 110.00, d: 0.4 }, { l: 0,      b: 0,      d: 0.2 }, 
            { l: 932.33, b: 0,      d: 0.4 }, { l: 880.00, b: 0,      d: 0.4 },
            { l: 659.25, b: 110.00, d: 0.6 }, { l: 0,      b: 0,      d: 0.2 }, 
            { l: 698.46, b: 0,      d: 0.4 }, { l: 659.25, b: 0,      d: 0.4 },

            // Phrase 2: The Tension Rises
            { l: 587.33, b: 146.83, d: 0.6 }, { l: 0,      b: 0,      d: 0.2 }, 
            { l: 659.25, b: 0,      d: 0.4 }, { l: 698.46, b: 0,      d: 0.4 },
            { l: 880.00, b: 146.83, d: 0.6 }, { l: 0,      b: 0,      d: 0.2 }, 
            { l: 932.33, b: 0,      d: 0.4 }, { l: 1046.50,b: 0,      d: 0.4 },

            // Phrase 3: The Dark Descent & Heartbeat
            { l: 932.33, b: 130.81, d: 0.4 }, { l: 880.00, b: 0,      d: 0.4 }, 
            { l: 698.46, b: 130.81, d: 0.4 }, { l: 659.25, b: 0,      d: 0.4 },
            { l: 587.33, b: 110.00, d: 0.8 }, { l: 0,      b: 0,      d: 0.2 }, 
            { l: 0,      b: 0,      d: 0.2 }, { l: 0,      b: 0,      d: 0.2 }
        ];
        
        let step = 0;

        const playStep = () => {
            if (!this.bgmEnabled || !this.ctx) return;
            
            const current = songSequence[step];
            const now = this.ctx.currentTime;

            // 👻 GHOSTLY MELODY (Sine Wave = smooth, hollow, glass-like)
            if (current.l > 0) {
                const leadOsc = this.ctx.createOscillator();
                const leadGain = this.ctx.createGain();
                leadOsc.type = 'sine'; 
                leadOsc.frequency.setValueAtTime(current.l, now);
                leadGain.gain.setValueAtTime(0.06, now);
                leadGain.gain.exponentialRampToValueAtTime(0.0001, now + current.d * 1.5);
                leadOsc.connect(leadGain);
                leadGain.connect(this.ctx.destination);
                leadOsc.start(now);
                leadOsc.stop(now + current.d * 1.5 + 0.05);
            }

            // 🫀 OMINOUS HEARTBEAT BASS (Triangle Wave = deep and punchy)
            if (current.b > 0) {
                const bassOsc = this.ctx.createOscillator();
                const bassGain = this.ctx.createGain();
                bassOsc.type = 'triangle';
                bassOsc.frequency.setValueAtTime(current.b, now);
                bassGain.gain.setValueAtTime(0.09, now);
                bassGain.gain.exponentialRampToValueAtTime(0.0001, now + current.d * 2);
                bassOsc.connect(bassGain);
                bassGain.connect(this.ctx.destination);
                bassOsc.start(now);
                bassOsc.stop(now + current.d * 2 + 0.05);
            }

            step = (step + 1) % songSequence.length;
        };

        // ⏱️ Slower tempo (280ms instead of 180ms) for maximum suspense
        this.bgmTimer = setInterval(playStep, 280);
    }

    stopDynamicLoop() {
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    // ==========================================
    // PROCEDURAL SOUND EFFECTS 
    // ==========================================

    playSpawn() {
        try {
            this.initContext();
            const now = this.ctx.currentTime;
            // Dissonant, creepy chord for spawns
            [220.00, 233.08, 261.63, 150.00].forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, now + i * 0.08);
                gain.gain.setValueAtTime(0.05, now + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.3);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + i * 0.08);
                osc.stop(now + i * 0.08 + 0.35);
            });
        } catch (e) { console.warn(e); }
    }

    playCatch() {
        try {
            this.initContext();
            const now = this.ctx.currentTime;
            // Success Chime
            [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, now + i * 0.07);
                gain.gain.setValueAtTime(0.06, now + i * 0.07);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.2);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + i * 0.07);
                osc.stop(now + i * 0.07 + 0.25);
            });
        } catch (e) { console.warn(e); }
    }

    playHit() {
        try {
            this.initContext();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            // Deep aggressive hit
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.2);
        } catch (e) { console.warn(e); }
    }
}

window.gameAudio = new GameAudioSystem();