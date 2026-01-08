"use client";

import Link from "next/link";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            <div className="w-full max-w-lg mb-8">
                <DotLottieReact
                    src="/Error 404.json"
                    loop
                    autoplay
                />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-primary mb-6 tracking-tight">
                Oops! <span className="text-secondary">404</span>
            </h1>
            
            <p className="text-lg md:text-xl text-primary/60 max-w-md mx-auto mb-10 leading-relaxed font-medium">
                Maaf ya, halaman yang kamu cari sepertinya sedang bersembunyi atau sudah tidak ada lagi.
            </p>
            
            <Link 
                href="/" 
                className="bg-primary text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-secondary transition-all shadow-xl shadow-primary/20 hover:scale-105"
            >
                Kembali ke Beranda
            </Link>
        </div>
    );
}
