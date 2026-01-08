"use client";

import Link from "next/link";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const Programs = () => {
    const programs = [
        {
            title: "Fun Learning with AI",
            lottie: "/child robot.json",
        },
        {
            title: "Extracurricular AI and Robotic Club",
            lottie: "/ai Robot analysis.json",
        },
        {
            title: "AI for Education",
            lottie: "/Man and robot with computers sitting together in workplace.json",
        },
    ];

    return (
        <section className="relative py-16 md:py-24 px-6 overflow-hidden bg-white">
            {/* Background Brain Pattern */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `url('/aici-logo-otak.png')`,
                    backgroundSize: '150px md:200px',
                    backgroundRepeat: 'repeat',
                }}
            />

            <div className="relative max-w-7xl mx-auto text-center z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">Program Kami</h2>
                <p className="text-base md:text-primary/70 max-w-3xl mx-auto mb-12 md:mb-16 px-4">
                    Lembaga yang didirikan atas kerjasama FMIPA Universitas Indonesia dengan UMG IdeaLab Indonesia yang berfokus pada pengembangan sumber daya manusia dalam bidang artificial intelligence (kecerdasan artifisial).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 md:mb-16 px-4 md:px-0">
                    {programs.map((program, index) => (
                        <div key={index} className="group cursor-pointer">
                            <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-primary/5 shadow-sm mb-4 md:mb-6 transition-all duration-500 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-primary/5">
                                <div className="absolute inset-0 flex items-center justify-center p-8">
                                    <DotLottieReact
                                        src={program.lottie}
                                        loop
                                        autoplay
                                        className="w-full h-full"
                                    />
                                </div>
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-primary px-4 group-hover:text-secondary transition-colors">
                                {program.title}
                            </h3>
                        </div>
                    ))}
                </div>

                <Link
                    href="https://aici-umg.com/"
                    className="text-primary font-bold border-b-2 border-primary hover:text-secondary hover:border-secondary transition-colors inline-block text-base md:text-lg"
                >
                    Jelajahi Program
                </Link>
            </div>
        </section>
    );
};

export default Programs;
