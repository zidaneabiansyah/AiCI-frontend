"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { achievements, Achievement } from "@/data/achievements";
import BackToTop from "@/components/BackToTop";

export default function AchievementsPage() {
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

    // Lock scroll when modal is open
    useEffect(() => {
        if (selectedAchievement) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedAchievement]);

    return (
        <main className="min-h-screen bg-gray-50/30">
            <Navbar />
            
            {/* Header Section */}
            <section className="pt-40 pb-20 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold text-primary mb-6 tracking-tight">
                        Our <span className="text-secondary">Achievements</span>
                    </h1>
                    <p className="text-lg md:text-xl text-primary/60 max-w-2xl mx-auto leading-relaxed">
                        Celebrating the milestones and successes of our community in the world of AI and Robotics.
                    </p>
                </div>
            </section>

            {/* Achievements Grid */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {achievements.map((achievement) => (
                            <div 
                                key={achievement.id}
                                onClick={() => setSelectedAchievement(achievement)}
                                className="group bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2 flex flex-col md:flex-row cursor-pointer"
                            >
                                {/* image */}
                                <div className="md:w-2/5 relative h-64 md:h-auto overflow-hidden">
                                    <Image
                                        src={achievement.image}
                                        alt={achievement.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, 40vw"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>

                                {/* Content */}
                                <div className="md:w-3/5 p-10 space-y-6 flex flex-col justify-center">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                achievement.category === "Competition" 
                                                ? "bg-secondary text-white" 
                                                : achievement.category === "Partnership"
                                                ? "bg-primary text-white"
                                                : "bg-gray-100 text-primary"
                                            }`}>
                                                {achievement.category}
                                            </span>
                                            <span className="text-sm font-bold text-primary/30 uppercase tracking-widest">{achievement.date}</span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-primary group-hover:text-secondary transition-colors leading-tight">
                                            {achievement.title}
                                        </h3>
                                    </div>
                                    <p className="text-primary/60 text-base leading-relaxed line-clamp-2">
                                        {achievement.description}
                                    </p>
                                    
                                    <div className="inline-flex items-center gap-2 text-secondary font-bold group/link">
                                        View Details
                                        <svg className="w-4 h-4 transition-transform group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Modal Popup */}
            {selectedAchievement && (
                <div className="fixed inset-0 z-100 flex items-center justify-center px-6">
                    <div 
                        className="absolute inset-0 bg-primary/40 backdrop-blur-md transition-opacity"
                        onClick={() => setSelectedAchievement(null)}
                    />
                    
                    <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
                        {/* Close Button */}
                        <button 
                            onClick={() => setSelectedAchievement(null)}
                            className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Image */}
                        <div className="md:w-1/2 relative min-h-[300px]">
                            <Image
                                src={selectedAchievement.image}
                                alt={selectedAchievement.title}
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Content */}
                        <div className="md:w-1/2 p-10 md:p-14 overflow-y-auto space-y-8">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className={`px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${
                                        selectedAchievement.category === "Competition" 
                                        ? "bg-secondary text-white" 
                                        : selectedAchievement.category === "Partnership"
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 text-primary"
                                    }`}>
                                        {selectedAchievement.category}
                                    </span>
                                    <span className="text-sm font-bold text-primary/30 uppercase tracking-widest">{selectedAchievement.date}</span>
                                </div>
                                <h3 className="text-3xl md:text-4xl font-bold text-primary leading-tight">
                                    {selectedAchievement.title}
                                </h3>
                            </div>

                            <div className="prose prose-lg text-primary/60 leading-relaxed font-medium">
                                <p>{selectedAchievement.description}</p>
                                <p className="pt-4">
                                    This achievement represents the dedication and hard work of our students and collaborators. At AiCi, we strive to push the boundaries of what's possible in artificial intelligence and robotics.
                                </p>
                            </div>

                            {selectedAchievement.link && (
                                <div className="pt-6">
                                    <a 
                                        href={selectedAchievement.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block bg-secondary text-white font-bold px-8 py-4 rounded-full shadow-lg shadow-secondary/20 hover:bg-primary transition-all"
                                    >
                                        Visit Source
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
