"use client";

import Image from "next/image";

const StudentProjects = () => {
    const projects = [
        { title: "Project Name" },
        { title: "Project Name" },
        { title: "Project Name" },
    ];

    return (
        <section className="py-16 md:py-24 px-6 bg-primary text-white">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Students Project</h2>
                <p className="text-base md:text-lg text-white/70 max-w-3xl mx-auto mb-12 md:mb-16 px-4">
                    Lembaga yang didirikan atas kerjasama FMIPA Universitas Indonesia dengan UMG IdeaLab Indonesia yang berfokus pada pengembangan sumber daya manusia dalam bidang artificial intelligence (kecerdasan artifisial).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0">
                    {projects.map((project, index) => (
                        <div key={index} className="bg-white rounded-3xl md:rounded-4xl p-6 shadow-xl transition-transform hover:scale-105">
                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-6 border border-gray-100">
                                {/* SVG Pattern for the thumbnail as seen in design */}
                                <div className="absolute inset-0 bg-[#f8fcfd] opacity-50 flex items-center justify-center">
                                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#255D74" strokeWidth="0.5" opacity="0.1" />
                                            </pattern>
                                        </defs>
                                        <rect width="100%" height="100%" fill="url(#grid)" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-primary font-bold text-lg md:text-xl">
                                {project.title}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StudentProjects;
