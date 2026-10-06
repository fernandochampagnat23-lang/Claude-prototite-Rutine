// Señales de sonido y vibración para los temporizadores.
let ctx: AudioContext | undefined;

/** Debe llamarse desde un toque del usuario para que iOS permita el sonido. */
export function unlockAudio(): void {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    // Sin audio disponible: solo vibración.
  }
}

function tone(frequency: number, startOffset: number, duration: number): void {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = frequency;
  const start = ctx.currentTime + startOffset;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.35, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function vibrate(pattern: number | number[]): void {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Algunos navegadores (iOS) no tienen vibración.
  }
}

/** Pitido corto: empieza un aguante. */
export function signalStart(): void {
  tone(660, 0, 0.12);
  vibrate(80);
}

/** Doble pitido: termina un aguante. */
export function signalStep(): void {
  tone(880, 0, 0.12);
  tone(880, 0.18, 0.12);
  vibrate([80, 60, 80]);
}

/** Triple pitido largo: terminó el descanso o la serie. */
export function signalEnd(): void {
  tone(988, 0, 0.18);
  tone(988, 0.25, 0.18);
  tone(1318, 0.5, 0.35);
  vibrate([200, 100, 200, 100, 400]);
}
