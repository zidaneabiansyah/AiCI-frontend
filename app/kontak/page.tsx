import { Metadata } from "next";
import KontakClient from "./KontakClient";

export const metadata: Metadata = {
    title: "Hubungi Kami",
    description: "Hubungi AiCi untuk kolaborasi dan informasi lebih lanjut.",
};

export default function Page() {
    return <KontakClient />;
}
