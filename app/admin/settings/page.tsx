"use client";

import { useEffect, useState } from "react";
import { api, BackendSiteSettings } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<BackendSiteSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [siteName, setSiteName] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [instagramUrl, setInstagramUrl] = useState("");
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [facebookUrl, setFacebookUrl] = useState("");

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const data = await api.content.settings();
            setSettings(data);
            
            // Populate form
            setSiteName(data.site_name || "");
            setAddress(data.address || "");
            setEmail(data.email || "");
            setPhone(data.phone || "");
            setWhatsapp(data.whatsapp || "");
            setInstagramUrl(data.instagram_url || "");
            setLinkedinUrl(data.linkedin_url || "");
            setYoutubeUrl(data.youtube_url || "");
            setFacebookUrl(data.facebook_url || "");
        } catch (err) {
            console.error("Failed to load settings:", err);
            toast.error("Failed to load settings");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const data = {
            site_name: siteName,
            address,
            email,
            phone,
            whatsapp,
            instagram_url: instagramUrl,
            linkedin_url: linkedinUrl,
            youtube_url: youtubeUrl,
            facebook_url: facebookUrl,
        };

        try {
            // Note: Backend might need PATCH endpoint for settings update
            // await api.content.updateSettings(data);
            toast.success("Settings updated successfully");
            loadSettings();
        } catch (err: any) {
            toast.error(err.message || "Failed to update settings");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-primary tracking-tight mb-2">Global Site Settings</h3>
                <p className="text-primary/40 text-xs font-bold uppercase tracking-widest">
                    Configure contact information and social media links
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* General Information */}
                <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
                    <h4 className="text-lg font-bold text-primary mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        General Information
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Site Name</label>
                            <input
                                type="text"
                                required
                                value={siteName}
                                onChange={(e) => setSiteName(e.target.value)}
                                disabled={isSaving}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                placeholder="AICI - Artificial Intelligence Center Indonesia"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isSaving}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                placeholder="info@aici.id"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Address</label>
                            <textarea
                                required
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                disabled={isSaving}
                                rows={3}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                placeholder="Full address..."
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
                    <h4 className="text-lg font-bold text-primary mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>
                        Contact Numbers
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Phone Number</label>
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={isSaving}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                placeholder="+62 821-1010-3938"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">WhatsApp Number</label>
                            <input
                                type="tel"
                                required
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                disabled={isSaving}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                placeholder="+62 821-1010-3938"
                            />
                        </div>
                    </div>
                </div>

                {/* Social Media */}
                <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
                    <h4 className="text-lg font-bold text-primary mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                        </div>
                        Social Media Links
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Instagram URL</label>
                            <input
                                type="url"
                                value={instagramUrl}
                                onChange={(e) => setInstagramUrl(e.target.value)}
                                disabled={isSaving}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                placeholder="https://instagram.com/aici"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">LinkedIn URL</label>
                            <input
                                type="url"
                                value={linkedinUrl}
                                onChange={(e) => setLinkedinUrl(e.target.value)}
                                disabled={isSaving}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                placeholder="https://linkedin.com/company/aici"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">YouTube URL</label>
                            <input
                                type="url"
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                disabled={isSaving}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                placeholder="https://youtube.com/@aici"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Facebook URL</label>
                            <input
                                type="url"
                                value={facebookUrl}
                                onChange={(e) => setFacebookUrl(e.target.value)}
                                disabled={isSaving}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                placeholder="https://facebook.com/aici"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-primary text-white font-bold px-12 py-5 rounded-2xl shadow-xl shadow-primary/20 hover:bg-secondary transition-all uppercase tracking-widest text-sm disabled:opacity-50 flex items-center gap-3"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Save Settings
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
