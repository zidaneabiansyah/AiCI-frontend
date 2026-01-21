"use client";

import Image from "next/image";

/**
 * Testimonials Component
 * 
 * Menampilkan testimoni dari siswa AiCi.
 * Data testimoni yang sudah disediakan:
 * 1. Kahfi - Siswa SD - "Cool!"
 * 2. Sachio - Siswa SMP - "Hi Tech, robots and AI are our future..."
 * 3. Aulia - Siswa SMA - "The problem is that the world in the future..."
 * 4. Sandhya - Siswa SD - "Cool, That's Clever!"
 * 
 * PANDUAN:
 * - Nanti bisa diganti dengan data dari API /content/testimonials/
 * - Ganti placeholder foto dengan foto asli siswa
 */

const testimonials = [
    {
        name: "Kahfi",
        role: "Siswa SD",
        quote: "Cool!",
        photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200",
    },
    {
        name: "Sachio",
        role: "Siswa SMP",
        quote: "Hi Tech, robots and AI are our future, because now technology is increasingly being used",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
    },
    {
        name: "Aulia",
        role: "Siswa SMA",
        quote: "The problem is that the world in the future will also be more sophisticated than now, there will definitely be many more",
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
    },
    {
        name: "Sandhya",
        role: "Siswa SD",
        quote: "Cool, That's Clever!",
        photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200",
    },
];

const Testimonials = () => {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                        Testimonials
                    </h2>
                    <p className="text-primary/60">
                        Apa Kata Yang Sudah Belajar di AiCI?
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="text-center group"
                        >
                            {/* Photo */}
                            <div className="relative w-32 h-32 mx-auto mb-6">
                                <div className="absolute inset-0 bg-secondary/20 rounded-full transform rotate-12 group-hover:rotate-0 transition-transform" />
                                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                                    <Image
                                        src={testimonial.photo}
                                        alt={testimonial.name}
                                        fill
                                        className="object-cover"
                                        sizes="128px"
                                    />
                                </div>
                            </div>

                            {/* Name & Role */}
                            <h3 className="text-xl font-bold text-secondary mb-1">
                                {testimonial.name}
                            </h3>
                            <p className="text-primary/40 text-sm mb-4">
                                {testimonial.role}
                            </p>

                            {/* Quote */}
                            <p className="text-primary/70 text-sm italic leading-relaxed">
                                "{testimonial.quote}"
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
