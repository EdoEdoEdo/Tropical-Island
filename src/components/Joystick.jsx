import { useEffect, useRef, useState } from 'react';
import '../assets//Joystick.css';

export const Joystick = ({ onMove }) => {
    const joystickRef = useRef(null);
    const handleRef = useRef(null);
    const [isActive, setIsActive] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const touchIdRef = useRef(null);

    useEffect(() => {
        const joystick = joystickRef.current;
        if (!joystick) return;

        const handleTouchStart = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const touch = e.touches[0];
            touchIdRef.current = touch.identifier;
            setIsActive(true);
            updatePosition(touch);
        };

        const handleTouchMove = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const touch = Array.from(e.touches).find(
                (t) => t.identifier === touchIdRef.current,
            );
            if (touch) {
                updatePosition(touch);
            }
        };

        const handleTouchEnd = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsActive(false);
            setPosition({ x: 0, y: 0 });
            onMove({ x: 0, y: 0 });
            touchIdRef.current = null;
        };

        const updatePosition = (touch) => {
            const rect = joystick.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            let deltaX = touch.clientX - centerX;
            let deltaY = touch.clientY - centerY;

            const maxDistance = rect.width / 2 - 20;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance > maxDistance) {
                const angle = Math.atan2(deltaY, deltaX);
                deltaX = Math.cos(angle) * maxDistance;
                deltaY = Math.sin(angle) * maxDistance;
            }

            setPosition({ x: deltaX, y: deltaY });

            const normalizedX = deltaX / maxDistance;
            const normalizedY = -deltaY / maxDistance;

            onMove({ x: normalizedX, y: normalizedY });
        };

        joystick.addEventListener('touchstart', handleTouchStart, {
            passive: false,
        });
        joystick.addEventListener('touchmove', handleTouchMove, {
            passive: false,
        });
        joystick.addEventListener('touchend', handleTouchEnd, {
            passive: false,
        });
        joystick.addEventListener('touchcancel', handleTouchEnd, {
            // <- AGGIUNTO
            passive: false,
        });

        return () => {
            joystick.removeEventListener('touchstart', handleTouchStart);
            joystick.removeEventListener('touchmove', handleTouchMove);
            joystick.removeEventListener('touchend', handleTouchEnd);
            joystick.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [onMove]);

    return (
        <div className="joystick-container">
            <div
                ref={joystickRef}
                className={`joystick ${isActive ? 'active' : ''}`}
            >
                <div
                    ref={handleRef}
                    className="joystick-handle"
                    style={{
                        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                    }}
                />
            </div>
        </div>
    );
};

export const JumpButton = ({ onJump }) => {
    const buttonRef = useRef(null);

    useEffect(() => {
        const button = buttonRef.current;
        if (!button) return;

        const handleTouchStart = (e) => {
            e.preventDefault();
            e.stopPropagation();
            onJump(true);
        };

        const handleTouchEnd = (e) => {
            e.preventDefault();
            e.stopPropagation();
            onJump(false);
        };

        button.addEventListener('touchstart', handleTouchStart, {
            passive: false,
        });
        button.addEventListener('touchend', handleTouchEnd, {
            passive: false,
        });
        button.addEventListener('touchcancel', handleTouchEnd, {
            passive: false,
        });

        return () => {
            button.removeEventListener('touchstart', handleTouchStart);
            button.removeEventListener('touchend', handleTouchEnd);
            button.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [onJump]);

    return (
        <div className="jump-button-container">
            <button ref={buttonRef} className="jump-button">
                ↑
            </button>
        </div>
    );
};
