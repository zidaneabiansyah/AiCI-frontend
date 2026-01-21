"use client";

import { useState, useEffect, useRef } from "react";
import { api, BackendGalleryImage } from "@/lib/api";
import Image from "next/image";

/**
 * Admin Gallery Page - Kelola foto galeri kegiatan
 */

const categories = [
    { value: "KEGIATAN", label: "Kegiatan" },
    { value: "WORKSHOP", label: "Workshop" },
    { value: "KOMPETISI", label: "Kompetisi" },
    { value: "LAINNYA", label: "Lainnya" },
];

export default function AdminGalleryPage() {
    const [images, setImages] = useState<BackendGalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<BackendGalleryImage | null>(null);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({ title: "", category: "KEGIATAN", description: "", is_featured: false, date_taken: "" });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const data = await api.content.gallery();
            setImages(data.results);
        } catch (error) { console.error("Failed to fetch gallery:", error); }
        finally { setLoading(false); }
    };

    const resetForm = () => {
        setFormData({ title: "", category: "KEGIATAN", description: "", is_featured: false, date_taken: "" });
        setImageFile(null);
        setImagePreview(null);
        setEditingItem(null);
    };

    const openModal = (item?: BackendGalleryImage) => {
        if (item) {
            setEditingItem(item);
            setFormData({ 
                title: item.title, 
                category: item.category, 
                description: item.description, 
                is_featured: item.is_featured,
                date_taken: item.date_taken || ""
            });
            setImagePreview(item.image);
        } else { resetForm(); }
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); resetForm(); };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = new FormData();
            data.append("title", formData.title);
            data.append("category", formData.category);
            data.append("description", formData.description);
            data.append("is_featured", formData.is_featured.toString());
            if (formData.date_taken) data.append("date_taken", formData.date_taken);
            if (imageFile) data.append("image", imageFile);

            if (editingItem) {
                await api.content.updateGalleryImage(editingItem.id, data);
            } else {
                await api.content.createGalleryImage(data);
            }
            await fetchData();
            closeModal();
        } catch (error: any) {
            alert(error.message || "Gagal menyimpan foto");
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus foto ini?")) return;
        try {
            await api.content.deleteGalleryImage(id);
            await fetchData();
        } catch (error: any) { alert(error.message || "Gagal menghapus foto"); }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Gallery</h1>
                    <p className="text-primary/60">Kelola foto galeri kegiatan</p>
                </div>
                <button onClick={() => openModal()} className="px-6 py-3 bg-secondary text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Upload Foto
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {loading ? (
                    [...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />)
                ) : images.length === 0 ? (
                    <div className="col-span-full bg-white rounded-2xl p-12 text-center text-primary/40">Belum ada foto.</div>
                ) : (
                    images.map((image) => (
                        <div key={image.id} className="relative aspect-square rounded-xl overflow-hidden group">
                            <Image src={image.image} alt={image.title || "Gallery"} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4">
                                <p className="text-sm font-medium text-center line-clamp-2">{image.title || "Untitled"}</p>
                                <span className="text-xs mt-1 px-2 py-0.5 bg-secondary rounded-full">{image.category_display}</span>
                                {image.is_featured && <span className="text-xs mt-2 text-yellow-400">⭐ Featured</span>}
                                <div className="flex gap-4 mt-4">
                                    <button onClick={() => openModal(image)} className="text-white/80 hover:text-white text-sm">Edit</button>
                                    <button onClick={() => handleDelete(image.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-primary mb-6">{editingItem ? "Edit Foto" : "Upload Foto"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Foto</label>
                                <div className="flex items-center gap-4">
                                    {imagePreview ? (
                                        <div className="relative w-32 h-32 border rounded-xl overflow-hidden">
                                            <Image src={imagePreview} alt="Preview" fill className="object-cover" sizes="128px" />
                                        </div>
                                    ) : (
                                        <div className="w-32 h-32 border border-dashed rounded-xl flex items-center justify-center text-primary/30">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                    )}
                                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Pilih Foto</button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Judul (opsional)</label>
                                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary" placeholder="Judul foto" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Kategori</label>
                                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary">
                                    {categories.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Deskripsi (opsional)</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary resize-none" rows={2} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Tanggal Foto (opsional)</label>
                                <input type="date" value={formData.date_taken} onChange={(e) => setFormData({ ...formData, date_taken: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary" />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="is_featured" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="w-4 h-4" />
                                <label htmlFor="is_featured" className="text-sm text-primary/60">Tampilkan di Homepage (Featured)</label>
                            </div>
                            <div className="flex gap-4 justify-end pt-4">
                                <button type="button" onClick={closeModal} className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50" disabled={submitting}>Batal</button>
                                <button type="submit" className="px-6 py-3 bg-secondary text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50" disabled={submitting}>{submitting ? "Menyimpan..." : "Simpan"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
