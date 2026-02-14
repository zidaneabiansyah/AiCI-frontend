"use client";

import { useEffect, useState, useRef } from "react";
import { api, BackendTeamMember } from "@/lib/api";
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
    member: BackendTeamMember;
    onEdit: (member: BackendTeamMember) => void;
    onDelete: (id: string) => void;
}

function SortableTeamCard({ member, onEdit, onDelete }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: member.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
        >
            {/* Drag Handle */}
            <div className="flex justify-between items-start mb-6">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-primary/30 hover:text-primary transition-colors"
                    title="Drag to reorder"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                </button>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    member.role_type === 'OPERASIONAL' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                }`}>
                    {member.role_type_display}
                </span>
            </div>

            {/* Photo */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-4 border-gray-50">
                {member.photo ? (
                    <Image src={member.photo} alt={member.name} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-primary/40 font-bold text-3xl">
                        {member.name.charAt(0)}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="text-center mb-6">
                <h4 className="font-bold text-primary text-lg mb-1">{member.name}</h4>
                <p className="text-sm text-primary/60 font-medium">{member.position}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={() => onEdit(member)}
                    className="flex-1 bg-gray-50 text-primary font-bold py-3 rounded-xl hover:bg-primary hover:text-white transition-all text-xs"
                >
                    Edit
                </button>
                <button
                    onClick={() => onDelete(member.id)}
                    className="px-4 bg-red-50 text-red-500 font-bold py-3 rounded-xl hover:bg-red-500 hover:text-white transition-all text-xs"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}

export default function AdminTeamPage() {
    const [teamMembers, setTeamMembers] = useState<BackendTeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<BackendTeamMember | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'OPERASIONAL' | 'TUTOR'>('OPERASIONAL');

    // Form state
    const [name, setName] = useState("");
    const [position, setPosition] = useState("");
    const [roleType, setRoleType] = useState<'OPERASIONAL' | 'TUTOR'>('OPERASIONAL');
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

    const loadTeamMembers = async () => {
        setIsLoading(true);
        try {
            const data = await api.content.team();
            setTeamMembers(data.results);
        } catch (err) {
            console.error("Failed to load team members:", err);
            toast.error("Failed to load team members");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTeamMembers();
    }, []);

    const filteredMembers = teamMembers.filter(m => m.role_type === activeTab);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const filtered = filteredMembers;
            const oldIndex = filtered.findIndex((m) => m.id === active.id);
            const newIndex = filtered.findIndex((m) => m.id === over.id);

            const newOrder = arrayMove(filtered, oldIndex, newIndex);
            
            // Update local state
            const otherMembers = teamMembers.filter(m => m.role_type !== activeTab);
            setTeamMembers([...otherMembers, ...newOrder]);

            // Save new order to backend
            try {
                await api.content.reorderTeamMembers(newOrder.map(m => m.id));
                toast.success("Order updated");
            } catch (err) {
                toast.error("Failed to update order");
                loadTeamMembers(); // Revert on error
            }
        }
    };

    const openModal = (member?: BackendTeamMember) => {
        if (member) {
            setEditingMember(member);
            setName(member.name);
            setPosition(member.position);
            setRoleType(member.role_type);
            setImagePreview(member.photo);
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingMember(null);
        setName("");
        setPosition("");
        setRoleType(activeTab);
        setImageFile(null);
        setImagePreview("");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Photo size must be less than 2MB");
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
        formData.append("position", position);
        formData.append("role_type", roleType);
        if (imageFile) formData.append("photo", imageFile);

        try {
            if (editingMember) {
                await api.content.updateTeamMember(editingMember.id, formData);
                toast.success("Team member updated");
            } else {
                await api.content.createTeamMember(formData);
                toast.success("Team member created");
            }
            setIsModalOpen(false);
            resetForm();
            loadTeamMembers();
        } catch (err: any) {
            toast.error(err.message || "Failed to save team member");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this team member?")) return;

        try {
            await api.content.deleteTeamMember(id);
            toast.success("Team member deleted");
            loadTeamMembers();
        } catch (err) {
            toast.error("Failed to delete team member");
        }
    };

    const operasionalCount = teamMembers.filter(m => m.role_type === 'OPERASIONAL').length;
    const tutorCount = teamMembers.filter(m => m.role_type === 'TUTOR').length;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-primary tracking-tight">Team Members</h3>
                    <p className="text-primary/40 text-xs font-bold uppercase tracking-widest">
                        {operasionalCount} Operasional • {tutorCount} Tutors • Drag to reorder
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-primary text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-secondary transition-all flex items-center gap-2 group"
                >
                    <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Team Member
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4">
                <button
                    onClick={() => setActiveTab('OPERASIONAL')}
                    className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
                        activeTab === 'OPERASIONAL'
                            ? 'bg-white text-primary shadow-lg border border-gray-100'
                            : 'bg-gray-50 text-primary/40 hover:bg-white'
                    }`}
                >
                    Operasional Team ({operasionalCount})
                </button>
                <button
                    onClick={() => setActiveTab('TUTOR')}
                    className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
                        activeTab === 'TUTOR'
                            ? 'bg-white text-primary shadow-lg border border-gray-100'
                            : 'bg-gray-50 text-primary/40 hover:bg-white'
                    }`}
                >
                    Tutors ({tutorCount})
                </button>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                </div>
            ) : filteredMembers.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-20 text-center">
                    <p className="text-4xl mb-4">👥</p>
                    <h4 className="text-xl font-bold text-primary mb-2">No {activeTab === 'OPERASIONAL' ? 'operasional team' : 'tutors'} yet</h4>
                    <p className="text-primary/60">Add your first team member to get started</p>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={filteredMembers.map(m => m.id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredMembers.map((member) => (
                                <SortableTeamCard
                                    key={member.id}
                                    member={member}
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

                        <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 md:p-12 animate-in fade-in zoom-in duration-300">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-bold text-primary">
                                    {editingMember ? "Edit Team Member" : "Add Team Member"}
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
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Full Name</label>
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
                                    <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Position/Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={position}
                                        onChange={(e) => setPosition(e.target.value)}
                                        disabled={isSaving}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                        placeholder="AI Instructor"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Role Type</label>
                                    <select
                                        value={roleType}
                                        onChange={(e) => setRoleType(e.target.value as any)}
                                        disabled={isSaving}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium disabled:opacity-50"
                                    >
                                        <option value="OPERASIONAL">Operasional</option>
                                        <option value="TUTOR">Tutor</option>
                                    </select>
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
                                            editingMember ? "Save Changes" : "Create Member"
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
