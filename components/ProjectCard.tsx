"use client";

import Image from "next/image";
import Link from "next/link";
import { Project } from "@/data/projects";
import LikeButton from "./LikeButton";

interface ProjectCardProps {
    project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
    return (
        <div className="group bg-white rounded-4xl overflow-hidden border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2">
            <Link href={`/projects/${project.id}`}>
                <div className="relative aspect-16/10 overflow-hidden">
                    <Image
                        src={project.image}
                        alt={project.title}
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
                            {project.category}
                        </span>
                    </div>
                </div>
            </Link>

            <div className="p-8 space-y-4">
                <div className="flex justify-between items-start gap-4">
                    <Link href={`/projects/${project.id}`} className="flex-1">
                        <h3 className="text-xl md:text-2xl font-bold text-primary group-hover:text-secondary transition-colors leading-tight">
                            {project.title}
                        </h3>
                    </Link>
                    <div className="shrink-0">
                        <LikeButton initialLikes={project.likes} projectId={project.id} />
                    </div>
                </div>
                
                <p className="text-primary/60 text-base line-clamp-2 leading-relaxed">
                    {project.shortDescription}
                </p>

                <div className="pt-4 flex items-center justify-between border-t border-gray-50">
                    <div className="flex -space-x-3">
                        {project.team.slice(0, 3).map((member, i) => (
                            <div 
                                key={i} 
                                className="w-10 h-10 rounded-full border-2 border-white bg-primary/5 flex items-center justify-center text-xs font-bold text-primary"
                                title={member}
                            >
                                {member.split(' ').map(n => n[0]).join('')}
                            </div>
                        ))}
                        {project.team.length > 3 && (
                            <div className="w-10 h-10 rounded-full border-2 border-white bg-secondary text-white flex items-center justify-center text-xs font-bold">
                                +{project.team.length - 3}
                            </div>
                        )}
                    </div>
                    <span className="text-sm font-bold text-primary/40 uppercase tracking-widest">{project.year}</span>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
