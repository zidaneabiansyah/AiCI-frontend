/**
 * Timer Hook
 * Countdown timer for placement tests
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerOptions {
    expiresAt: string;
    initialTimeRemaining?: number;
    enabled?: boolean; // Add enabled flag to control timer activation
    onExpire?: () => void;
}

export function useTimer({ expiresAt, initialTimeRemaining, enabled = true, onExpire }: UseTimerOptions) {
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [isExpired, setIsExpired] = useState(false);

    const hasExpiredRef = useRef(false);
    const onExpireRef = useRef(onExpire);
    
    useEffect(() => {
        onExpireRef.current = onExpire;
    }, [onExpire]);

    const calculateTimeRemaining = useCallback(() => {
        const now = new Date().getTime();
        const expiry = new Date(expiresAt).getTime();
        const diff = Math.max(0, Math.floor((expiry - now) / 1000));
        return diff;
    }, [expiresAt]);

    useEffect(() => {
        // Don't start timer if disabled
        if (!enabled) {
            return;
        }
        
        // Reset expired flag when initialTimeRemaining changes (new test started)
        if (initialTimeRemaining !== undefined && initialTimeRemaining > 0) {
            hasExpiredRef.current = false;
            setIsExpired(false);
        }
        
        // Use server-provided time if available, otherwise calculate
        const remaining = initialTimeRemaining !== undefined ? initialTimeRemaining : calculateTimeRemaining();
        setTimeRemaining(remaining);

        // Don't start timer if already expired
        if (remaining === 0) {
            if (!hasExpiredRef.current) {
                hasExpiredRef.current = true;
                setIsExpired(true);
                onExpireRef.current?.();
            }
            return;
        }

        // Update every second
        const interval = setInterval(() => {
            setTimeRemaining(prev => {
                const newTime = Math.max(0, prev - 1);
                
                if (newTime === 0 && !hasExpiredRef.current) {
                    hasExpiredRef.current = true;
                    setIsExpired(true);
                    onExpireRef.current?.();
                }
                
                return newTime;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt, initialTimeRemaining, calculateTimeRemaining, enabled]);

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
