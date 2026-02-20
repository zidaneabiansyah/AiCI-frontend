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
}

function SortableProgramCard({ program, onEdit }: SortableItemProps) {
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

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
        >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <Image
                    src={program.image || "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070"}
                    alt={program.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
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
            </div>

            {/* Content */}
            <div className="p-8">
                <h4 className="font-bold text-primary text-xl mb-3 line-clamp-1 group-hover:text-secondary transition-colors">
                    {program.title}
                </h4>
                <p className="text-primary/60 text-sm leading-relaxed line-clamp-3 mb-6">
                    {program.description}
                </p>
                <button
                    onClick={() => onEdit(program)}
                    className="w-full bg-gray-50 text-primary font-bold py-3 rounded-xl hover:bg-primary hover:text-white transition-all text-xs uppercase tracking-widest"
                >
                    Edit Program
                </button>
            </div>
        </div>
    );
}

export default function AdminProgramsPage() {
    const [programs, setPrograms] = useState<BackendProgram[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProgram, setEditingProgram] = useState<BackendProgram | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
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

    const loadPrograms = async () => {
        setIsLoading(true);
        try {
            const data = await api.content.programs();
            setPrograms(data.data);
        } catch (err) {
            console.error("Failed to load programs:", err);
            toast.error("Failed to load programs");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPrograms();
    }, []);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = programs.findIndex((p) => p.id === active.id);
            const newIndex = programs.findIndex((p) => p.id === over.id);

            const newOrder = arrayMove(programs, oldIndex, newIndex);
            setPrograms(newOrder);

            // Save new order to backend
            try {
                await api.content.reorderPrograms(newOrder.map(p => p.id));
                toast.success("Order updated");
            } catch (err) {
                toast.error("Failed to update order");
                loadPrograms(); // Revert on error
            }
        }
    };

    const openModal = (program?: BackendProgram) => {
        if (program) {
            setEditingProgram(program);
            setTitle(program.title);
            setDescription(program.description);
            setImagePreview(program.image);
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingProgram(null);
        setTitle("");
        setDescription("");
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        if (imageFile) formData.append("image", imageFile);

        try {
            if (editingProgram) {
                // Note: Backend might not have update endpoint, check api.ts
                toast("Update functionality pending backend support", { icon: 'ℹ️' });
            } else {
                // Note: Backend might not have create endpoint, check api.ts
                toast("Create functionality pending backend support", { icon: 'ℹ️' });
            }
            setIsModalOpen(false);
            resetForm();
            loadPrograms();
        } catch (err: any) {
            toast.error(err.message || "Failed to save program");
        } finally {
            setIsSaving(false);
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
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={programs.map(p => p.id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {programs.map((program) => (
                                <SortableProgramCard
                                    key={program.id}
                                    program={program}
                                    onEdit={openModal}
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

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left Column */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Program Title</label>
                                            <input
                                                type="text"
                                                required
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                disabled={isSaving}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                                placeholder="AI for Kids"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Description</label>
                                            <textarea
                                                required
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                disabled={isSaving}
                                                rows={10}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-8 py-6 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium leading-relaxed disabled:opacity-50"
                                                placeholder="Describe the program objectives and target audience..."
                                            />
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Program Image (Max 3MB)</label>
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
                                                    <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">Upload Image</p>
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
