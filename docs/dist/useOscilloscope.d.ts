export interface OscilloscopeOptions {
    fftSize?: number;
}
export type OscilloscopeTuple = [
    React.RefObject<HTMLCanvasElement | null>,
    AnalyserNode
];
export declare const useOscilloscope: (audioContext: AudioContext, options?: OscilloscopeOptions) => OscilloscopeTuple;
