"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import BackToTop from "@/components/BackToTop";
import { api, BackendProject } from "@/lib/api";

export default function ProjectsPage() {
    const [projects, setProjects] = useState<BackendProject[]>([]);
    const [categories, setCategories] = useState<string[]>(["All"]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [projectsData, categoriesData] = await Promise.all([
                    api.projects.list(),
                    api.projects.categories(),
                ]);
                setProjects(projectsData.results);
                setCategories(["All", ...categoriesData.results.map((c: any) => c.name)]);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredProjects = projects.filter((project) => {
        const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || project.category_name === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <main className="min-h-screen bg-gray-50/30">
            <Navbar />

            {/* Header Section */}
            <section className="pt-40 pb-20 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold text-primary mb-6 tracking-tight">
                        Our <span className="text-secondary">Projects</span>
                    </h1>
                    <p className="text-lg md:text-xl text-primary/60 max-w-2xl mx-auto leading-relaxed">
                        Explore the innovative solutions created by our students using cutting-edge technologies.
                    </p>
                </div>
            </section>

            {/* Filter & Search Section */}
            <section className="py-12 bg-white border-b border-gray-50">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    {/* Categories */}
                    <div className="flex flex-wrap justify-center gap-3">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${selectedCategory === category
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "bg-primary/5 text-primary hover:bg-primary/10"
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-primary/5 border-none rounded-full px-6 py-3 text-primary placeholder:text-primary/30 focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                        />
                        <svg
                            className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </section>

            {/* Projects Grid */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="bg-white rounded-4xl h-96 animate-pulse border border-gray-100" />
                            ))}
                        </div>
                    ) : filteredProjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {filteredProjects.map((project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 space-y-6">
                            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-10 h-10 text-primary/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-primary">No projects found</h3>
                            <p className="text-primary/60">Try adjusting your filters or search query.</p>
                            <button
                                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                                className="text-secondary font-bold hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
            <BackToTop />
        </main>
    );
}
