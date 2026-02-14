"use client";

import { useEffect, useState, useRef } from "react";
import { api, BackendArticle } from "@/lib/api";
import Image from "next/image";
import toast from "react-hot-toast";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default function AdminArticlesPage() {
    const [articles, setArticles] = useState<BackendArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<BackendArticle | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Form state
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState("");
    const [author, setAuthor] = useState("");
    const [publishedAt, setPublishedAt] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadArticles = async () => {
        setIsLoading(true);
        try {
            const params = searchQuery ? `?search=${searchQuery}` : '';
            const data = await api.content.articles(params);
            setArticles(data.results);
        } catch (err) {
            console.error("Failed to load articles:", err);
            toast.error("Failed to load articles");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadArticles();
    }, [searchQuery]);

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const openModal = (article?: BackendArticle) => {
        if (article) {
            setEditingArticle(article);
            setTitle(article.title);
            setSlug(article.slug);
            setExcerpt(article.excerpt);
            setContent(article.content || "");
            setAuthor(article.author);
            setPublishedAt(article.published_at || "");
            setImagePreview(article.thumbnail);
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingArticle(null);
        setTitle("");
        setSlug("");
        setExcerpt("");
        setContent("");
        setAuthor("");
        setPublishedAt("");
        setImageFile(null);
        setImagePreview("");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 3MB)
            if (file.size > 3 * 1024 * 1024) {
                toast.error("Image size must be less than 3MB");
                return;
            }

            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTitleChange = (newTitle: string) => {
        setTitle(newTitle);
        if (!editingArticle) {
            setSlug(generateSlug(newTitle));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const formData = new FormData();
        formData.append("title", title);
        formData.append("slug", slug);
        formData.append("excerpt", excerpt);
        formData.append("content", content);
        formData.append("author", author);
        if (publishedAt) formData.append("published_at", publishedAt);
        if (imageFile) formData.append("thumbnail", imageFile);

        try {
            if (editingArticle) {
                await api.content.updateArticle(editingArticle.slug, formData);
                toast.success("Article updated");
            } else {
                await api.content.createArticle(formData);
                toast.success("Article created");
            }
            setIsModalOpen(false);
            resetForm();
            loadArticles();
        } catch (err: any) {
            toast.error(err.message || "Failed to save article");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (slug: string) => {
        if (!confirm("Delete this article?")) return;

        try {
            await api.content.deleteArticle(slug);
            toast.success("Article deleted");
            loadArticles();
        } catch (err) {
            toast.error("Failed to delete article");
        }
    };

    const filteredArticles = articles;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                <div className="space-y-1 flex-1">
                    <h3 className="text-xl font-bold text-primary tracking-tight">Articles & Blog</h3>
                    <p className="text-primary/40 text-xs font-bold uppercase tracking-widest">
                        {articles.length} articles • {articles.filter(a => a.published_at).length} published
                    </p>
                </div>
                
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm font-medium"
                    />
                    <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <button
                    onClick={() => openModal()}
                    className="bg-primary text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-secondary transition-all flex items-center gap-2 group shrink-0"
                >
                    <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Article
                </button>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                </div>
            ) : filteredArticles.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-20 text-center">
                    <p className="text-4xl mb-4">📝</p>
                    <h4 className="text-xl font-bold text-primary mb-2">No articles found</h4>
                    <p className="text-primary/60">Create your first article to get started</p>
                </div>
            ) : (
                <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="px-10 py-6">Article</th>
                                    <th className="px-10 py-6">Author</th>
                                    <th className="px-10 py-6">Status</th>
                                    <th className="px-10 py-6">Date</th>
                                    <th className="px-10 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredArticles.map((article) => (
                                    <tr key={article.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-6">
                                                <div className="relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                                                    <Image
                                                        src={article.thumbnail || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070"}
                                                        alt={article.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-primary group-hover:text-secondary transition-colors truncate max-w-75">
                                                        {article.title}
                                                    </span>
                                                    <span className="text-xs text-primary/40 font-medium truncate max-w-75">
                                                        {article.excerpt}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="text-primary/60 font-medium">{article.author}</span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                article.published_at
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-yellow-100 text-yellow-600'
                                            }`}>
                                                {article.published_at ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-sm text-primary/40 font-bold">
                                            {article.published_at
                                                ? new Date(article.published_at).toLocaleDateString()
                                                : new Date(article.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(article)}
                                                    className="w-10 h-10 bg-gray-50 text-primary/40 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                                                    title="Edit"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(article.slug)}
                                                    className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                    title="Delete"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="min-h-screen flex items-center justify-center p-4">
                        <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm" onClick={() => !isSaving && setIsModalOpen(false)} />

                        <div className="relative bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl p-10 md:p-12 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-bold text-primary">
                                    {editingArticle ? "Edit Article" : "New Article"}
                                </h3>
                                <button
                                    onClick={() => !isSaving && setIsModalOpen(false)}
                                    disabled={isSaving}
                                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-primary/20 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Title</label>
                                            <input
                                                type="text"
                                                required
                                                value={title}
                                                onChange={(e) => handleTitleChange(e.target.value)}
                                                disabled={isSaving}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                                placeholder="Article title"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Slug (URL)</label>
                                            <input
                                                type="text"
                                                required
                                                value={slug}
                                                onChange={(e) => setSlug(e.target.value)}
                                                disabled={isSaving || !!editingArticle}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                                placeholder="article-slug"
                                            />
                                            {editingArticle && (
                                                <p className="text-xs text-primary/40 ml-1">Slug cannot be changed after creation</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Author</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={author}
                                                    onChange={(e) => setAuthor(e.target.value)}
                                                    disabled={isSaving}
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                                    placeholder="John Doe"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Publish Date (Optional)</label>
                                                <input
                                                    type="datetime-local"
                                                    value={publishedAt}
                                                    onChange={(e) => setPublishedAt(e.target.value)}
                                                    disabled={isSaving}
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thumbnail */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Thumbnail (Max 3MB)</label>
                                        <div
                                            onClick={() => !isSaving && fileInputRef.current?.click()}
                                            className="w-full aspect-square bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group"
                                        >
                                            {imagePreview ? (
                                                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                            ) : (
                                                <div className="text-center space-y-2">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                                                        <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">Upload</p>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                className="hidden"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                accept="image/*"
                                                disabled={isSaving}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Excerpt */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Excerpt</label>
                                    <textarea
                                        required
                                        value={excerpt}
                                        onChange={(e) => setExcerpt(e.target.value)}
                                        disabled={isSaving}
                                        rows={2}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                        placeholder="Brief summary..."
                                    />
                                </div>

                                {/* Content Editor */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Content</label>
                                    <RichTextEditor content={content} onChange={setContent} />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        disabled={isSaving}
                                        className="flex-1 bg-gray-50 text-primary font-bold py-5 rounded-2xl hover:bg-gray-100 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 bg-primary text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 hover:bg-secondary transition-all uppercase tracking-widest text-xs disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            editingArticle ? "Save Changes" : "Publish Article"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
