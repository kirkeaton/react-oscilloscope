import React, { useEffect, useRef, useState } from 'react';
import { useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { Oscilloscope } from 'react-oscilloscope';

const audioContext = new AudioContext();

// Reference frequency: A4 = 440 Hz
const A4_FREQUENCY = 432;
const SEMITONE_RATIO = Math.pow(2, 1 / 12);

// Generate notes array: A0 to C8 (88 keys on a piano)
// A0 is 48 semitones below A4
const notes = Array.from({ length: 88 }, (_, i) => {
  return A4_FREQUENCY * Math.pow(SEMITONE_RATIO, i - 48);
});

const waves = ['sine', 'square', 'sawtooth', 'triangle', 'noise'];

// Keyboard mapping: A, W, S, E, D, F, T, G, Y, H, U, J, K, O, L, P, ; '
// maps to semitone offsets from C (C, C#, D, D#, E, F, F#, G, G#, A, A#, B, ...)
const KEYS_MAPPING = {
  a: 0, // C
  w: 1, // C#
  s: 2, // D
  e: 3, // D#
  d: 4, // E
  f: 5, // F
  t: 6, // F#
  g: 7, // G
  y: 8, // G#
  h: 9, // A
  u: 10, // A#
  j: 11, // B
  k: 12, // C (next octave)
  o: 13, // C#
  l: 14, // D
  p: 15, // D#
  ';': 16, // E
  "'": 17, // F
};

// Helper to create and start either an OscillatorNode or a looping BufferSource for noise
const createSource = (waveIndex, noteIndex) => {
  if (waves[waveIndex] === 'noise') {
    const bufferSize = 2 * audioContext.sampleRate;
    const buffer = audioContext.createBuffer(
      1,
      bufferSize,
      audioContext.sampleRate
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    const noiseNode = audioContext.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;
    noiseNode.start();
    return noiseNode;
  }

  const osc = audioContext.createOscillator();
  osc.type = waves[waveIndex];
  osc.frequency.setValueAtTime(notes[noteIndex], audioContext.currentTime);
  osc.start();
  return osc;
};

const App = () => {
  const oscillatorRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [octave, setOctave] = useState(3);
  const [offset, setOffset] = useState(0);
  const [note, setNote] = useState(octave * 12); // Start at A4
  const [wave, setWave] = useState(0);
  const oscilloscopeRef = useRef(null);

  const play = useCallback(() => {
    if (isPlaying) {
      oscillatorRef.current?.stop();
      setIsPlaying(false);
      return;
    }
    const oscilloscope = oscilloscopeRef.current;

    oscillatorRef.current = createSource(wave, note);

    const gain = new GainNode(audioContext, {
      gain: 0.5,
    });

    oscillatorRef.current.connect(gain);
    gain.connect(oscilloscope.analyserNode);

    oscilloscope.analyserNode.connect(audioContext.destination);
    setIsPlaying(true);
  }, [isPlaying, note, wave]);

  const changeWave = useCallback(
    (newWave) => {
      setWave(newWave);
      if (!isPlaying) return;
      // If currently playing, stop and replace the current source
      try {
        oscillatorRef.current?.stop();
      } catch (e) {}
      oscillatorRef.current?.disconnect?.();

      const osc = oscilloscopeRef.current;
      oscillatorRef.current = createSource(newWave, note);

      const gain = new GainNode(audioContext, { gain: 0.5 });
      oscillatorRef.current.connect(gain);
      gain.connect(osc.analyserNode);
      osc.analyserNode.connect(audioContext.destination);
    },
    [isPlaying]
  );

  const changeNote = useCallback(
    (increment) => {
      const newNote = Math.max(0, Math.min(notes.length - 1, note + increment));
      if (
        oscillatorRef.current &&
        oscillatorRef.current.frequency &&
        typeof oscillatorRef.current.frequency.setValueAtTime === 'function'
      ) {
        oscillatorRef.current.frequency.setValueAtTime(
          notes[newNote],
          audioContext.currentTime
        );
      }
      setNote(newNote);
    },
    [note]
  );

  const changeOctave = useCallback(
    (increment) => {
      changeNote(increment * 12);
      setOctave(octave + increment);
    },
    [changeNote, octave]
  );

  const changeOffset = useCallback(
    (increment) => {
      changeNote(increment);
      setOffset(offset + increment);
    },
    [changeNote, offset]
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowUp':
          changeOffset(1);
          break;
        case 'ArrowDown':
          changeOffset(-1);
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          changeWave(parseInt(event.key) - 1);
          break;
        case 'a':
        case 'w':
        case 's':
        case 'e':
        case 'd':
        case 'f':
        case 't':
        case 'g':
        case 'y':
        case 'h':
        case 'u':
        case 'j':
        case 'k':
        case 'o':
        case 'l':
        case 'p':
        case ';':
        case "'":
          changeNote(KEYS_MAPPING[event.key] + octave * 12 - note);
          break;
        case 'z':
          changeOctave(-1);
          break;
        case 'x':
          changeOctave(1);
          break;
        case ' ':
          play();
          break;
        default:
          return;
      }
      event.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [changeNote, changeOctave, changeOffset, changeWave, play, note, octave]);

  return (
    <Oscilloscope
      ref={oscilloscopeRef}
      audioContext={audioContext}
      width={1000}
      height={500}
      onClick={() => play()}
    />
  );
};

const root = document.getElementById('root');
createRoot(root).render(<App />);
