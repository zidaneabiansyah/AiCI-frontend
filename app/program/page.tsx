import { Metadata } from "next";
import ProgramClient from "./ProgramClient";

export const metadata: Metadata = {
    title: "Program",
    description: "Program unggulan AiCi: Kunjungan, Workshop, dan Pelatihan.",
};

export default function Page() {
    return <ProgramClient />;
}
