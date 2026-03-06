import { ComponentProps, Ref } from 'react';
export interface OscilloscopeElement {
    analyserNode: AnalyserNode;
    canvas: HTMLCanvasElement | null;
}
export interface OscilloscopeProps extends Omit<ComponentProps<'canvas'>, 'ref'> {
    audioContext: AudioContext;
    fftSize?: number;
    ref?: Ref<OscilloscopeElement | null>;
}
export declare const Oscilloscope: ({ audioContext, fftSize, ref, ...props }: OscilloscopeProps) => import("react/jsx-runtime").JSX.Element;
