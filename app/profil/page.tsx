import { Metadata } from "next";
import ProfilClient from "./ProfilClient";

export const metadata: Metadata = {
    title: "Profil",
    description: "Tentang AiCi, Visi Misi, dan Tim Kami.",
};

export default function Page() {
    return <ProfilClient />;
}
