import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { cn } from '../utils/cn';

const videoConstraints = {
    facingMode: "environment" // Default to back camera
};

const CameraCapture = ({ onCapture, onClose }) => {
    const webcamRef = useRef(null);
    const [facingMode, setFacingMode] = useState("environment");

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        onCapture(imageSrc);
    }, [webcamRef, onCapture]);

    const toggleCamera = () => {
        setFacingMode(prev => prev === "user" ? "environment" : "user");
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Camera View */}
            <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                        ...videoConstraints,
                        facingMode: facingMode
                    }}
                    className="absolute min-h-full min-w-full object-cover"
                />

                {/* ID Card Overlay Guide */}
                <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center p-8">
                    {/* The clear window for the ID card */}
                    <div className="w-full max-w-sm aspect-[1.586] border-2 border-samurai-red/80 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] relative">
                        {/* Corner accents */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-samurai-red -mt-1 -ml-1"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-samurai-red -mt-1 -mr-1"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-samurai-red -mb-1 -ml-1"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-samurai-red -mb-1 -mr-1"></div>

                        {/* Scanning line animation */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-samurai-red/50 shadow-[0_0_15px_rgba(239,68,68,1)] animate-[scan_2s_ease-in-out_infinite]"></div>

                        {/* --- Internal Guides for Thai ID --- */}
                        {/* ID Number: Top Right */}
                        <div className="absolute top-[8%] right-[3%] w-[55%] h-[15%] border border-dashed border-cyan-400/50 rounded flex items-center justify-center animate-pulse">
                            <span className="text-[10px] text-cyan-400 font-mono bg-black/50 px-1">ID Number</span>
                        </div>

                        {/* Name/Surname: Below ID, slightly left */}
                        <div className="absolute top-[28%] left-[25%] w-[70%] h-[15%] border border-dashed border-green-400/50 rounded flex items-center justify-center animate-pulse">
                            <span className="text-[10px] text-green-400 font-mono bg-black/50 px-1">Name / Surname</span>
                        </div>

                        {/* Photo Box Hint: Right side */}
                        <div className="absolute bottom-[10%] right-[3%] w-[25%] h-[35%] border border-dashed border-yellow-400/30 rounded flex items-center justify-center">
                            <span className="text-[10px] text-yellow-400/70 font-mono bg-black/50 px-1">Photo</span>
                        </div>


                        <div className="absolute bottom-2 left-0 right-0 text-center">
                            <p className="text-white/80 font-mono text-xs bg-black/50 inline-block px-3 py-1 rounded">ALIGN ID WITHIN FRAME</p>
                        </div>
                    </div>
                </div>

                {/* Close Button Top Right */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-black/60 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Controls Bar */}
            <div className="h-32 bg-samurai-black border-t border-samurai-border flex items-center justify-around px-8 pb-8 pt-4 z-20">
                {/* Switch Camera */}
                <button
                    onClick={toggleCamera}
                    className="p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>

                {/* Capture Trigger */}
                <button
                    onClick={capture}
                    className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform active:scale-95 group relative"
                >
                    <div className="w-12 h-12 bg-samurai-red rounded-full group-hover:bg-red-500 transition-colors"></div>
                </button>

                {/* Placeholder to balance layout (or Gallery if we had it) */}
                <div className="w-12 h-12 opacity-0"></div>
            </div>
        </div>
    );
};

export default CameraCapture;
