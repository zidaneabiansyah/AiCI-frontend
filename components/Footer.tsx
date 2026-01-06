"use client";

import Image from "next/image";
import Link from "next/link";

const Footer = () => {
    return (
        <footer className="bg-white py-12 px-6 border-t border-gray-100 text-center md:text-left">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 md:gap-8">
                <div className="flex items-center">
                    <Image
                        src="/aici-logo.png"
                        alt="AiCI Logo"
                        width={120}
                        height={40}
                        className="h-10 w-auto grayscale hover:grayscale-0 transition-all cursor-pointer opacity-80 hover:opacity-100"
                    />
                </div>

                <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-primary/60 font-medium">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <Link href="/projects" className="hover:text-primary transition-colors">Projects</Link>
                    <Link href="/achievements" className="hover:text-primary transition-colors">Achievements</Link>
                </div>

                <div className="text-primary/40 text-sm max-w-xs md:max-w-none">
                    © 2026 Artificial Intelligence Center Indonesia (AiCI). All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
