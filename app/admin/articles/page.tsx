"use client";

import { useState, useEffect, useRef } from "react";
import { api, BackendArticle } from "@/lib/api";
import Image from "next/image";
import RichTextEditor from "@/components/admin/RichTextEditor";

/**
 * Admin Articles Page - Kelola artikel/berita
 */

export default function AdminArticlesPage() {
    const [articles, setArticles] = useState<BackendArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<BackendArticle | null>(null);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({ title: "", slug: "", excerpt: "", content: "", author: "Admin", status: "DRAFT" });
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const data = await api.content.articles();
            setArticles(data.results);
        } catch (error) { console.error("Failed to fetch articles:", error); }
        finally { setLoading(false); }
    };

    const generateSlug = (title: string) => {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    };

    const resetForm = () => {
        setFormData({ title: "", slug: "", excerpt: "", content: "", author: "Admin", status: "DRAFT" });
        setThumbnailFile(null);
        setThumbnailPreview(null);
        setEditingItem(null);
    };

    const openModal = (item?: BackendArticle) => {
        if (item) {
            setEditingItem(item);
            setFormData({ 
                title: item.title, 
                slug: item.slug, 
                excerpt: item.excerpt, 
                content: item.content || "", 
                author: item.author,
                status: item.published_at ? "PUBLISHED" : "DRAFT"
            });
            setThumbnailPreview(item.thumbnail);
        } else { resetForm(); }
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); resetForm(); };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnailFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setThumbnailPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData({ 
            ...formData, 
            title, 
            slug: editingItem ? formData.slug : generateSlug(title) 
        });
    };

    const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = new FormData();
            data.append("title", formData.title);
            data.append("slug", formData.slug);
            data.append("excerpt", formData.excerpt);
            data.append("content", formData.content);
            data.append("author", formData.author);
            data.append("status", publish ? "PUBLISHED" : formData.status);
            if (publish) data.append("published_at", new Date().toISOString());
            if (thumbnailFile) data.append("thumbnail", thumbnailFile);

            if (editingItem) {
                await api.content.updateArticle(editingItem.slug, data);
            } else {
                await api.content.createArticle(data);
            }
            await fetchData();
            closeModal();
        } catch (error: any) {
            alert(error.message || "Gagal menyimpan artikel");
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (slug: string) => {
        if (!confirm("Yakin ingin menghapus artikel ini?")) return;
        try {
            await api.content.deleteArticle(slug);
            await fetchData();
        } catch (error: any) { alert(error.message || "Gagal menghapus artikel"); }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Articles</h1>
                    <p className="text-primary/60">Kelola artikel dan berita</p>
                </div>
                <button onClick={() => openModal()} className="px-6 py-3 bg-secondary text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tulis Artikel
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left px-6 py-4 text-xs font-bold text-primary/40 uppercase tracking-wider">Thumbnail</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-primary/40 uppercase tracking-wider">Judul</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-primary/40 uppercase tracking-wider">Author</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-primary/40 uppercase tracking-wider">Status</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-primary/40 uppercase tracking-wider">Tanggal</th>
                            <th className="text-right px-6 py-4 text-xs font-bold text-primary/40 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-primary/40">Loading...</td></tr>
                        ) : articles.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-primary/40">Belum ada artikel.</td></tr>
                        ) : (
                            articles.map((article) => (
                                <tr key={article.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="relative w-16 h-12 rounded-lg overflow-hidden">
                                            <Image src={article.thumbnail} alt={article.title} fill className="object-cover" sizes="64px" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-primary line-clamp-1">{article.title}</p>
                                        <p className="text-primary/40 text-xs">{article.slug}</p>
                                    </td>
                                    <td className="px-6 py-4 text-primary/60">{article.author}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${article.published_at ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                            {article.published_at ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-primary/60 text-sm">{article.published_at ? new Date(article.published_at).toLocaleDateString('id-ID') : '-'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => openModal(article)} className="text-primary/40 hover:text-primary mr-4">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        </button>
                                        <button onClick={() => handleDelete(article.slug)} className="text-red-400 hover:text-red-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-primary mb-6">{editingItem ? "Edit Artikel" : "Tulis Artikel"}</h2>
                        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Thumbnail</label>
                                <div className="flex items-center gap-4">
                                    {thumbnailPreview ? (
                                        <div className="relative w-40 h-24 border rounded-xl overflow-hidden">
                                            <Image src={thumbnailPreview} alt="Preview" fill className="object-cover" sizes="160px" />
                                        </div>
                                    ) : (
                                        <div className="w-40 h-24 border border-dashed rounded-xl flex items-center justify-center text-primary/30">Thumbnail</div>
                                    )}
                                    <input type="file" ref={fileInputRef} onChange={handleThumbnailChange} accept="image/*" className="hidden" />
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Pilih Gambar</button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Judul</label>
                                <input type="text" value={formData.title} onChange={handleTitleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Slug (URL)</label>
                                <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary bg-gray-50" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Ringkasan (Excerpt)</label>
                                <textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary resize-none" rows={2} maxLength={500} required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Konten</label>
                                <RichTextEditor 
                                    content={formData.content} 
                                    onChange={(content) => setFormData({ ...formData, content })} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Author</label>
                                <input type="text" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary" required />
                            </div>
                            <div className="flex gap-4 justify-end pt-4">
                                <button type="button" onClick={closeModal} className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50" disabled={submitting}>Batal</button>
                                <button type="submit" className="px-6 py-3 bg-gray-200 text-primary rounded-xl font-bold hover:bg-gray-300 disabled:opacity-50" disabled={submitting}>{submitting ? "Menyimpan..." : "Simpan Draft"}</button>
                                <button type="button" onClick={(e) => handleSubmit(e as any, true)} className="px-6 py-3 bg-secondary text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50" disabled={submitting}>{submitting ? "Menyimpan..." : "Publish"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
