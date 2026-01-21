"use client";

/**
 * Homepage AiCi Official Website
 * 
 * Struktur sections:
 * 1. Hero - Judul besar + deskripsi + CTA
 * 2. Programs Preview - 6 program cards dengan icons
 * 3. Photo Gallery - 3 foto kegiatan
 * 4. Facilities Preview - Preview 4 kategori fasilitas
 * 5. Testimonials - Carousel testimoni siswa
 * 6. Partners - Logo partner/sponsor
 * 7. Map - Google Maps embed
 */

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import Hero from "@/components/Hero";
import ProgramsPreview from "@/components/ProgramsPreview";
import PhotoGallery from "@/components/PhotoGallery";
import FacilitiesPreview from "@/components/FacilitiesPreview";
import Testimonials from "@/components/Testimonials";
import Partners from "@/components/Partners";
import MapSection from "@/components/MapSection";

export default function Home() {
    return (
        <main className="min-h-screen">
            <Navbar />
            <Hero />
            <ProgramsPreview />
            <PhotoGallery />
            <FacilitiesPreview />
            <Testimonials />
            <Partners />
            <MapSection />
            <Footer />
            <BackToTop />
        </main>
    );
}
