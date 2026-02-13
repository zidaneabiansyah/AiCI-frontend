/**
 * Timer Hook
 * Countdown timer for placement tests
 */

import { useState, useEffect, useCallback } from 'react';

interface UseTimerOptions {
    expiresAt: string;
    onExpire?: () => void;
}

export function useTimer({ expiresAt, onExpire }: UseTimerOptions) {
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [isExpired, setIsExpired] = useState(false);

    const calculateTimeRemaining = useCallback(() => {
        const now = new Date().getTime();
        const expiry = new Date(expiresAt).getTime();
        const diff = Math.max(0, Math.floor((expiry - now) / 1000));
        return diff;
    }, [expiresAt]);

    useEffect(() => {
        // Initial calculation
        const remaining = calculateTimeRemaining();
        setTimeRemaining(remaining);

        if (remaining === 0) {
            setIsExpired(true);
            onExpire?.();
            return;
        }

        // Update every second
        const interval = setInterval(() => {
            const remaining = calculateTimeRemaining();
            setTimeRemaining(remaining);

            if (remaining === 0) {
                setIsExpired(true);
                onExpire?.();
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt, calculateTimeRemaining, onExpire]);

    const formatTime = useCallback(() => {
        const hours = Math.floor(timeRemaining / 3600);
        const minutes = Math.floor((timeRemaining % 3600) / 60);
        const seconds = timeRemaining % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, [timeRemaining]);

    const getPercentage = useCallback((totalDuration: number) => {
        return Math.max(0, Math.min(100, (timeRemaining / totalDuration) * 100));
    }, [timeRemaining]);

    return {
        timeRemaining,
        isExpired,
        formatTime,
        getPercentage,
    };
}
