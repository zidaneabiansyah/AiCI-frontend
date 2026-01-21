"use client";

import { useState, useEffect, useRef } from "react";
import { api, BackendTestimonial } from "@/lib/api";
import Image from "next/image";

/**
 * Admin Testimonials Page
 * 
 * CRUD lengkap untuk mengelola testimoni siswa.
 * Form fields: name, role, quote, photo
 */

export default function AdminTestimonialsPage() {
    const [testimonials, setTestimonials] = useState<BackendTestimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<BackendTestimonial | null>(null);
    const [submitting, setSubmitting] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        quote: "",
    });
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await api.content.testimonials();
            setTestimonials(data.results);
        } catch (error) {
            console.error("Failed to fetch testimonials:", error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: "", role: "", quote: "" });
        setPhotoFile(null);
        setPhotoPreview(null);
        setEditingItem(null);
    };

    const openModal = (item?: BackendTestimonial) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                role: item.role,
                quote: item.quote,
            });
            setPhotoPreview(item.photo);
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("role", formData.role);
            data.append("quote", formData.quote);
            if (photoFile) {
                data.append("photo", photoFile);
            }

            if (editingItem) {
                await api.content.updateTestimonial(editingItem.id, data);
            } else {
                await api.content.createTestimonial(data);
            }

            await fetchData();
            closeModal();
        } catch (error: any) {
            console.error("Failed to save testimonial:", error);
            alert(error.message || "Gagal menyimpan testimoni");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus testimoni ini?")) return;
        
        try {
            await api.content.deleteTestimonial(id);
            await fetchData();
        } catch (error: any) {
            console.error("Failed to delete testimonial:", error);
            alert(error.message || "Gagal menghapus testimoni");
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Testimonials</h1>
                    <p className="text-primary/60">Kelola testimoni siswa AiCi</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="px-6 py-3 bg-secondary text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Testimoni
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left px-6 py-4 text-xs font-bold text-primary/40 uppercase tracking-wider">Foto</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-primary/40 uppercase tracking-wider">Nama</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-primary/40 uppercase tracking-wider">Role</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-primary/40 uppercase tracking-wider">Quote</th>
                            <th className="text-right px-6 py-4 text-xs font-bold text-primary/40 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-primary/40">Loading...</td>
                            </tr>
                        ) : testimonials.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-primary/40">
                                    Belum ada testimoni. Klik "Tambah Testimoni" untuk menambahkan.
                                </td>
                            </tr>
                        ) : (
                            testimonials.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        {item.photo ? (
                                            <div className="w-12 h-12 rounded-full overflow-hidden relative">
                                                <Image src={item.photo} alt={item.name} fill className="object-cover" sizes="48px" />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {item.name.substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-primary">{item.name}</td>
                                    <td className="px-6 py-4 text-primary/60">{item.role}</td>
                                    <td className="px-6 py-4 text-primary/60 max-w-xs truncate">"{item.quote}"</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => openModal(item)} className="text-primary/40 hover:text-primary mr-4">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-primary mb-6">
                            {editingItem ? "Edit Testimoni" : "Tambah Testimoni"}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Photo Upload */}
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Foto</label>
                                <div className="flex items-center gap-4">
                                    {photoPreview ? (
                                        <div className="relative w-20 h-20 rounded-full overflow-hidden">
                                            <Image src={photoPreview} alt="Preview" fill className="object-cover" sizes="80px" />
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-primary/30">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handlePhotoChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                                    >
                                        Pilih Foto
                                    </button>
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Nama</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary"
                                    placeholder="Contoh: Kahfi"
                                    required
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Role</label>
                                <input
                                    type="text"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary"
                                    placeholder="Contoh: Siswa SD"
                                    required
                                />
                            </div>

                            {/* Quote */}
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Quote</label>
                                <textarea
                                    value={formData.quote}
                                    onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary resize-none"
                                    placeholder="Contoh: Cool! Belajar AI sangat menyenangkan"
                                    rows={3}
                                    required
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50"
                                    disabled={submitting}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-secondary text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50"
                                    disabled={submitting}
                                >
                                    {submitting ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
