
// Singleton audio context handler
class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmOscillators: OscillatorNode[] = [];
  private bgmGain: GainNode | null = null;
  private isPlayingBGM: boolean = false;
  private bgmTimer: number | null = null;
  private noteIndex: number = 0;
  private isMuted: boolean = false;

  constructor() {
    // AudioContext is initialized lazily or on explicit call
  }

  public init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3; // Global volume
      this.masterGain.connect(this.ctx.destination);
    }
  }

  // New method to force resume the audio context on user interaction
  public async resumeContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.3, this.ctx.currentTime, 0.1);
    }
    return this.isMuted;
  }

  // --- BGM SEQUENCER ---
  // A longer, "Medieval Town" style loop in D Dorian mode
  private melody = [
    // Section A (Main Theme)
    { note: 293.66, dur: 0.4 }, { note: 0, dur: 0.1 }, // D4
    { note: 440.00, dur: 0.4 }, { note: 0, dur: 0.1 }, // A4
    { note: 392.00, dur: 0.2 }, { note: 349.23, dur: 0.2 }, // G4, F4
    { note: 329.63, dur: 0.2 }, { note: 293.66, dur: 0.2 }, // E4, D4
    
    { note: 349.23, dur: 0.4 }, { note: 0, dur: 0.1 }, // F4
    { note: 523.25, dur: 0.4 }, { note: 0, dur: 0.1 }, // C5
    { note: 440.00, dur: 0.4 }, { note: 392.00, dur: 0.4 }, // A4, G4

    { note: 293.66, dur: 0.4 }, { note: 0, dur: 0.1 }, // D4
    { note: 440.00, dur: 0.4 }, { note: 0, dur: 0.1 }, // A4
    { note: 392.00, dur: 0.2 }, { note: 349.23, dur: 0.2 }, // G4, F4
    { note: 329.63, dur: 0.2 }, { note: 261.63, dur: 0.2 }, // E4, C4
    
    { note: 293.66, dur: 0.8 }, { note: 0, dur: 0.4 }, // D4 (Long)

    // Section B (Variation)
    { note: 349.23, dur: 0.3 }, { note: 392.00, dur: 0.3 }, // F4, G4
    { note: 440.00, dur: 0.4 }, { note: 293.66, dur: 0.4 }, // A4, D4
    { note: 349.23, dur: 0.3 }, { note: 329.63, dur: 0.3 }, // F4, E4
    { note: 293.66, dur: 0.4 }, { note: 261.63, dur: 0.4 }, // D4, C4

    { note: 349.23, dur: 0.3 }, { note: 392.00, dur: 0.3 }, // F4, G4
    { note: 440.00, dur: 0.4 }, { note: 523.25, dur: 0.4 }, // A4, C5
    { note: 493.88, dur: 0.4 }, { note: 440.00, dur: 0.4 }, // B4, A4
    { note: 392.00, dur: 0.8 }, { note: 0, dur: 0.2 },      // G4

    // Loop back Transition
    { note: 440.00, dur: 0.2 }, { note: 392.00, dur: 0.2 }, // A4, G4
    { note: 349.23, dur: 0.2 }, { note: 329.63, dur: 0.2 }, // F4, E4
    { note: 293.66, dur: 0.4 }, { note: 0, dur: 0.4 },      // D4
  ];

  public startBGM() {
    // If already playing, don't double up
    if (this.isPlayingBGM) return;
    
    this.init();
    this.isPlayingBGM = true;
    this.noteIndex = 0;
    this.playNextNote();
  }

  public stopBGM() {
    this.isPlayingBGM = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  private playNextNote() {
    if (!this.isPlayingBGM || !this.ctx || !this.masterGain) return;

    // If context is suspended, we continue the loop but no sound will come out until resumed
    // This keeps the music logic running so it 'starts' immediately when resumed
    
    const { note, dur } = this.melody[this.noteIndex];
    
    if (note > 0 && !this.isMuted) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      // Square wave gives that distinct 8-bit NES vibe
      osc.type = 'square'; 
      osc.frequency.value = note;
      
      // Lower volume for background music so it doesn't overpower SFX
      gain.gain.value = 0.08; 
      // Gentle envelope for each note
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start();
      osc.stop(this.ctx.currentTime + dur);
    }

    this.noteIndex = (this.noteIndex + 1) % this.melody.length;
    
    // Calculate delay for next note
    this.bgmTimer = window.setTimeout(() => {
      this.playNextNote();
    }, dur * 1000);
  }

  // --- SFX HELPER ---
  private playTone(
    freq: number, 
    type: OscillatorType, 
    startTime: number, 
    duration: number, 
    vol: number = 1
  ) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // White noise for impacts/explosions
  private playNoise(duration: number, vol: number = 1, filterFreq: number = 1000) {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;

    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    noise.start();
  }

  public playClick() {
    this.init();
    if (this.ctx) {
        const t = this.ctx.currentTime;
        this.playTone(400, 'square', t, 0.1, 0.5);
    }
  }

  public playHammerHit(quality: 'bad' | 'good' | 'perfect') {
    this.init();
    if (!this.ctx) return;
    
    if (quality === 'perfect') {
      this.playNoise(0.2, 0.8);
      this.playTone(880, 'triangle', this.ctx.currentTime, 0.3, 0.6); 
      this.playTone(1100, 'sine', this.ctx.currentTime + 0.1, 0.4, 0.4); 
    } else if (quality === 'good') {
      this.playNoise(0.15, 0.6);
      this.playTone(440, 'square', this.ctx.currentTime, 0.1, 0.3);
    } else {
      this.playNoise(0.1, 0.5);
      this.playTone(150, 'sawtooth', this.ctx.currentTime, 0.2, 0.3);
    }
  }

  public playCustomerEnter() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.playTone(523.25, 'sine', t, 0.5, 0.5); // C5
    this.playTone(415.30, 'sine', t + 0.4, 0.8, 0.5); // G#4
  }

  public playCash() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.playTone(1000, 'square', t, 0.1, 0.3);
    this.playTone(1500, 'square', t + 0.05, 0.1, 0.3);
    this.playTone(2000, 'square', t + 0.10, 0.3, 0.3);
  }

  public playSuccess() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.playTone(523.25, 'square', t, 0.2, 0.4); 
    this.playTone(659.25, 'square', t + 0.2, 0.2, 0.4); 
    this.playTone(783.99, 'square', t + 0.4, 0.4, 0.4); 
  }

  public playDayStart() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.playTone(220, 'triangle', t, 0.2);
    this.playTone(440, 'triangle', t + 0.2, 0.2);
    this.playTone(880, 'triangle', t + 0.4, 0.4);
  }

  public playSaw() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.linearRampToValueAtTime(150, t + 0.2);
    
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  public playSizzle() {
    this.init();
    this.playNoise(1.0, 0.4, 3000);
  }
}

export const soundManager = new SoundManager();
