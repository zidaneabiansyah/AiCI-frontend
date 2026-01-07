"use client";

import Image from "next/image";
import Link from "next/link";
import { Project } from "@/data/projects";
import { BackendProject } from "@/lib/api";
import LikeButton from "./LikeButton";

interface ProjectCardProps {
    project: Project | BackendProject;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
    // Helper to extract data regardless of source (Mock or Backend)
    const isBackend = 'likes_count' in project;
    const projectTitle = project.title;
    const projectImage = (isBackend ? (project as BackendProject).thumbnail : (project as Project).image) || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1470&auto=format&fit=crop";
    const projectCategory = isBackend ? (project as BackendProject).category_name : (project as Project).category;
    const projectLikes = (project as any).likes_count ?? (project as any).likes ?? 0;
    const projectDesc = isBackend ? (project as BackendProject).description : (project as Project).shortDescription;
    const projectYear = isBackend ? new Date((project as BackendProject).created_at).getFullYear() : (project as Project).year;
    
    // Team member logic
    const studentName = isBackend ? (project as BackendProject).student.full_name : "";
    const mockTeam = !isBackend ? (project as Project).team : [];
    const initials = (name: string) => name.split(' ').map(n => n[0]).join('');

    return (
        <div className="group bg-white rounded-4xl overflow-hidden border border-gray-100 transition-all duration-500 shadow-sm">
            <Link href={`/projects/${project.id}`}>
                <div className="relative aspect-16/10 overflow-hidden">
                    <Image
                        src={projectImage}
                        alt={projectTitle}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                        <span className="text-white font-bold text-sm bg-secondary px-4 py-2 rounded-full">
                            View Details
                        </span>
                    </div>
                    <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-md text-primary text-xs font-bold px-4 py-2 rounded-full shadow-sm uppercase tracking-wider">
                            {projectCategory}
                        </span>
                    </div>
                </div>
            </Link>

            <div className="p-8 space-y-4">
                <div className="flex justify-between items-start gap-4">
                    <Link href={`/projects/${project.id}`} className="flex-1">
                        <h3 className="text-xl md:text-2xl font-bold text-primary group-hover:text-secondary transition-colors leading-tight">
                            {projectTitle}
                        </h3>
                    </Link>
                    <div className="shrink-0">
                        <LikeButton initialLikes={projectLikes} projectId={project.id} />
                    </div>
                </div>
                
                <p className="text-primary/60 text-base line-clamp-2 leading-relaxed">
                    {projectDesc}
                </p>

                <div className="pt-4 flex items-center justify-between border-t border-gray-50">
                    <div className="flex -space-x-3">
                        {isBackend ? (
                            <div 
                                className="w-10 h-10 rounded-full border-2 border-white bg-primary/5 flex items-center justify-center text-xs font-bold text-primary"
                                title={studentName}
                            >
                                {initials(studentName)}
                            </div>
                        ) : (
                            mockTeam.slice(0, 3).map((member, i) => (
                                <div 
                                    key={i} 
                                    className="w-10 h-10 rounded-full border-2 border-white bg-primary/5 flex items-center justify-center text-xs font-bold text-primary"
                                    title={member}
                                >
                                    {initials(member)}
                                </div>
                            ))
                        )}
                        {!isBackend && mockTeam.length > 3 && (
                            <div className="w-10 h-10 rounded-full border-2 border-white bg-secondary text-white flex items-center justify-center text-xs font-bold">
                                +{mockTeam.length - 3}
                            </div>
                        )}
                    </div>
                    <span className="text-sm font-bold text-primary/40 uppercase tracking-widest">{projectYear}</span>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
