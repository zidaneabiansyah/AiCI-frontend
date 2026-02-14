"use client";

import { useEffect, useState } from "react";
import { api, BackendPageContent } from "@/lib/api";
import toast from "react-hot-toast";
import RichTextEditor from "@/components/admin/RichTextEditor";

const PAGE_KEYS = [
    { key: "about-us", title: "About Us", description: "Company introduction and history" },
    { key: "vision-mission", title: "Vision & Mission", description: "Our goals and values" },
    { key: "faq", title: "FAQ", description: "Frequently asked questions" },
    { key: "terms", title: "Terms & Conditions", description: "Legal terms and policies" },
];

export default function AdminPageContentPage() {
    const [pages, setPages] = useState<BackendPageContent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPage, setSelectedPage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const loadPages = async () => {
        setIsLoading(true);
        try {
            const data = await api.content.pageContent();
            setPages(data.results || data);
        } catch (err) {
            console.error("Failed to load pages:", err);
            toast.error("Failed to load page content");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPages();
    }, []);

    const selectPage = (key: string) => {
        const page = pages.find(p => p.key === key);
        if (page) {
            setSelectedPage(key);
            setTitle(page.title);
            setContent(page.content);
        } else {
            // New page
            const pageInfo = PAGE_KEYS.find(p => p.key === key);
            setSelectedPage(key);
            setTitle(pageInfo?.title || "");
            setContent("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPage) return;

        setIsSaving(true);
        const formData = new FormData();
        formData.append("key", selectedPage);
        formData.append("title", title);
        formData.append("content", content);

        try {
            const existingPage = pages.find(p => p.key === selectedPage);
            if (existingPage) {
                await api.content.updatePageContent(selectedPage, formData);
                toast.success("Page updated");
            } else {
                await api.content.createPageContent(formData);
                toast.success("Page created");
            }
            loadPages();
        } catch (err: any) {
            toast.error(err.message || "Failed to save page");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-8rem)]">
            {/* Sidebar - Page List */}
            <div className="lg:col-span-1 bg-white rounded-[3rem] shadow-sm border border-gray-100 p-8 overflow-y-auto">
                <div className="space-y-2 mb-8">
                    <h3 className="text-xl font-bold text-primary">Static Pages</h3>
                    <p className="text-xs text-primary/40 font-bold uppercase tracking-widest">
                        {PAGE_KEYS.length} pages
                    </p>
                </div>

                <div className="space-y-3">
                    {isLoading ? (
                        [1, 2, 3, 4].map(n => (
                            <div key={n} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />
                        ))
                    ) : (
                        PAGE_KEYS.map((pageInfo) => {
                            const page = pages.find(p => p.key === pageInfo.key);
                            const isActive = selectedPage === pageInfo.key;
                            const hasContent = !!page;

                            return (
                                <button
                                    key={pageInfo.key}
                                    onClick={() => selectPage(pageInfo.key)}
                                    className={`w-full text-left p-6 rounded-2xl transition-all group ${
                                        isActive
                                            ? "bg-primary text-white shadow-xl shadow-primary/20"
                                            : "bg-gray-50 hover:bg-gray-100"
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className={`font-bold text-sm ${
                                            isActive ? "text-white" : "text-primary"
                                        }`}>
                                            {pageInfo.title}
                                        </h4>
                                        {hasContent && (
                                            <div className={`w-2 h-2 rounded-full ${
                                                isActive ? "bg-white" : "bg-green-500"
                                            }`} />
                                        )}
                                    </div>
                                    <p className={`text-xs ${
                                        isActive ? "text-white/70" : "text-primary/40"
                                    }`}>
                                        {pageInfo.description}
                                    </p>
                                    {page && (
                                        <p className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${
                                            isActive ? "text-white/50" : "text-primary/30"
                                        }`}>
                                            Updated {new Date(page.updated_at).toLocaleDateString()}
                                        </p>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Main Content - Editor */}
            <div className="lg:col-span-3 bg-white rounded-[3rem] shadow-sm border border-gray-100 p-10 overflow-y-auto">
                {!selectedPage ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-primary/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h4 className="text-2xl font-bold text-primary mb-2">Select a Page</h4>
                        <p className="text-primary/60">Choose a page from the sidebar to edit its content</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8 h-full flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-bold text-primary">
                                    {PAGE_KEYS.find(p => p.key === selectedPage)?.title}
                                </h3>
                                <p className="text-xs text-primary/40 font-bold uppercase tracking-widest">
                                    Key: {selectedPage}
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="bg-primary text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-secondary transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Title Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">
                                Page Title
                            </label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isSaving}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                placeholder="Enter page title"
                            />
                        </div>

                        {/* Content Editor */}
                        <div className="space-y-2 flex-1 flex flex-col min-h-0">
                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">
                                Content
                            </label>
                            <div className="flex-1 min-h-0">
                                <RichTextEditor content={content} onChange={setContent} />
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
