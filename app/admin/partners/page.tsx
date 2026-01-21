"use client";

import { useState, useEffect, useRef } from "react";
import { api, BackendPartner } from "@/lib/api";
import Image from "next/image";

/**
 * Admin Partners Page - Kelola partner/sponsor logos
 * Form fields: name, logo, website_url
 */

export default function AdminPartnersPage() {
    const [partners, setPartners] = useState<BackendPartner[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<BackendPartner | null>(null);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({ name: "", website_url: "" });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const data = await api.content.partners();
            setPartners(data.results);
        } catch (error) { console.error("Failed to fetch partners:", error); }
        finally { setLoading(false); }
    };

    const resetForm = () => {
        setFormData({ name: "", website_url: "" });
        setLogoFile(null);
        setLogoPreview(null);
        setEditingItem(null);
    };

    const openModal = (item?: BackendPartner) => {
        if (item) {
            setEditingItem(item);
            setFormData({ name: item.name, website_url: item.website_url || "" });
            setLogoPreview(item.logo);
        } else { resetForm(); }
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); resetForm(); };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = new FormData();
            data.append("name", formData.name);
            if (formData.website_url) data.append("website_url", formData.website_url);
            if (logoFile) data.append("logo", logoFile);

            if (editingItem) {
                await api.content.updatePartner(editingItem.id, data);
            } else {
                await api.content.createPartner(data);
            }
            await fetchData();
            closeModal();
        } catch (error: any) {
            alert(error.message || "Gagal menyimpan partner");
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus partner ini?")) return;
        try {
            await api.content.deletePartner(id);
            await fetchData();
        } catch (error: any) { alert(error.message || "Gagal menghapus partner"); }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Partners</h1>
                    <p className="text-primary/60">Kelola logo partner dan sponsor</p>
                </div>
                <button onClick={() => openModal()} className="px-6 py-3 bg-secondary text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Partner
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {loading ? (
                    [...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl p-6 animate-pulse"><div className="h-20 bg-gray-100 rounded-lg" /></div>)
                ) : partners.length === 0 ? (
                    <div className="col-span-full bg-white rounded-2xl p-12 text-center text-primary/40">Belum ada partner.</div>
                ) : (
                    partners.map((partner) => (
                        <div key={partner.id} className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all group">
                            <div className="relative h-20 mb-4">
                                <Image src={partner.logo} alt={partner.name} fill className="object-contain" sizes="150px" />
                            </div>
                            <p className="text-center text-sm font-medium text-primary truncate">{partner.name}</p>
                            <div className="flex justify-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openModal(partner)} className="p-2 text-primary/40 hover:text-primary">Edit</button>
                                <button onClick={() => handleDelete(partner.id)} className="p-2 text-red-400 hover:text-red-600">Delete</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4">
                        <h2 className="text-xl font-bold text-primary mb-6">{editingItem ? "Edit Partner" : "Tambah Partner"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Logo</label>
                                <div className="flex items-center gap-4">
                                    {logoPreview ? (
                                        <div className="relative w-24 h-16 border rounded-lg overflow-hidden">
                                            <Image src={logoPreview} alt="Preview" fill className="object-contain" sizes="96px" />
                                        </div>
                                    ) : (
                                        <div className="w-24 h-16 border border-dashed rounded-lg flex items-center justify-center text-primary/30">Logo</div>
                                    )}
                                    <input type="file" ref={fileInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Pilih Logo</button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Nama Partner</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary" placeholder="Contoh: FMIPA UI" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Website URL (opsional)</label>
                                <input type="url" value={formData.website_url} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary" placeholder="https://example.com" />
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
