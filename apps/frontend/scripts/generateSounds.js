/**
 * Sound Generation Script for Quiz Application
 * Generates high-quality WAV files for UI sound effects
 * Run with: node scripts/generateSounds.js
 */

const fs = require('fs');
const path = require('path');

// WAV file helper functions
function floatTo16BitPCM(output, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function encodeWAV(samples, sampleRate = 44100) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);
  floatTo16BitPCM(view, 44, samples);

  return Buffer.from(buffer);
}

// Generate ADSR envelope
function applyEnvelope(samples, attack, decay, sustain, release) {
  const attackSamples = Math.floor(samples.length * attack);
  const decaySamples = Math.floor(samples.length * decay);
  const releaseSamples = Math.floor(samples.length * release);
  const sustainSamples = samples.length - attackSamples - decaySamples - releaseSamples;

  for (let i = 0; i < samples.length; i++) {
    let envelope = 1;

    if (i < attackSamples) {
      // Attack: 0 to 1
      envelope = i / attackSamples;
    } else if (i < attackSamples + decaySamples) {
      // Decay: 1 to sustain level
      const decayProgress = (i - attackSamples) / decaySamples;
      envelope = 1 - (decayProgress * (1 - sustain));
    } else if (i < attackSamples + decaySamples + sustainSamples) {
      // Sustain: hold at sustain level
      envelope = sustain;
    } else {
      // Release: sustain level to 0
      const releaseProgress = (i - attackSamples - decaySamples - sustainSamples) / releaseSamples;
      envelope = sustain * (1 - releaseProgress);
    }

    samples[i] *= envelope;
  }

  return samples;
}

// Sound generators
function generateSelect() {
  const sampleRate = 44100;
  const duration = 0.05; // 50ms - very short click
  const samples = new Float32Array(sampleRate * duration);
  const frequency = 800;

  for (let i = 0; i < samples.length; i++) {
    const t = i / sampleRate;
    // Soft sine wave with quick decay
    samples[i] = Math.sin(2 * Math.PI * frequency * t) * 0.3;
  }

  return applyEnvelope(samples, 0.05, 0.1, 0.3, 0.85);
}

function generateCorrect() {
  const sampleRate = 44100;
  const duration = 0.4; // 400ms - pleasant chime
  const samples = new Float32Array(sampleRate * duration);

  // C-E-G major chord (pleasant, uplifting)
  const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5

  for (let i = 0; i < samples.length; i++) {
    const t = i / sampleRate;
    let value = 0;

    for (let j = 0; j < frequencies.length; j++) {
      value += Math.sin(2 * Math.PI * frequencies[j] * t) * 0.2;
    }

    samples[i] = value;
  }

  return applyEnvelope(samples, 0.01, 0.1, 0.6, 0.89);
}

function generateIncorrect() {
  const sampleRate = 44100;
  const duration = 0.3; // 300ms - gentle descending tone
  const samples = new Float32Array(sampleRate * duration);

  // Gentle descending tone (not harsh)
  const startFreq = 400;
  const endFreq = 250;

  for (let i = 0; i < samples.length; i++) {
    const t = i / sampleRate;
    const progress = i / samples.length;
    const freq = startFreq - (startFreq - endFreq) * progress;

    samples[i] = Math.sin(2 * Math.PI * freq * t) * 0.25;
  }

  return applyEnvelope(samples, 0.05, 0.15, 0.5, 0.8);
}

function generateSkip() {
  const sampleRate = 44100;
  const duration = 0.15; // 150ms - quick whoosh
  const samples = new Float32Array(sampleRate * duration);

  // Swept frequency for whoosh effect
  const startFreq = 600;
  const endFreq = 300;

  for (let i = 0; i < samples.length; i++) {
    const t = i / sampleRate;
    const progress = i / samples.length;
    const freq = startFreq - (startFreq - endFreq) * progress;

    // Add noise for whoosh texture
    const noise = (Math.random() - 0.5) * 0.05;
    samples[i] = (Math.sin(2 * Math.PI * freq * t) * 0.2) + noise;
  }

  return applyEnvelope(samples, 0.1, 0.2, 0.4, 0.7);
}

function generateWarning() {
  const sampleRate = 44100;
  const duration = 0.2; // 200ms - gentle alert
  const samples = new Float32Array(sampleRate * duration);

  // Two-tone alert (not annoying)
  const freq1 = 800;
  const freq2 = 900;
  const switchPoint = samples.length / 2;

  for (let i = 0; i < samples.length; i++) {
    const t = i / sampleRate;
    const freq = i < switchPoint ? freq1 : freq2;
    samples[i] = Math.sin(2 * Math.PI * freq * t) * 0.3;
  }

  return applyEnvelope(samples, 0.1, 0.2, 0.5, 0.7);
}

function generateTransition() {
  const sampleRate = 44100;
  const duration = 0.12; // 120ms - soft page turn
  const samples = new Float32Array(sampleRate * duration);

  // Soft sweep
  const startFreq = 400;
  const endFreq = 600;

  for (let i = 0; i < samples.length; i++) {
    const t = i / sampleRate;
    const progress = i / samples.length;
    const freq = startFreq + (endFreq - startFreq) * progress;

    samples[i] = Math.sin(2 * Math.PI * freq * t) * 0.15;
  }

  return applyEnvelope(samples, 0.15, 0.2, 0.3, 0.65);
}

function generateComplete() {
  const sampleRate = 44100;
  const duration = 0.8; // 800ms - celebration melody
  const samples = new Float32Array(sampleRate * duration);

  // Happy ascending melody: C-E-G-C
  const melody = [
    { freq: 523.25, start: 0, duration: 0.15 },      // C5
    { freq: 659.25, start: 0.15, duration: 0.15 },   // E5
    { freq: 783.99, start: 0.3, duration: 0.15 },    // G5
    { freq: 1046.50, start: 0.45, duration: 0.35 },  // C6 (hold longer)
  ];

  for (const note of melody) {
    const startSample = Math.floor(note.start * sampleRate);
    const noteSamples = Math.floor(note.duration * sampleRate);

    for (let i = 0; i < noteSamples && (startSample + i) < samples.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 3); // Natural decay
      samples[startSample + i] += Math.sin(2 * Math.PI * note.freq * t) * envelope * 0.25;
    }
  }

  return samples;
}

// Main execution
function main() {
  const outputDir = path.join(__dirname, '../public/sounds');

  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('✓ Created sounds directory');
  }

  const sounds = {
    'select.wav': generateSelect(),
    'correct.wav': generateCorrect(),
    'incorrect.wav': generateIncorrect(),
    'skip.wav': generateSkip(),
    'warning.wav': generateWarning(),
    'transition.wav': generateTransition(),
    'complete.wav': generateComplete(),
  };

  console.log('\nGenerating sound files...\n');

  for (const [filename, samples] of Object.entries(sounds)) {
    const wav = encodeWAV(samples);
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, wav);
    console.log(`✓ Generated: ${filename} (${(wav.length / 1024).toFixed(2)} KB)`);
  }

  console.log('\n✓ All sound files generated successfully!');
  console.log(`📁 Location: ${outputDir}\n`);
}

main();
