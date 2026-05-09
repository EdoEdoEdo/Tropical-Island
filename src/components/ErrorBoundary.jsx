import { Component } from 'react';

/**
 * Cattura errori di rendering (es. fallimento caricamento GLB) ed evita
 * che l'intera app si schianti, mostrando un fallback minimale.
 */
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        if (import.meta.env.DEV) {
            console.error('🛑 ErrorBoundary caught:', error, errorInfo);
        }
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback ?? (
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#1a1a2e',
                            color: '#fff',
                            fontFamily: 'system-ui, sans-serif',
                            padding: '2rem',
                            textAlign: 'center',
                            zIndex: 9999,
                        }}
                    >
                        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                            🏝️ Qualcosa è andato storto
                        </h1>
                        <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
                            L'isola non è riuscita a caricarsi correttamente.
                        </p>
                        <button
                            onClick={this.handleReload}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: '#ff6b6b',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                cursor: 'pointer',
                            }}
                        >
                            Ricarica
                        </button>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}
