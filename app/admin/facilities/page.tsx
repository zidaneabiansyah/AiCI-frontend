"use client";

import { useState, useEffect, useRef } from "react";
import { api, BackendFacility } from "@/lib/api";
import Image from "next/image";

/**
 * Admin Facilities Page - Kelola fasilitas (Ruangan, Modul, Media Kit, Robot)
 */

const categories = [
    { value: "RUANGAN", label: "Ruangan" },
    { value: "MODUL", label: "Modul" },
    { value: "MEDIA_KIT", label: "Media Kit" },
    { value: "ROBOT", label: "Robot" },
];

export default function AdminFacilitiesPage() {
    const [facilities, setFacilities] = useState<BackendFacility[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<BackendFacility | null>(null);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({ category: "RUANGAN", title: "", description: "" });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchData(); }, [activeCategory]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await api.content.facilities(activeCategory || undefined);
            setFacilities(data.results);
        } catch (error) { console.error("Failed to fetch facilities:", error); }
        finally { setLoading(false); }
    };

    const resetForm = () => {
        setFormData({ category: "RUANGAN", title: "", description: "" });
        setImageFile(null);
        setImagePreview(null);
        setEditingItem(null);
    };

    const openModal = (item?: BackendFacility) => {
        if (item) {
            setEditingItem(item);
            setFormData({ category: item.category, title: item.title, description: item.description });
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
            data.append("category", formData.category);
            data.append("title", formData.title);
            data.append("description", formData.description);
            if (imageFile) data.append("image", imageFile);

            if (editingItem) {
                await api.content.updateFacility(editingItem.id, data);
            } else {
                await api.content.createFacility(data);
            }
            await fetchData();
            closeModal();
        } catch (error: any) {
            alert(error.message || "Gagal menyimpan fasilitas");
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus fasilitas ini?")) return;
        try {
            await api.content.deleteFacility(id);
            await fetchData();
        } catch (error: any) { alert(error.message || "Gagal menghapus fasilitas"); }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Facilities</h1>
                    <p className="text-primary/60">Kelola fasilitas pembelajaran</p>
                </div>
                <button onClick={() => openModal()} className="px-6 py-3 bg-secondary text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Fasilitas
                </button>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                <button onClick={() => setActiveCategory(null)} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeCategory === null ? "bg-primary text-white" : "bg-white text-primary hover:bg-gray-50"}`}>Semua</button>
                {categories.map((cat) => (
                    <button key={cat.value} onClick={() => setActiveCategory(cat.value)} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeCategory === cat.value ? "bg-primary text-white" : "bg-white text-primary hover:bg-gray-50"}`}>{cat.label}</button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse"><div className="h-48 bg-gray-100" /><div className="p-6 space-y-2"><div className="h-4 bg-gray-100 rounded w-1/4" /><div className="h-6 bg-gray-100 rounded w-3/4" /></div></div>)
                ) : facilities.length === 0 ? (
                    <div className="col-span-full bg-white rounded-2xl p-12 text-center text-primary/40">Belum ada fasilitas.</div>
                ) : (
                    facilities.map((facility) => (
                        <div key={facility.id} className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all group">
                            <div className="relative h-48">
                                <Image src={facility.image} alt={facility.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                                <div className="absolute top-4 left-4"><span className="px-3 py-1 bg-secondary text-white text-xs font-bold rounded-full">{facility.category_display}</span></div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-primary mb-2">{facility.title}</h3>
                                <p className="text-primary/60 text-sm line-clamp-2">{facility.description}</p>
                                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openModal(facility)} className="p-2 text-primary/40 hover:text-primary bg-gray-50 rounded-lg text-sm">Edit</button>
                                    <button onClick={() => handleDelete(facility.id)} className="p-2 text-red-400 hover:text-red-600 bg-gray-50 rounded-lg text-sm">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-primary mb-6">{editingItem ? "Edit Fasilitas" : "Tambah Fasilitas"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Kategori</label>
                                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary">
                                    {categories.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Gambar</label>
                                <div className="flex items-center gap-4">
                                    {imagePreview ? (
                                        <div className="relative w-32 h-20 border rounded-lg overflow-hidden">
                                            <Image src={imagePreview} alt="Preview" fill className="object-cover" sizes="128px" />
                                        </div>
                                    ) : (
                                        <div className="w-32 h-20 border border-dashed rounded-lg flex items-center justify-center text-primary/30">Preview</div>
                                    )}
                                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Pilih Gambar</button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Judul</label>
                                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Deskripsi</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary resize-none" rows={3} required />
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
