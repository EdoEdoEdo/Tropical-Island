import '../assets/LoadingScreen.css';

// 🎮 START + LOADING SCREEN
// Mostra il bottone START prima del click; durante il caricamento della
// scena 3D (dopo il click) mostra una progress bar reale.
// Lo smontaggio è gestito da App.jsx quando sceneReady === true.
export const LoadingScreen = ({ onStart, started, progress }) => {
    if (started) {
        return (
            <div className="loading-screen">
                <div className="loading-content">
                    <div className="progress-container">
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="progress-text">
                            Loading island… {Math.round(progress)}%
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="loading-screen">
            <div className="loading-content">
                <div className="start-container">
                    <button
                        className="start-button"
                        onClick={onStart}
                        type="button"
                    >
                        <span className="start-icon">▶</span>
                        START EXPERIENCE
                    </button>
                    <p className="start-hint">
                        🎵 Audio enabled • WASD to move • Space to jump
                    </p>
                </div>
            </div>
        </div>
    );
};
