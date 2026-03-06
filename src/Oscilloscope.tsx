import { ComponentProps, Ref, useImperativeHandle } from 'react';
import { useOscilloscope } from './useOscilloscope.js';

export interface OscilloscopeElement {
  analyserNode: AnalyserNode;
  canvas: HTMLCanvasElement | null;
}

export interface OscilloscopeProps
  extends Omit<ComponentProps<'canvas'>, 'ref'> {
  audioContext: AudioContext;
  fftSize?: number;
  ref?: Ref<OscilloscopeElement | null>;
}

export const Oscilloscope = ({
  audioContext,
  fftSize,
  ref,
  ...props
}: OscilloscopeProps) => {
  const [canvasRef, analyser] = useOscilloscope(audioContext, { fftSize });

  useImperativeHandle(ref, () => {
    return {
      analyserNode: analyser,
      canvas: canvasRef.current,
    };
  }, [analyser, canvasRef]);

  return <canvas ref={canvasRef} {...props} />;
};
