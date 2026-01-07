"use client";

import { useEffect, useState, useRef } from "react";
import { api, BackendProject, BackendCategory, BackendStudent } from "@/lib/api";
import Image from "next/image";

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<BackendProject[]>([]);
    const [categories, setCategories] = useState<BackendCategory[]>([]);
    const [students, setStudents] = useState<BackendStudent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    
    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [studentName, setStudentName] = useState("");
    const [demoUrl, setDemoUrl] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState("");
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append("search", searchQuery);
            
            const [projectsData, categoriesData, studentsData] = await Promise.all([
                api.projects.list(params.toString()),
                api.projects.categories(),
                api.users.listStudents()
            ]);
            
            setProjects(projectsData.results);
            setCategories(categoriesData.results);
            setStudents(studentsData.results);
        } catch (err) {
            console.error("Failed to load data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [searchQuery]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const openModal = (project?: BackendProject) => {
        if (project) {
            setIsEditing(true);
            setEditingProjectId(project.id);
            setTitle(project.title);
            setDescription(project.description);
            setCategory(project.category);
            setStudentName(project.student?.full_name || project.student_name || "");
            setDemoUrl(project.demo_url || "");
            setVideoUrl(project.video_url || "");
            setImagePreview(project.thumbnail);
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("category", category);
        formData.append("student_name", studentName);
        if (demoUrl) formData.append("demo_url", demoUrl);
        if (videoUrl) formData.append("video_url", videoUrl);
        if (imageFile) formData.append("thumbnail", imageFile);

        try {
            if (isEditing && editingProjectId) {
                await api.projects.update(editingProjectId, formData);
            } else {
                await api.projects.create(formData);
            }
            setIsModalOpen(false);
            resetForm();
            loadData();
        } catch (err) {
            alert("Failed to save project");
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setEditingProjectId(null);
        setTitle("");
        setDescription("");
        setCategory("");
        setStudentName("");
        setDemoUrl("");
        setVideoUrl("");
        setImageFile(null);
        setImagePreview("");
    };

    const handleAction = async (id: string, action: 'approve' | 'reject' | 'delete') => {
        if (action === 'delete' && !confirm("Are you sure you want to delete this project?")) return;

        try {
            if (action === 'approve') await api.projects.approve(id);
            if (action === 'reject') await api.projects.reject(id);
            if (action === 'delete') await api.projects.delete(id);
            
            // Refresh list
            loadData();
        } catch (err) {
            alert(`Failed to ${action} project`);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-primary">Submissions Management</h3>
                <button 
                    onClick={() => openModal()}
                    className="bg-primary text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-secondary transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v8m0 0v8m0-8h8m-8 0H4" />
                    </svg>
                    New Project
                </button>
            </div>

            {/* Search */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <input
                            type="text"
                            placeholder="Search projects or students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm font-medium"
                        />
                        <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Projects Table */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-10 py-6">Project Metadata</th>
                                <th className="px-10 py-6">Category</th>
                                <th className="px-10 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-10 py-16 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-8 h-8 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                                            <p className="text-primary/40 font-bold uppercase tracking-widest text-[10px] animate-pulse">Loading submission data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : projects.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-10 py-20 text-center">
                                        <div className="max-w-xs mx-auto space-y-4">
                                            <p className="text-4xl">🪴</p>
                                            <p className="text-primary font-bold">No projects found</p>
                                            <p className="text-primary/40 text-sm">Try adjusting your filters or search query.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : projects.map((project) => (
                                <tr key={project.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-6">
                                            <div className="relative w-16 h-12 rounded-xl overflow-hidden shadow-sm shrink-0 border border-gray-100">
                                                <Image src={project.thumbnail || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1470&auto=format&fit=crop"} alt="" fill className="object-cover" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-primary group-hover:text-secondary transition-colors truncate max-w-[200px]">{project.title}</span>
                                                <span className="text-xs text-primary/40 font-medium">By {project.student?.full_name || project.student_name}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <span className="text-xs font-bold text-primary/60 bg-gray-100 px-3 py-1 rounded-full">{project.category_name}</span>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => openModal(project)}
                                                className="w-10 h-10 bg-gray-50 text-primary/40 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                                                title="Edit"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={() => handleAction(project.id, 'delete')}
                                                className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                title="Delete"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="min-h-screen flex items-center justify-center p-4">
                        <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                        
                        <div className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl p-10 md:p-12 animate-in fade-in zoom-in duration-300">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-bold text-primary">{isEditing ? 'Edit Project' : 'Add New Project'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-primary/20 hover:text-red-500 hover:bg-red-50 transition-all">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Title</label>
                                            <input
                                                type="text"
                                                required
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium"
                                                placeholder="Smart Traffic Management System"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Category</label>
                                                <select
                                                    required
                                                    value={category}
                                                    onChange={(e) => setCategory(e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium"
                                                >
                                                    <option value="">Select Category</option>
                                                    {categories.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Student Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={studentName}
                                                    onChange={(e) => setStudentName(e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium"
                                                    placeholder="e.g. John Doe"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Demo URL</label>
                                            <input
                                                type="url"
                                                value={demoUrl}
                                                onChange={(e) => setDemoUrl(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium"
                                                placeholder="https://demo.example.com"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Video (Youtube) URL</label>
                                            <input
                                                type="url"
                                                value={videoUrl}
                                                onChange={(e) => setVideoUrl(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium"
                                                placeholder="https://youtube.com/..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Thumbnail</label>
                                            <div 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-full aspect-video bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group"
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
                                                        <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">Upload Photo</p>
                                                    </div>
                                                )}
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    ref={fileInputRef} 
                                                    onChange={handleFileChange} 
                                                    accept="image/*"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Description</label>
                                            <textarea
                                                required
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                rows={5}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-8 py-6 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium leading-relaxed"
                                                placeholder="Describe the project goal, technology, and outcome..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-10 border-t border-gray-50">
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 bg-gray-50 text-primary font-bold py-5 rounded-2xl hover:bg-gray-100 transition-all uppercase tracking-widest text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 bg-primary text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 hover:bg-secondary transition-all uppercase tracking-widest text-xs"
                                    >
                                        {isEditing ? 'Save Changes' : 'Create Project'}
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
