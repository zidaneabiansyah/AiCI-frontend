"use client";

import { useEffect, useState, useRef } from "react";
import { api, BackendProgram } from "@/lib/api";
import Image from "next/image";
import toast from "react-hot-toast";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
    program: BackendProgram;
    onEdit: (program: BackendProgram) => void;
    onDelete: (id: string) => void;
}

function SortableProgramCard({ program, onEdit, onDelete }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: program.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const firstImage = program.images && program.images.length > 0 ? program.images[0] : null;
    const imageUrl = firstImage
        ? firstImage.startsWith('http')
            ? firstImage
            : `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${firstImage}`
        : "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070";

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
        >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <Image
                    src={imageUrl}
                    alt={program.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    unoptimized={!imageUrl.startsWith('http')}
                />
                {/* Drag Handle Overlay */}
                <button
                    {...attributes}
                    {...listeners}
                    className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing text-primary/60 hover:text-primary transition-colors shadow-lg"
                    title="Drag to reorder"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                </button>

                {/* Active badge */}
                {!program.is_active && (
                    <div className="absolute top-4 right-4 px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-lg">
                        Inactive
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6">

                <h4 className="font-bold text-primary text-xl mb-2 line-clamp-1 group-hover:text-secondary transition-colors">
                    {program.name}
                </h4>
                <p className="text-primary/60 text-sm leading-relaxed line-clamp-2 mb-4">
                    {program.description || 'No description'}
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(program)}
                        className="flex-1 bg-gray-50 text-primary font-bold py-2.5 rounded-xl hover:bg-primary hover:text-white transition-all text-xs uppercase tracking-widest"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(program.id)}
                        className="px-4 bg-red-50 text-red-500 font-bold py-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all text-xs"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Education levels used in the form
// ─────────────────────────────────────────────────────────────
const EDUCATION_LEVELS = ['SD', 'SMP', 'SMA', 'Umum', 'Semua'];

export default function AdminProgramsPage() {
    const [programs, setPrograms] = useState<BackendProgram[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProgram, setEditingProgram] = useState<BackendProgram | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form state — matches DB field names
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [brochureUrl, setBrochureUrl] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [deletedImages, setDeletedImages] = useState<string[]>([]);
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const loadPrograms = async () => {
        setIsLoading(true);
        try {
            const data = await api.content.programs();
            setPrograms(data.results || []);
        } catch (err) {
            console.error("Failed to load programs:", err);
            toast.error("Failed to load programs");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadPrograms(); }, []);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = programs.findIndex(p => p.id === active.id);
            const newIndex = programs.findIndex(p => p.id === over.id);
            const newOrder = arrayMove(programs, oldIndex, newIndex);
            setPrograms(newOrder);
            try {
                await api.content.reorderPrograms(newOrder.map(p => p.id));
                toast.success("Order updated");
            } catch {
                toast.error("Failed to update order");
                loadPrograms();
            }
        }
    };

    const openModal = (program?: BackendProgram) => {
        if (program) {
            setEditingProgram(program);
            setName(program.name);
            setDescription(program.description || "");
            setBrochureUrl(program.brochure_url || "");
            setIsActive(program.is_active);
            setExistingImages(program.images || []);
            setDeletedImages([]);
            setNewImageFiles([]);
            setNewImagePreviews([]);
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingProgram(null);
        setName("");
        setDescription("");
        setBrochureUrl("");
        setIsActive(true);
        setExistingImages([]);
        setDeletedImages([]);
        setNewImageFiles([]);
        setNewImagePreviews([]);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const totalImages = existingImages.length + newImageFiles.length + files.length;
        if (totalImages > 3) {
            toast.error("Maximum 3 images allowed");
            return;
        }

        const validFiles = files.filter(f => f.size <= 3 * 1024 * 1024);
        if (validFiles.length < files.length) {
            toast.error("Some images were larger than 3MB and skipped");
        }

        if (validFiles.length) {
            setNewImageFiles(prev => [...prev, ...validFiles]);
            
            validFiles.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setNewImagePreviews(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleRemoveExistingImage = (img: string) => {
        setExistingImages(prev => prev.filter(i => i !== img));
        setDeletedImages(prev => [...prev, img]);
    };

    const handleRemoveNewImage = (index: number) => {
        setNewImageFiles(prev => prev.filter((_, i) => i !== index));
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const formData = new FormData();
        formData.append("name", name);
        if (description) formData.append("description", description);
        if (brochureUrl) formData.append("brochure_url", brochureUrl);
        formData.append("is_active", isActive ? "1" : "0");
        
        newImageFiles.forEach(file => { formData.append("images[]", file); });
        deletedImages.forEach(img => { formData.append("deleted_images[]", img); });

        try {
            if (editingProgram) {
                await api.content.updateProgram(editingProgram.id, formData);
                toast.success("Program updated successfully!");
            } else {
                await api.content.createProgram(formData);
                toast.success("Program created successfully!");
            }
            setIsModalOpen(false);
            resetForm();
            loadPrograms();
        } catch (err: any) {
            const msg = err?.data?.errors
                ? Object.values(err.data.errors).flat().join(', ')
                : err.message || "Failed to save program";
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this program? This action cannot be undone.")) return;
        try {
            await api.content.deleteProgram(id);
            toast.success("Program deleted");
            loadPrograms();
        } catch {
            toast.error("Failed to delete program");
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-primary tracking-tight">Education Programs</h3>
                    <p className="text-primary/40 text-xs font-bold uppercase tracking-widest">
                        {programs.length} programs • Drag to reorder
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-primary text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-secondary transition-all flex items-center gap-2 group"
                >
                    <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Program
                </button>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                </div>
            ) : programs.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-20 text-center">
                    <p className="text-4xl mb-4">📚</p>
                    <h4 className="text-xl font-bold text-primary mb-2">No programs yet</h4>
                    <p className="text-primary/60">Add your first program to get started</p>
                </div>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={programs.map(p => p.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {programs.map(program => (
                                <SortableProgramCard
                                    key={program.id}
                                    program={program}
                                    onEdit={openModal}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="min-h-screen flex items-center justify-center p-4">
                        <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm" onClick={() => !isSaving && setIsModalOpen(false)} />

                        <div className="relative bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl p-10 md:p-12 animate-in fade-in zoom-in duration-300 max-h-[95vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-bold text-primary">
                                    {editingProgram ? "Edit Program" : "Add Program"}
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Program Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                disabled={isSaving}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                                placeholder="AI for Kids"
                                            />
                                        </div>


                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Description</label>
                                            <textarea
                                                value={description}
                                                onChange={e => setDescription(e.target.value)}
                                                disabled={isSaving}
                                                rows={4}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium leading-relaxed disabled:opacity-50"
                                                placeholder="Describe the program objectives and target audience..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Brochure URL</label>
                                            <input type="url" value={brochureUrl} onChange={e => setBrochureUrl(e.target.value)} disabled={isSaving}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 text-primary font-medium disabled:opacity-50" placeholder="https://example.com/brochure.pdf" />
                                        </div>

{/* Active toggle */}
                                        <label className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 cursor-pointer hover:bg-gray-100 transition-all">
                                            <input
                                                type="checkbox"
                                                checked={isActive}
                                                onChange={e => setIsActive(e.target.checked)}
                                                disabled={isSaving}
                                                className="w-5 h-5 rounded text-primary"
                                            />
                                            <span className="text-primary font-medium text-sm">✅ Active (visible to public)</span>
                                        </label>
                                    </div>

                                    {/* Right Column — Images */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Program Images (Max 3, Max 3MB/ea)</label>
                                            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{existingImages.length + newImageFiles.length}/3</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 pb-2">
                                            {existingImages.map((img, i) => (
                                                <div key={`existing-${i}`} className="relative h-32 bg-gray-50 rounded-2xl border-2 border-gray-100 overflow-hidden group">
                                                    <Image src={img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${img}`} alt={`Image ${i+1}`} fill className="object-cover" unoptimized />
                                                    <button type="button" onClick={() => handleRemoveExistingImage(img)} className="absolute top-2 right-2 bg-red-500/80 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm z-10 backdrop-blur-sm">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            ))}
                                            {newImagePreviews.map((preview, i) => (
                                                <div key={`new-${i}`} className="relative h-32 bg-gray-50 rounded-2xl border-2 border-gray-100 overflow-hidden group">
                                                    <Image src={preview} alt={`New image ${i+1}`} fill className="object-cover" unoptimized />
                                                    <button type="button" onClick={() => handleRemoveNewImage(i)} className="absolute top-2 right-2 bg-red-500/80 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm z-10 backdrop-blur-sm">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            ))}
                                            {(existingImages.length + newImageFiles.length) < 3 && (
                                                <div onClick={() => !isSaving && fileInputRef.current?.click()} className="h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-secondary transition-all group">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-2">
                                                        <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest text-center px-2">Add Image</span>
                                                </div>
                                            )}
                                        </div>
                                        <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" disabled={isSaving} />
                                    </div>
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
                                            editingProgram ? "Save Changes" : "Create Program"
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
