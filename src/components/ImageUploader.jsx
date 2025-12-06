import React, { useState } from 'react';
import { cn } from '../utils/cn';

const UPLOAD_STYLES = {
    wrapper: "w-full mb-8",
    dropZone: (isActive) => cn(
        "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all duration-300 group",
        isActive
            ? 'border-samurai-red bg-samurai-red/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
            : 'border-gray-700 bg-black/20 hover:border-samurai-red/50 hover:bg-black/40'
    ),
    input: "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10",
    preview: {
        wrapper: "relative w-full h-full p-2",
        image: "h-full w-full object-contain rounded-lg relative z-0",
        overlay: "absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10",
        changeText: "text-white font-mono text-xs border border-white/20 px-3 py-1 rounded bg-black/80"
    },
    placeholder: {
        wrapper: "flex flex-col items-center justify-center pt-5 pb-6 text-gray-400 group-hover:text-gray-300 transition-colors",
        icon: "mb-4 text-gray-500 group-hover:text-samurai-red transition-colors duration-300",
        text: "mb-2 text-sm font-mono",
        subtext: "text-xs text-gray-600 font-mono"
    },
    loading: "mt-4 text-center text-samurai-red animate-pulse font-mono text-sm tracking-widest"
};

const ImageUploader = ({ onImageUpload, isProcessing, onRequestCamera }) => {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files[0]);
        }
    };

    const handleFiles = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target.result);
            onImageUpload(file, e.target.result);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className={UPLOAD_STYLES.wrapper}>
            <div
                className={UPLOAD_STYLES.dropZone(dragActive)}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="image-upload"
                    className={UPLOAD_STYLES.input}
                    onChange={handleChange}
                    accept="image/*"
                    disabled={isProcessing}
                />

                {preview ? (
                    <div className={UPLOAD_STYLES.preview.wrapper}>
                        <img
                            src={preview}
                            alt="Uploaded ID"
                            className={UPLOAD_STYLES.preview.image}
                        />
                        <div className={UPLOAD_STYLES.preview.overlay}>
                            <p className={UPLOAD_STYLES.preview.changeText}>CHANGE_SOURCE</p>
                        </div>
                    </div>

                ) : (
                    <div className={UPLOAD_STYLES.placeholder.wrapper}>
                        <div className={UPLOAD_STYLES.placeholder.icon}>
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                        </div>
                        <p className={UPLOAD_STYLES.placeholder.text}>
                            <span className="font-bold text-gray-300">CLICK_TO_UPLOAD</span> or DRAG_AND_DROP
                        </p>
                        <p className={UPLOAD_STYLES.placeholder.subtext}>PNG, JPG (MAX. 5MB)</p>
                    </div>
                )}
            </div>

            {/* Camera Trigger */}
            {!preview && !isProcessing && (
                <div className="mt-4 flex justify-center">
                    <button
                        type="button"
                        onClick={onRequestCamera}
                        className="flex items-center gap-2 px-4 py-2 bg-samurai-dark/50 hover:bg-samurai-red/20 text-samurai-red border border-samurai-red/30 rounded-lg transition-all text-sm font-mono tracking-wide"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        OPEN_CAMERA_MATRIX
                    </button>
                </div>
            )}

            {isProcessing && (
                <div className={UPLOAD_STYLES.loading}>
                    // INITIALIZING_OCR_ENGINE...
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
