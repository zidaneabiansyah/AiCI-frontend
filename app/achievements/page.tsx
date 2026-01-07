"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { api, BackendAchievement } from "@/lib/api";

export default function AchievementsPage() {
    const [achievements, setAchievements] = useState<BackendAchievement[]>([]);
    const [active, setActive] = useState<BackendAchievement | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const ref = useRef<HTMLDivElement>(null!);
    const id = useId();

    useEffect(() => {
        const loadAchievements = async () => {
            try {
                const data = await api.achievements.list();
                setAchievements(data.results);
            } catch (error) {
                console.error("Failed to fetch achievements:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadAchievements();
    }, []);

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setActive(null);
            }
        }

        if (active) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [active]);

    useOutsideClick(ref, () => setActive(null));

    return (
        <main className="min-h-screen bg-gray-50/30">
            <Navbar />
            
            {/* Header Section */}
            <section className="pt-40 pb-20 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold text-primary mb-6 tracking-tight"
                    >
                        Our <span className="text-secondary">Achievements</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-primary/60 max-w-2xl mx-auto leading-relaxed"
                    >
                        Celebrating the milestones and successes of our community in the world of AI and Robotics.
                    </motion.p>
                </div>
            </section>

            {/* Achievements Grid Area */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <AnimatePresence>
                        {active && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/30 backdrop-blur-sm h-full w-full z-100"
                            />
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {active ? (
                            <div className="fixed inset-0 grid place-items-center z-110 p-4">
                                <motion.button
                                    key={`button-${active.id}-${id}`}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, transition: { duration: 0.05 } }}
                                    className="flex absolute top-6 right-6 items-center justify-center bg-white rounded-full h-10 w-10 shadow-xl z-120"
                                    onClick={() => setActive(null)}
                                >
                                    <CloseIcon />
                                </motion.button>
                                <motion.div
                                    layoutId={`card-${active.id}-${id}`}
                                    ref={ref}
                                    className="w-full max-w-[600px] h-full md:h-fit md:max-h-[85%] flex flex-col bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
                                >
                                    <motion.div layoutId={`image-${active.id}-${id}`} className="relative h-72 md:h-80 w-full">
                                        <Image
                                            src={active.image || "https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=2074&auto=format&fit=crop"}
                                            alt={active.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </motion.div>

                                    <div className="flex flex-col p-8 md:p-10 space-y-6 overflow-y-auto">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <motion.span 
                                                    layout
                                                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                        active.category === "Competition" 
                                                        ? "bg-secondary text-white" 
                                                        : active.category === "Partnership"
                                                        ? "bg-primary text-white"
                                                        : "bg-gray-100 text-primary"
                                                    }`}
                                                >
                                                    {active.category}
                                                </motion.span>
                                                <motion.span layout className="text-sm font-bold text-primary/30 uppercase tracking-widest">{active.date}</motion.span>
                                            </div>
                                            <motion.h3
                                                layoutId={`title-${active.id}-${id}`}
                                                className="text-2xl md:text-3xl font-bold text-primary leading-tight"
                                            >
                                                {active.title}
                                            </motion.h3>
                                        </div>

                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="text-primary/60 text-base md:text-lg leading-relaxed font-medium"
                                        >
                                            {active.description}
                                            <p className="mt-4">
                                                This achievement represents the dedication and hard work of our students and collaborators. At AiCi, we strive to push the boundaries of what's possible in artificial intelligence and robotics.
                                            </p>
                                        </motion.div>

                                        {active.link && (
                                            <motion.div 
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="pt-4"
                                            >
                                                <a 
                                                    href={active.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-block bg-secondary text-white font-bold px-8 py-4 rounded-full shadow-lg shadow-secondary/20 hover:bg-primary transition-all"
                                                >
                                                    Visit Source
                                                </a>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        ) : null}
                    </AnimatePresence>

                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {isLoading ? (
                            [1, 2, 3, 4].map((n) => (
                                <div key={n} className="bg-white rounded-[2.5rem] h-64 animate-pulse border border-gray-100 shadow-sm" />
                            ))
                        ) : (
                            achievements.map((achievement) => (
                            <motion.div
                                layoutId={`card-${achievement.id}-${id}`}
                                key={achievement.id}
                                onClick={() => setActive(achievement)}
                                className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm transition-all flex flex-col md:flex-row cursor-pointer h-full"
                            >
                                <motion.div layoutId={`image-${achievement.id}-${id}`} className="md:w-2/5 relative h-64 md:h-auto overflow-hidden">
                                    <Image
                                        src={achievement.image || "https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=2074&auto=format&fit=crop"}
                                        alt={achievement.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, 40vw"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </motion.div>

                                <div className="md:w-3/5 p-8 flex flex-col justify-center space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            achievement.category === "Competition" 
                                            ? "bg-secondary text-white" 
                                            : achievement.category === "Partnership"
                                            ? "bg-primary text-white"
                                            : "bg-gray-100 text-primary"
                                        }`}>
                                            {achievement.category}
                                        </span>
                                        <span className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">{achievement.date}</span>
                                    </div>
                                    <motion.h3 
                                        layoutId={`title-${achievement.id}-${id}`}
                                        className="text-xl font-bold text-primary group-hover:text-secondary transition-colors leading-tight"
                                    >
                                        {achievement.title}
                                    </motion.h3>
                                    <motion.p 
                                        layoutId={`description-${achievement.id}-${id}`}
                                        className="text-primary/60 text-sm leading-relaxed line-clamp-2"
                                    >
                                        {achievement.description}
                                    </motion.p>
                                    <div className="inline-flex items-center gap-2 text-secondary text-sm font-bold pt-2">
                                        View Details
                                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                        )}
                    </ul>
                </div>
            </section>

            {/* Inspiration CTA */}
            <section className="pb-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="bg-primary rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                        <div className="absolute -top-24 -left-24 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-1000" />
                        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-1000" />
                        
                        <div className="relative z-10 space-y-8">
                            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Become Our Next Success Story</h2>
                            <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed font-medium">
                                Join our community and develop the skills to create world-class innovations. Your journey to excellence starts here.
                            </p>
                            <div className="pt-6">
                                <a 
                                    href="https://aici-umg.com/" 
                                    className="inline-block bg-secondary text-white text-lg font-bold px-12 py-5 rounded-full shadow-2xl shadow-secondary/20 hover:bg-white hover:text-primary transition-all duration-300 hover:scale-105"
                                >
                                    Explore Our Programs
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
            <BackToTop />
        </main>
    );
}

export const CloseIcon = () => {
    return (
        <motion.svg
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.05 } }}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-black"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M18 6l-12 12" />
            <path d="M6 6l12 12" />
        </motion.svg>
    );
};
