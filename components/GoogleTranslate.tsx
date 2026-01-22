"use client";

import { useEffect, useState } from "react";

declare global {
    interface Window {
        googleTranslateElementInit: () => void;
        google: any;
    }
}

const GoogleTranslate = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: "id",
                    includedLanguages: "id,en,ko,ja,zh-CN",
                    autoDisplay: false,
                },
                "google_translate_element"
            );
        };

        const existingScript = document.getElementById("google-translate-script");
        if (!existingScript) {
            const script = document.createElement("script");
            script.id = "google-translate-script";
            script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            script.async = true;
            document.body.appendChild(script);
        } else if (window.google && window.google.translate) {
            window.googleTranslateElementInit();
        }
    }, []);

    const changeLanguage = (langCode: string) => {
        const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
        if (select) {
            select.value = langCode;
            select.dispatchEvent(new Event("change"));
            setIsOpen(false); // Close dropdown after selection
        }
    };

    const languages = [
        { code: "id", label: "Indonesia", flag: "🇮🇩" },
        { code: "en", label: "English", flag: "🇺🇸" },
        { code: "ko", label: "Korea", flag: "🇰🇷" },
        { code: "ja", label: "Japan", flag: "🇯🇵" },
        { code: "zh-CN", label: "China", flag: "🇨🇳" },
    ];

    return (
        <div className="relative z-50">
            {/* Custom Translate Button matching the design */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-[#006080] text-white px-5 py-2 text-[13px] font-bold flex items-center gap-2 rounded-sm shadow-sm hover:opacity-90 transition-all whitespace-nowrap"
            >
                Translate »
            </button>

            {/* Custom Flag Dropdown */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 p-2 flex gap-2 min-w-max animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="absolute -top-2 right-4 w-4 h-4 bg-white rotate-45 border-t border-l border-gray-100"></div>
                    <div className="relative flex gap-2">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                className="w-10 h-8 flex items-center justify-center text-xl hover:bg-gray-100 rounded transition-colors"
                                title={lang.label}
                            >
                                {lang.flag}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Hidden Google Translate Element */}
            <div id="google_translate_element" className="hidden" />

            <style jsx global>{`
                .goog-te-banner-frame.skiptranslate {
                    display: none !important;
                }
                body {
                    top: 0px !important;
                }
            `}</style>
        </div>
    );
};

export default GoogleTranslate;
