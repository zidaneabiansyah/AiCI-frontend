"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWARegistration() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);

    useEffect(() => {
        // Register service worker
        if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
            navigator.serviceWorker
                .register("/sw.js")
                .then((registration) => {
                    console.log("✅ Service Worker registered:", registration.scope);
                    
                    // Check for updates
                    registration.addEventListener("updatefound", () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener("statechange", () => {
                                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                                    // New service worker available
                                    console.log("🔄 New version available! Please refresh.");
                                }
                            });
                        }
                    });
                })
                .catch((error) => {
                    console.error("❌ Service Worker registration failed:", error);
                });
        }

        // Handle install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            
            // Show install prompt after 30 seconds if not installed
            setTimeout(() => {
                const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
                if (!isStandalone) {
                    setShowInstallPrompt(true);
                }
            }, 30000);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // Detect if already installed
        window.addEventListener("appinstalled", () => {
            console.log("✅ PWA installed successfully!");
            setShowInstallPrompt(false);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log(`User response: ${outcome}`);
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
    };

    const handleDismiss = () => {
        setShowInstallPrompt(false);
        // Don't show again for 7 days
        localStorage.setItem("pwa-install-dismissed", Date.now().toString());
    };

    // Check if dismissed recently
    useEffect(() => {
        const dismissed = localStorage.getItem("pwa-install-dismissed");
        if (dismissed) {
            const dismissedTime = parseInt(dismissed);
            const sevenDays = 7 * 24 * 60 * 60 * 1000;
            if (Date.now() - dismissedTime < sevenDays) {
                setShowInstallPrompt(false);
            }
        }
    }, []);

    if (!showInstallPrompt || !deferredPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-primary mb-1">Install AICI App</h3>
                        <p className="text-sm text-primary/60 mb-4">
                            Install aplikasi untuk akses lebih cepat dan pengalaman yang lebih baik
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleInstallClick}
                                className="flex-1 bg-secondary text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-secondary/90 transition-all"
                            >
                                Install
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-4 py-2 text-primary/60 hover:text-primary text-sm font-medium transition-all"
                            >
                                Nanti
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

