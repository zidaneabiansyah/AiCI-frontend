"use client";

import { useState, useEffect, useRef } from "react";

const AnimatedNumber = ({ value }: { value: string }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const targetValue = parseInt(value);
    const countRef = useRef(0);
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                    setDisplayValue(0);
                    countRef.current = 0;
                }
            },
            { threshold: 0.2 }
        );

        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        let startTime: number | null = null;
        const duration = 2000;

        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            const currentCount = Math.floor(progress * targetValue);
            
            if (currentCount !== countRef.current) {
                countRef.current = currentCount;
                setDisplayValue(currentCount);
            }

            if (progress < 1 && isVisible) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    }, [isVisible, targetValue]);

    return <span ref={containerRef}>{displayValue}</span>;
};

const Stats = () => {
    const stats = [
        { label: "Course Participant", value: "500" },
        { label: "International Achievement", value: "20" },
        { label: "Sponsorship", value: "10" },
    ];

    return (
        <section className="min-h-[60vh] flex items-center bg-white py-32 md:py-48">
            <div className="max-w-7xl mx-auto px-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24 text-center">
                    {stats.map((stat, index) => (
                        <div 
                            key={index} 
                            className="flex flex-col items-center justify-center space-y-4 group transition-all duration-500 hover:scale-110"
                        >
                            <h2 className="text-6xl md:text-8xl font-bold text-primary tracking-tighter flex items-center">
                                <AnimatedNumber value={stat.value} />
                                <span className="text-secondary ml-1">+</span>
                            </h2>
                            <p className="text-lg md:text-xl text-primary/60 font-medium max-w-[180px] leading-snug uppercase tracking-[0.2em]">
                                {stat.label}
                            </p>
                            <div className="w-16 h-1 bg-secondary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stats;