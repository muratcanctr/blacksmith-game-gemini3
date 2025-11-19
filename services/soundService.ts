
// Singleton audio context handler
class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    // AudioContext is initialized lazily on first user interaction
  }

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3; // Global volume to prevent ear bleeding
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Helper to create an oscillator
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
    const t = this.ctx!.currentTime;
    this.playTone(400, 'square', t, 0.1, 0.5);
  }

  public playHammerHit(quality: 'bad' | 'good' | 'perfect') {
    this.init();
    if (quality === 'perfect') {
      // Heavy thud + high ping
      this.playNoise(0.2, 0.8);
      this.playTone(880, 'triangle', this.ctx!.currentTime, 0.3, 0.6); // A5
      this.playTone(1100, 'sine', this.ctx!.currentTime + 0.1, 0.4, 0.4); 
    } else if (quality === 'good') {
      this.playNoise(0.15, 0.6);
      this.playTone(440, 'square', this.ctx!.currentTime, 0.1, 0.3);
    } else {
      // Dull thud
      this.playNoise(0.1, 0.5);
      this.playTone(150, 'sawtooth', this.ctx!.currentTime, 0.2, 0.3);
    }
  }

  public playCustomerEnter() {
    this.init();
    const t = this.ctx!.currentTime;
    // Door chime (Ding-Dong)
    this.playTone(523.25, 'sine', t, 0.5, 0.5); // C5
    this.playTone(415.30, 'sine', t + 0.4, 0.8, 0.5); // G#4
  }

  public playCash() {
    this.init();
    const t = this.ctx!.currentTime;
    // Cha-ching
    this.playTone(1000, 'square', t, 0.1, 0.3);
    this.playTone(1500, 'square', t + 0.05, 0.1, 0.3);
    this.playTone(2000, 'square', t + 0.10, 0.3, 0.3);
  }

  public playSuccess() {
    this.init();
    const t = this.ctx!.currentTime;
    // Fanfare
    this.playTone(523.25, 'square', t, 0.2, 0.4); // C
    this.playTone(659.25, 'square', t + 0.2, 0.2, 0.4); // E
    this.playTone(783.99, 'square', t + 0.4, 0.4, 0.4); // G
  }

  public playDayStart() {
    this.init();
    const t = this.ctx!.currentTime;
    // Rising scale
    this.playTone(220, 'triangle', t, 0.2);
    this.playTone(440, 'triangle', t + 0.2, 0.2);
    this.playTone(880, 'triangle', t + 0.4, 0.4);
  }

  public playSaw() {
    this.init();
    const t = this.ctx!.currentTime;
    // Sawtooth wave that pitch bends slightly
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.linearRampToValueAtTime(150, t + 0.2);
    
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  public playSizzle() {
    this.init();
    // High frequency noise
    this.playNoise(1.0, 0.4, 3000);
  }
}

export const soundManager = new SoundManager();
