import { jsx as _jsx } from "react/jsx-runtime";
import { useImperativeHandle } from 'react';
import { useOscilloscope } from './useOscilloscope.js';
export const Oscilloscope = ({ audioContext, fftSize, ref, ...props }) => {
    const [canvasRef, analyser] = useOscilloscope(audioContext, { fftSize });
    useImperativeHandle(ref, () => {
        return {
            analyserNode: analyser,
            canvas: canvasRef.current,
        };
    }, [analyser, canvasRef]);
    return _jsx("canvas", { ref: canvasRef, ...props });
};
