// audio.js - Dynamic Multi-Bar Chiptune Arcade Audio System for Brainrot Go

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
            btn.innerText = this.bgmEnabled ? '🎵 Arcade BGM: ON' : '🔇 Arcade BGM: OFF';
        }

        if (this.bgmEnabled) {
            this.startDynamicLoop();
        } else {
            this.stopDynamicLoop();
        }
    }

    startDynamicLoop() {
        if (this.bgmTimer) clearInterval(this.bgmTimer);
        
        // Extended multi-bar arcade song sequence with matching bassline notes
        const songSequence = [
            // Phrase 1: Upbeat Intro
            { l: 440.00, b: 110.00, d: 0.15 }, { l: 523.25, b: 0, d: 0.15 }, 
            { l: 659.25, b: 110.00, d: 0.15 }, { l: 783.99, b: 0, d: 0.3 },
            { l: 659.25, b: 130.81, d: 0.15 }, { l: 783.99, b: 0, d: 0.45 }, 
            { l: 523.25, b: 130.81, d: 0.3 }, { l: 587.33, b: 0, d: 0.15 },

            // Phrase 2: Ascending Challenge
            { l: 880.00, b: 146.83, d: 0.15 }, { l: 783.99, b: 0, d: 0.15 }, 
            { l: 659.25, b: 146.83, d: 0.15 }, { l: 523.25, b: 0, d: 0.3 },
            { l: 587.33, b: 164.81, d: 0.15 }, { l: 659.25, b: 0, d: 0.15 }, 
            { l: 880.00, b: 164.81, d: 0.45 }, { l: 783.99, b: 0, d: 0.3 },

            // Phrase 3: High Energy Hook
            { l: 1046.50, b: 220.00, d: 0.15 }, { l: 880.00, b: 0, d: 0.15 }, 
            { l: 783.99, b: 220.00, d: 0.15 }, { l: 659.25, b: 0, d: 0.3 },
            { l: 523.25, b: 196.00, d: 0.15 }, { l: 587.33, b: 0, d: 0.15 }, 
            { l: 659.25, b: 196.00, d: 0.3 }, { l: 783.99, b: 0, d: 0.3 },

            // Phrase 4: Resolution & Reset
            { l: 659.25, b: 130.81, d: 0.15 }, { l: 587.33, b: 0, d: 0.15 }, 
            { l: 523.25, b: 130.81, d: 0.15 }, { l: 440.00, b: 0, d: 0.3 },
            { l: 392.00, b: 110.00, d: 0.3 }, { l: 440.00, b: 110.00, d: 0.6 }
        ];
        
        let step = 0;

        const playStep = () => {
            if (!this.bgmEnabled || !this.ctx) return;
            
            const current = songSequence[step];
            const now = this.ctx.currentTime;

            // Lead Melody Track (Square Wave)
            const leadOsc = this.ctx.createOscillator();
            const leadGain = this.ctx.createGain();
            leadOsc.type = 'square';
            leadOsc.frequency.setValueAtTime(current.l, now);
            leadGain.gain.setValueAtTime(0.04, now);
            leadGain.gain.exponentialRampToValueAtTime(0.0001, now + current.d);
            leadOsc.connect(leadGain);
            leadGain.connect(this.ctx.destination);
            leadOsc.start(now);
            leadOsc.stop(now + current.d + 0.05);

            // Synchronized Bassline Track (Triangle Wave)
            if (current.b > 0) {
                const bassOsc = this.ctx.createOscillator();
                const bassGain = this.ctx.createGain();
                bassOsc.type = 'triangle';
                bassOsc.frequency.setValueAtTime(current.b, now);
                bassGain.gain.setValueAtTime(0.07, now);
                bassGain.gain.exponentialRampToValueAtTime(0.0001, now + current.d * 1.5);
                bassOsc.connect(bassGain);
                bassGain.connect(this.ctx.destination);
                bassOsc.start(now);
                bassOsc.stop(now + current.d * 1.5 + 0.05);
            }

            step = (step + 1) % songSequence.length;
        };

        this.bgmTimer = setInterval(playStep, 180);
    }

    stopDynamicLoop() {
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    playSpawn() {
        try {
            this.initContext();
            const now = this.ctx.currentTime;
            [440, 554.37, 659.25, 880].forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, now + i * 0.05);
                gain.gain.setValueAtTime(0.05, now + i * 0.05);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.1);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + i * 0.05);
                osc.stop(now + i * 0.05 + 0.15);
            });
        } catch (e) { console.warn(e); }
    }

    playCatch() {
        try {
            this.initContext();
            const now = this.ctx.currentTime;
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
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.12);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.15);
        } catch (e) { console.warn(e); }
    }
}

window.gameAudio = new GameAudioSystem();