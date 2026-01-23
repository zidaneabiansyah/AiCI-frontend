import { Metadata } from "next";
import FasilitasClient from "./FasilitasClient";

export const metadata: Metadata = {
    title: "Fasilitas",
    description: "Fasilitas lengkap AiCi termasuk Ruangan, Modul STEAM, Media Kit, dan Robot.",
};

export default function Page() {
    return <FasilitasClient />;
}
