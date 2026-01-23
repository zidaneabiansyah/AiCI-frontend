import { Metadata } from "next";
import GaleriClient from "./GaleriClient";

export const metadata: Metadata = {
    title: "Galeri",
    description: "Dokumentasi kegiatan dan momen seru di AiCi.",
};

export default function Page() {
    return <GaleriClient />;
}
