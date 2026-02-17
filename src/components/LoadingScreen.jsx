import { useState, useEffect } from 'react';
import { useProgress } from '@react-three/drei';
import '../assets/LoadingScreen.css';

// 🎮 LOADING & START SCREEN
export const LoadingScreen = ({ onStart }) => {
    const { progress, active } = useProgress();
    const [started, setStarted] = useState(false);
    const [showStartButton, setShowStartButton] = useState(false);

    useEffect(() => {
        // Quando caricamento completo, mostra bottone START
        if (!active && progress === 100) {
            setTimeout(() => {
                setShowStartButton(true);
            }, 500);
        }
    }, [active, progress]);

    const handleStart = () => {
        setStarted(true);
        // Chiamata callback dopo animazione fade
        setTimeout(() => {
            onStart();
        }, 800);
    };

    // Nascondi completamente dopo start
    if (started) {
        return (
            <div className={`loading-screen fade-out`}>
                <div className="loading-content">{/* Fade out pulito */}</div>
            </div>
        );
    }

    return (
        <div className="loading-screen">
            <div className="loading-content">
                {/* 📊 PROGRESS BAR (durante caricamento) */}
                {!showStartButton && (
                    <div className="progress-container">
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="progress-text">
                            Loading... {Math.round(progress)}%
                        </p>
                    </div>
                )}

                {/* 🎮 START BUTTON (dopo caricamento) */}
                {showStartButton && (
                    <div className="start-container">
                        <button className="start-button" onClick={handleStart}>
                            <span className="start-icon">▶</span>
                            START EXPERIENCE
                        </button>
                        <p className="start-hint">
                            🎵 Audio enabled • WASD to move • Space to jump
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
