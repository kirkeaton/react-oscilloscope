# react-oscilloscope

React hook for creating an oscilloscope

## Install

```bash
$ npm install react-oscilloscope
```

## Hooks

### useOscilloscope(audioContext, options?)

#### audioContext

Type: `AudioContext`

An instance of an [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) object.

#### options

Type: `object`

##### fftSize

Type: `number`

The window size of the [Fast Fourier Transform](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize) (FFT).

Must be a power of 2 between 2^5 and 2^15, so one of: `32`, `64`, `128`, `256`, `512`, `1024`, `2048`, `4096`, `8192`, `16384`, and `32768`.
