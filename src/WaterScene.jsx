import React, { useEffect, useRef } from 'react';
import initWaterScene from './WaterShader.jsx'; // Import the function

const WaterScene = () => {
    const canvasRef = useRef();

    useEffect(() => {
        const cleanup = initWaterScene(canvasRef.current);

        return () => {
            cleanup(); // Clean up event listeners
        };
    }, []);

    return <canvas ref={canvasRef} className="webgl" />;
};

export default WaterScene;