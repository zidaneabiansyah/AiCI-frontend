"use client";

import { useEffect, useState, useRef } from "react";
import { api, BackendGalleryImage } from "@/lib/api";
import Image from "next/image";
import toast from "react-hot-toast";

type GalleryCategory = 'Achievements' | 'Activities' | 'Events' | 'Competitions';

export default function AdminGalleryPage() {
    const [images, setImages] = useState<BackendGalleryImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingImage, setEditingImage] = useState<BackendGalleryImage | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // Filters
    const [filterCategory, setFilterCategory] = useState<GalleryCategory | 'All'>('All');
    const [filterFeatured, setFilterFeatured] = useState<boolean | 'All'>('All');

    // Form state
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<GalleryCategory>('Activities');
    const [description, setDescription] = useState("");
    const [dateTaken, setDateTaken] = useState("");
    const [isFeatured, setIsFeatured] = useState(false);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadImages = async () => {
        setIsLoading(true);
        try {
            const data = await api.content.gallery();
            setImages(data.results);
        } catch (err) {
            console.error("Failed to load gallery:", err);
            toast.error("Failed to load gallery");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadImages();
    }, []);

    const filteredImages = images.filter(img => {
        if (filterCategory !== 'All' && img.category !== filterCategory) return false;
        if (filterFeatured !== 'All' && img.is_featured !== filterFeatured) return false;
        return true;
    });

    const openModal = (image?: BackendGalleryImage) => {
        if (image) {
            setEditingImage(image);
            setTitle(image.title);
            setCategory(image.category as GalleryCategory);
            setDescription(image.description || "");
            setDateTaken(image.date_taken || "");
            setIsFeatured(image.is_featured);
            setImagePreviews([image.image]);
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingImage(null);
        setTitle("");
        setCategory('Activities');
        setDescription("");
        setDateTaken("");
        setIsFeatured(false);
        setImageFiles([]);
        setImagePreviews([]);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        
        // Validate total files (max 10 for bulk upload)
        if (files.length > 10) {
            toast.error("Maximum 10 images at once");
            return;
        }

        // Validate each file size (max 5MB)
        const validFiles = files.filter(file => {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} exceeds 5MB`);
                return false;
            }
            return true;
        });

        setImageFiles(validFiles);

        // Generate previews
        const previews: string[] = [];
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                previews.push(reader.result as string);
                if (previews.length === validFiles.length) {
                    setImagePreviews(previews);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (editingImage) {
                // Update existing image
                const formData = new FormData();
                formData.append("title", title);
                formData.append("category", category);
                formData.append("description", description);
                if (dateTaken) formData.append("date_taken", dateTaken);
                formData.append("is_featured", String(isFeatured));
                if (imageFiles.length > 0) formData.append("image", imageFiles[0]);

                await api.content.updateGalleryImage(editingImage.id, formData);
                toast.success("Image updated");
            } else {
                // Bulk create
                for (const file of imageFiles) {
                    const formData = new FormData();
                    formData.append("title", title);
                    formData.append("category", category);
                    formData.append("description", description);
                    if (dateTaken) formData.append("date_taken", dateTaken);
                    formData.append("is_featured", String(isFeatured));
                    formData.append("image", file);

                    await api.content.createGalleryImage(formData);
                }
                toast.success(`${imageFiles.length} image(s) uploaded`);
            }
            setIsModalOpen(false);
            resetForm();
            loadImages();
        } catch (err: any) {
            toast.error(err.message || "Failed to save image");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this image?")) return;

        try {
            await api.content.deleteGalleryImage(id);
            toast.success("Image deleted");
            loadImages();
        } catch (err) {
            toast.error("Failed to delete image");
        }
    };

    const toggleFeatured = async (image: BackendGalleryImage) => {
        try {
            const formData = new FormData();
            formData.append("is_featured", String(!image.is_featured));
            await api.content.updateGalleryImage(image.id, formData);
            toast.success(image.is_featured ? "Removed from featured" : "Added to featured");
            loadImages();
        } catch (err) {
            toast.error("Failed to update featured status");
        }
    };

    const categories: GalleryCategory[] = ['Achievements', 'Activities', 'Events', 'Competitions'];
    const getCategoryIcon = (cat: GalleryCategory) => {
        const icons = {
            'Achievements': '🏆',
            'Activities': '🎨',
            'Events': '🎉',
            'Competitions': '🥇',
        };
        return icons[cat];
    };

    const getCategoryColor = (cat: GalleryCategory) => {
        const colors = {
            'Achievements': 'bg-yellow-100 text-yellow-600',
            'Activities': 'bg-blue-100 text-blue-600',
            'Events': 'bg-purple-100 text-purple-600',
            'Competitions': 'bg-green-100 text-green-600',
        };
        return colors[cat];
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-primary tracking-tight">Photo Gallery</h3>
                    <p className="text-primary/40 text-xs font-bold uppercase tracking-widest">
                        {filteredImages.length} of {images.length} images • {images.filter(i => i.is_featured).length} featured
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-primary text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-secondary transition-all flex items-center gap-2 group"
                >
                    <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Upload Images
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Category Filter */}
                    <div className="flex-1">
                        <label className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-3 block">Filter by Category</label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setFilterCategory('All')}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                    filterCategory === 'All'
                                        ? 'bg-primary text-white shadow-lg'
                                        : 'bg-gray-50 text-primary/60 hover:bg-gray-100'
                                }`}
                            >
                                All
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilterCategory(cat)}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                                        filterCategory === cat
                                            ? 'bg-primary text-white shadow-lg'
                                            : 'bg-gray-50 text-primary/60 hover:bg-gray-100'
                                    }`}
                                >
                                    <span>{getCategoryIcon(cat)}</span>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Featured Filter */}
                    <div>
                        <label className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-3 block">Featured</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilterFeatured('All')}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                    filterFeatured === 'All'
                                        ? 'bg-primary text-white shadow-lg'
                                        : 'bg-gray-50 text-primary/60 hover:bg-gray-100'
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilterFeatured(true)}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                                    filterFeatured === true
                                        ? 'bg-primary text-white shadow-lg'
                                        : 'bg-gray-50 text-primary/60 hover:bg-gray-100'
                                }`}
                            >
                                ⭐ Featured
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Masonry Grid */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                </div>
            ) : filteredImages.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-20 text-center">
                    <p className="text-4xl mb-4">📸</p>
                    <h4 className="text-xl font-bold text-primary mb-2">No images found</h4>
                    <p className="text-primary/60">Upload your first image or adjust filters</p>
                </div>
            ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                    {filteredImages.map((image) => (
                        <div
                            key={image.id}
                            className="break-inside-avoid bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
                        >
                            {/* Image */}
                            <div className="relative overflow-hidden">
                                <Image
                                    src={image.image}
                                    alt={image.title}
                                    width={400}
                                    height={300}
                                    className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                {/* Featured Badge */}
                                {image.is_featured && (
                                    <div className="absolute top-4 right-4 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                                        <span className="text-xl">⭐</span>
                                    </div>
                                )}
                                {/* Category Badge */}
                                <div className="absolute top-4 left-4">
                                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${getCategoryColor(image.category as GalleryCategory)}`}>
                                        {getCategoryIcon(image.category as GalleryCategory)} {image.category}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h4 className="font-bold text-primary text-lg mb-2 line-clamp-2">
                                    {image.title}
                                </h4>
                                {image.description && (
                                    <p className="text-primary/60 text-sm leading-relaxed line-clamp-2 mb-3">
                                        {image.description}
                                    </p>
                                )}
                                {image.date_taken && (
                                    <p className="text-xs text-primary/40 font-bold mb-4">
                                        📅 {new Date(image.date_taken).toLocaleDateString()}
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleFeatured(image)}
                                        className={`flex-1 font-bold py-2.5 rounded-xl transition-all text-xs ${
                                            image.is_featured
                                                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                                : 'bg-gray-50 text-primary/60 hover:bg-gray-100'
                                        }`}
                                        title={image.is_featured ? "Remove from featured" : "Add to featured"}
                                    >
                                        ⭐ {image.is_featured ? 'Featured' : 'Feature'}
                                    </button>
                                    <button
                                        onClick={() => openModal(image)}
                                        className="px-4 bg-gray-50 text-primary font-bold py-2.5 rounded-xl hover:bg-primary hover:text-white transition-all text-xs"
                                        title="Edit"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(image.id)}
                                        className="px-4 bg-red-50 text-red-500 font-bold py-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all text-xs"
                                        title="Delete"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="min-h-screen flex items-center justify-center p-4">
                        <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm" onClick={() => !isSaving && setIsModalOpen(false)} />

                        <div className="relative bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl p-10 md:p-12 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-bold text-primary">
                                    {editingImage ? "Edit Image" : "Upload Images"}
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

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Image Upload */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">
                                        {editingImage ? "Replace Image (Max 5MB)" : "Upload Images (Max 10 images, 5MB each)"}
                                    </label>
                                    <div
                                        onClick={() => !isSaving && fileInputRef.current?.click()}
                                        className="w-full min-h-50 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group p-4"
                                    >
                                        {imagePreviews.length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
                                                {imagePreviews.map((preview, idx) => (
                                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden">
                                                        <Image src={preview} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center space-y-2">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                                                    <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">
                                                    {editingImage ? "Click to replace" : "Click to upload (multiple)"}
                                                </p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            multiple={!editingImage}
                                            disabled={isSaving}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            disabled={isSaving}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                            placeholder="Event title"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Category</label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value as GalleryCategory)}
                                            disabled={isSaving}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{getCategoryIcon(cat)} {cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Date Taken (Optional)</label>
                                        <input
                                            type="date"
                                            value={dateTaken}
                                            onChange={(e) => setDateTaken(e.target.value)}
                                            disabled={isSaving}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Featured</label>
                                        <label className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 cursor-pointer hover:bg-gray-100 transition-all">
                                            <input
                                                type="checkbox"
                                                checked={isFeatured}
                                                onChange={(e) => setIsFeatured(e.target.checked)}
                                                disabled={isSaving}
                                                className="w-5 h-5 rounded text-primary focus:ring-2 focus:ring-secondary/20"
                                            />
                                            <span className="text-primary font-medium">⭐ Mark as featured</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Description (Optional)</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        disabled={isSaving}
                                        rows={3}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                        placeholder="Describe the image..."
                                    />
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
                                        disabled={isSaving || imageFiles.length === 0}
                                        className="flex-1 bg-primary text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 hover:bg-secondary transition-all uppercase tracking-widest text-xs disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            editingImage ? "Save Changes" : `Upload ${imageFiles.length} Image(s)`
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
