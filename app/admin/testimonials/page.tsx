"use client";

import { useEffect, useState, useRef } from "react";
import { api, BackendTestimonial } from "@/lib/api";
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
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
    testimonial: BackendTestimonial;
    onEdit: (testimonial: BackendTestimonial) => void;
    onDelete: (id: string) => void;
}

function SortableTestimonialCard({ testimonial, onEdit, onDelete }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: testimonial.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
        >
            <div className="flex items-start gap-6">
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="mt-2 cursor-grab active:cursor-grabbing text-primary/30 hover:text-primary transition-colors"
                    title="Drag to reorder"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                </button>

                {/* Photo */}
                <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-gray-100">
                    {testimonial.photo ? (
                        <Image src={testimonial.photo} alt={testimonial.name} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-primary/40 font-bold text-xl">
                            {testimonial.name.charAt(0)}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-primary text-lg truncate">{testimonial.name}</h4>
                    <p className="text-xs text-primary/60 font-medium mb-3">{testimonial.role}</p>
                    <p className="text-primary/80 text-sm leading-relaxed line-clamp-2 italic">"{testimonial.quote}"</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                    <button
                        onClick={() => onEdit(testimonial)}
                        className="w-10 h-10 bg-gray-50 text-primary/40 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                        title="Edit"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onDelete(testimonial.id)}
                        className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                        title="Delete"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminTestimonialsPage() {
    const [testimonials, setTestimonials] = useState<BackendTestimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<BackendTestimonial | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [quote, setQuote] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const loadTestimonials = async () => {
        setIsLoading(true);
        try {
            const data = await api.content.testimonials();
            setTestimonials(data.results);
        } catch (err) {
            console.error("Failed to load testimonials:", err);
            toast.error("Failed to load testimonials");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTestimonials();
    }, []);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = testimonials.findIndex((t) => t.id === active.id);
            const newIndex = testimonials.findIndex((t) => t.id === over.id);

            const newOrder = arrayMove(testimonials, oldIndex, newIndex);
            setTestimonials(newOrder);

            // Save new order to backend
            try {
                await api.content.reorderTestimonials(newOrder.map(t => t.id));
                toast.success("Order updated");
            } catch (err) {
                toast.error("Failed to update order");
                loadTestimonials(); // Revert on error
            }
        }
    };

    const openModal = (testimonial?: BackendTestimonial) => {
        if (testimonial) {
            setEditingTestimonial(testimonial);
            setName(testimonial.name);
            setRole(testimonial.role);
            setQuote(testimonial.quote);
            setImagePreview(testimonial.photo || "");
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingTestimonial(null);
        setName("");
        setRole("");
        setQuote("");
        setImageFile(null);
        setImagePreview("");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Image size must be less than 2MB");
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const formData = new FormData();
        formData.append("name", name);
        formData.append("role", role);
        formData.append("quote", quote);
        if (imageFile) formData.append("photo", imageFile);

        try {
            if (editingTestimonial) {
                await api.content.updateTestimonial(editingTestimonial.id, formData);
                toast.success("Testimonial updated");
            } else {
                await api.content.createTestimonial(formData);
                toast.success("Testimonial created");
            }
            setIsModalOpen(false);
            resetForm();
            loadTestimonials();
        } catch (err: any) {
            toast.error(err.message || "Failed to save testimonial");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this testimonial?")) return;

        try {
            await api.content.deleteTestimonial(id);
            toast.success("Testimonial deleted");
            loadTestimonials();
        } catch (err) {
            toast.error("Failed to delete testimonial");
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-primary tracking-tight">Student Testimonials</h3>
                    <p className="text-primary/40 text-xs font-bold uppercase tracking-widest">
                        {testimonials.length} testimonials • Drag to reorder
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-primary text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-secondary transition-all flex items-center gap-2 group"
                >
                    <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Testimonial
                </button>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                </div>
            ) : testimonials.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-20 text-center">
                    <p className="text-4xl mb-4">💬</p>
                    <h4 className="text-xl font-bold text-primary mb-2">No testimonials yet</h4>
                    <p className="text-primary/60">Add your first testimonial to get started</p>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={testimonials.map(t => t.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-4">
                            {testimonials.map((testimonial) => (
                                <SortableTestimonialCard
                                    key={testimonial.id}
                                    testimonial={testimonial}
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

                        <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 md:p-12 animate-in fade-in zoom-in duration-300">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-bold text-primary">
                                    {editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left Column */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                disabled={isSaving}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Role/Position</label>
                                            <input
                                                type="text"
                                                required
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                                disabled={isSaving}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                                placeholder="Student, AI Course 2024"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Photo (Max 2MB)</label>
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
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">Upload Photo</p>
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

                                    {/* Right Column */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Testimonial Quote</label>
                                        <textarea
                                            required
                                            value={quote}
                                            onChange={(e) => setQuote(e.target.value)}
                                            disabled={isSaving}
                                            rows={18}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-8 py-6 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium leading-relaxed disabled:opacity-50"
                                            placeholder="Share your experience with AICI..."
                                        />
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
                                            editingTestimonial ? "Save Changes" : "Create Testimonial"
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
