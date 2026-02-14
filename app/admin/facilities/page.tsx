"use client";

import { useEffect, useState, useRef } from "react";
import { api, BackendFacility } from "@/lib/api";
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

type FacilityCategory = 'RUANGAN' | 'MODUL' | 'MEDIA_KIT' | 'ROBOT';

interface SortableItemProps {
    facility: BackendFacility;
    onEdit: (facility: BackendFacility) => void;
    onDelete: (id: string) => void;
}

function SortableFacilityCard({ facility, onEdit, onDelete }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: facility.id });

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
            <div className="relative h-48 overflow-hidden bg-gray-50">
                {facility.image ? (
                    <Image
                        src={facility.image}
                        alt={facility.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/20 text-4xl font-bold">
                        {facility.title.charAt(0)}
                    </div>
                )}
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
            <div className="p-6">
                <h4 className="font-bold text-primary text-lg mb-2 line-clamp-1 group-hover:text-secondary transition-colors">
                    {facility.title}
                </h4>
                <p className="text-primary/60 text-sm leading-relaxed line-clamp-2 mb-4">
                    {facility.description}
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(facility)}
                        className="flex-1 bg-gray-50 text-primary font-bold py-2.5 rounded-xl hover:bg-primary hover:text-white transition-all text-xs"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(facility.id)}
                        className="px-4 bg-red-50 text-red-500 font-bold py-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all text-xs"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminFacilitiesPage() {
    const [facilities, setFacilities] = useState<BackendFacility[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFacility, setEditingFacility] = useState<BackendFacility | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<FacilityCategory>('RUANGAN');

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<FacilityCategory>('RUANGAN');
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

    const loadFacilities = async () => {
        setIsLoading(true);
        try {
            const data = await api.content.facilities();
            setFacilities(data.results);
        } catch (err) {
            console.error("Failed to load facilities:", err);
            toast.error("Failed to load facilities");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFacilities();
    }, []);

    const filteredFacilities = facilities.filter(f => f.category === activeTab);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const filtered = filteredFacilities;
            const oldIndex = filtered.findIndex((f) => f.id === active.id);
            const newIndex = filtered.findIndex((f) => f.id === over.id);

            const newOrder = arrayMove(filtered, oldIndex, newIndex);
            
            // Update local state
            const otherFacilities = facilities.filter(f => f.category !== activeTab);
            setFacilities([...otherFacilities, ...newOrder]);

            // Save new order to backend
            try {
                await api.content.reorderFacilities(newOrder.map(f => f.id));
                toast.success("Order updated");
            } catch (err) {
                toast.error("Failed to update order");
                loadFacilities(); // Revert on error
            }
        }
    };

    const openModal = (facility?: BackendFacility) => {
        if (facility) {
            setEditingFacility(facility);
            setTitle(facility.title);
            setDescription(facility.description);
            setCategory(facility.category);
            setImagePreview(facility.image);
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingFacility(null);
        setTitle("");
        setDescription("");
        setCategory(activeTab);
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
        formData.append("category", category);
        if (imageFile) formData.append("image", imageFile);

        try {
            if (editingFacility) {
                await api.content.updateFacility(editingFacility.id, formData);
                toast.success("Facility updated");
            } else {
                await api.content.createFacility(formData);
                toast.success("Facility created");
            }
            setIsModalOpen(false);
            resetForm();
            loadFacilities();
        } catch (err: any) {
            toast.error(err.message || "Failed to save facility");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this facility?")) return;

        try {
            await api.content.deleteFacility(id);
            toast.success("Facility deleted");
            loadFacilities();
        } catch (err) {
            toast.error("Failed to delete facility");
        }
    };

    const tabs: { key: FacilityCategory; label: string; icon: string }[] = [
        { key: 'RUANGAN', label: 'Ruangan', icon: '🏢' },
        { key: 'MODUL', label: 'Modul', icon: '📚' },
        { key: 'MEDIA_KIT', label: 'Media Kit', icon: '🎬' },
        { key: 'ROBOT', label: 'Robot', icon: '🤖' },
    ];

    const getCategoryCount = (cat: FacilityCategory) => facilities.filter(f => f.category === cat).length;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-primary tracking-tight">Facilities & Equipment</h3>
                    <p className="text-primary/40 text-xs font-bold uppercase tracking-widest">
                        {facilities.length} total facilities • Drag to reorder per category
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-primary text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-secondary transition-all flex items-center gap-2 group"
                >
                    <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Facility
                </button>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`p-6 rounded-2xl font-bold transition-all ${
                            activeTab === tab.key
                                ? 'bg-white text-primary shadow-lg border border-gray-100 scale-105'
                                : 'bg-gray-50 text-primary/40 hover:bg-white hover:scale-102'
                        }`}
                    >
                        <div className="text-3xl mb-2">{tab.icon}</div>
                        <div className="text-sm">{tab.label}</div>
                        <div className="text-xs text-primary/40 mt-1">({getCategoryCount(tab.key)})</div>
                    </button>
                ))}
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                </div>
            ) : filteredFacilities.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-20 text-center">
                    <p className="text-4xl mb-4">{tabs.find(t => t.key === activeTab)?.icon}</p>
                    <h4 className="text-xl font-bold text-primary mb-2">No {tabs.find(t => t.key === activeTab)?.label.toLowerCase()} yet</h4>
                    <p className="text-primary/60">Add your first facility to get started</p>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={filteredFacilities.map(f => f.id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredFacilities.map((facility) => (
                                <SortableFacilityCard
                                    key={facility.id}
                                    facility={facility}
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
                                    {editingFacility ? "Edit Facility" : "Add Facility"}
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
                                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Title</label>
                                            <input
                                                type="text"
                                                required
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                disabled={isSaving}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                                placeholder="Lab Komputer AI"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Category (Fixed)</label>
                                            <select
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value as FacilityCategory)}
                                                disabled={isSaving || !!editingFacility}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                            >
                                                <option value="RUANGAN">🏢 Ruangan</option>
                                                <option value="MODUL">📚 Modul</option>
                                                <option value="MEDIA_KIT">🎬 Media Kit</option>
                                                <option value="ROBOT">🤖 Robot</option>
                                            </select>
                                            {editingFacility && (
                                                <p className="text-xs text-primary/40 ml-1">Category cannot be changed after creation</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Description</label>
                                            <textarea
                                                required
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                disabled={isSaving}
                                                rows={6}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium leading-relaxed disabled:opacity-50"
                                                placeholder="Describe the facility..."
                                            />
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Image (Max 3MB)</label>
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
                                            editingFacility ? "Save Changes" : "Create Facility"
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
