export function OrganizationSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": "AICI - Artificial Intelligence Center Indonesia",
        "alternateName": "AICI",
        "url": process.env.NEXT_PUBLIC_SITE_URL || "https://aici.id",
        "logo": `${process.env.NEXT_PUBLIC_SITE_URL || "https://aici.id"}/icon/aici-logo-otak.png`,
        "description": "Pusat pembelajaran dan riset Artificial Intelligence terkemuka di Indonesia",
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "ID",
            "addressLocality": "Jakarta",
        },
        "sameAs": [
            "https://instagram.com/aici_id",
            "https://linkedin.com/company/aici",
            "https://youtube.com/@aici",
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function CourseSchema({ course }: { course: any }) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": course.name,
        "description": course.description,
        "provider": {
            "@type": "Organization",
            "name": "AICI - Artificial Intelligence Center Indonesia",
            "url": process.env.NEXT_PUBLIC_SITE_URL || "https://aici.id",
        },
        "offers": {
            "@type": "Offer",
            "price": course.price,
            "priceCurrency": "IDR",
            "availability": "https://schema.org/InStock",
        },
        "educationalLevel": course.level,
        "timeRequired": `PT${course.duration_hours}H`,
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function ArticleSchema({ article }: { article: any }) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title,
        "description": article.excerpt,
        "image": article.thumbnail,
        "author": {
            "@type": "Person",
            "name": article.author,
        },
        "publisher": {
            "@type": "Organization",
            "name": "AICI - Artificial Intelligence Center Indonesia",
            "logo": {
                "@type": "ImageObject",
                "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://aici.id"}/icon/aici-logo-otak.png`,
            },
        },
        "datePublished": article.published_at || article.created_at,
        "dateModified": article.updated_at || article.created_at,
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
