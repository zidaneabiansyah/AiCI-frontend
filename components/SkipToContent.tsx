"use client";

export default function SkipToContent() {
    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-secondary focus:text-white focus:rounded-2xl focus:font-bold focus:shadow-lg"
        >
            Skip to main content
        </a>
    );
}
