"use client";

/**
 * MapSection Component
 * 
 * Menampilkan Google Maps embed lokasi AiCi.
 * Lokasi: FMIPA UI, Gedung Laboratorium Riset Multidisiplin, Depok
 * 
 * CATATAN:
 * - Menggunakan iframe dari Google Maps
 * - Link sudah disediakan oleh user
 */

const MapSection = () => {
    return (
        <section className="bg-white">
            {/* Full-width Map */}
            <div className="w-full h-[400px] md:h-[500px] relative">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.2042856296957!2d106.82363877571048!3d-6.367603293622534!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69ed6f766ef0f9%3A0x1ed13c8f0c344b3d!2sArtificial%20Intelligence%20Center%20Indonesia%20(AiCI)!5e0!3m2!1sen!2sid!4v1768965567384!5m2!1sen!2sid"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                />
                
                {/* Location Card Overlay */}
                <div className="absolute left-4 md:left-8 top-4 md:top-8 bg-white rounded-xl shadow-xl p-4 md:p-6 max-w-xs">
                    <h3 className="font-bold text-primary text-sm md:text-base mb-2">
                        Artificial Intelligence Center In...
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">
                        Gedung Lab. Riset Multidisiplin<br />
                        FMIPA UI Lantai 4, Pondok Cina,<br />
                        Kecamatan Beji, Kota Depok, Jawa<br />
                        Barat 16424
                    </p>
                    <div className="flex items-center gap-1 text-xs">
                        <span className="text-secondary">5.0</span>
                        <span className="text-yellow-400">★★★★★</span>
                        <span className="text-gray-400">16 reviews</span>
                    </div>
                    <a
                        href="https://goo.gl/maps/your-directions-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 text-xs mt-2 inline-block hover:underline"
                    >
                        Directions
                    </a>
                </div>
            </div>
        </section>
    );
};

export default MapSection;
