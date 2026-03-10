import { Metadata } from "next";
import ProgramClient from "./ProgramClient";
import { fetchPrograms } from "@/lib/serverFetch";
import type { BackendProgram } from "@/lib/api";

export const metadata: Metadata = {
    title: "Program",
    description: "Program unggulan AiCi: Kunjungan, Workshop, dan Pelatihan.",
};

// ISR: re-fetch from backend max once per hour
export const revalidate = 3600;

export default async function Page() {
    const programs = await fetchPrograms() as BackendProgram[];
    return <ProgramClient initialPrograms={programs} />;
}
