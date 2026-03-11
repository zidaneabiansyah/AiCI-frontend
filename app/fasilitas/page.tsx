import { Metadata } from "next";
import FasilitasClient from "./FasilitasClient";
import { fetchFacilities } from "@/lib/serverFetch";

export const metadata: Metadata = {
    title: "Fasilitas",
    description: "Fasilitas lengkap AiCi termasuk Ruangan, Modul STEAM, Media Kit, dan Robot.",
};

export const revalidate = 3600;

export default async function Page() {
    const facilities = await fetchFacilities();
    return <FasilitasClient initialFacilities={facilities} />;
}
