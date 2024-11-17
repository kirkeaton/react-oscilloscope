import { useEffect, useRef } from 'react';

export interface OscilloscopeOptions {
  fftSize?: number;
}

export type OscilloscopeTuple = [
  React.RefObject<HTMLCanvasElement | null>,
  AnalyserNode,
];

export const useOscilloscope = (
  audioContext: AudioContext,
  options: OscilloscopeOptions = {}
): OscilloscopeTuple => {
  const { fftSize } = options;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode>(
    new AnalyserNode(audioContext, {
      fftSize,
    })
  );

  useEffect(() => {
    const analyser = analyserRef.current;
    if (!analyser) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    context.fillStyle = 'black';
    context.lineWidth = 2.0;
    context.strokeStyle = 'green';

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.beginPath();

      const sliceWidth = (canvas.width * 1.0) / dataArray.length;
      let x = 0;

      dataArray.forEach((value: number, i: number) => {
        const v = value / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }

        x += sliceWidth;
      });

      context.lineTo(canvas.width, canvas.height / 2);
      context.stroke();
    };

    draw();
  }, []);

  return [canvasRef, analyserRef.current];
};
