"use client";

import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            <div className="w-full max-w-sm mb-4">
                <Image 
                    src="/icon/asset404.svg"
                    alt="Error 404"
                    width={400}
                    height={300}
                    className="w-full h-auto"
                    priority
                />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-[#255D74] mb-4">
                Aduh!
            </h1>
            
            <p className="text-sm md:text-base text-primary/60 max-w-sm mx-auto mb-10 leading-relaxed font-semibold">
                Maaf ya, halaman yang kamu cari sepertinya sedang bersembunyi atau sudah tidak ada lagi.
            </p>
            
            <Link 
                href="/" 
                className="bg-[#255D74] text-white px-10 py-3 rounded-lg font-bold text-sm tracking-wide hover:bg-[#1a4354] transition-all shadow-lg hover:scale-105"
            >
                Kembali ke Beranda
            </Link>
        </div>
    );
}
