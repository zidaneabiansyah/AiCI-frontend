export default function SkeletonCard() {
    return (
        <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-8 animate-pulse">
            <div className="h-48 bg-gray-200 rounded-2xl mb-6"></div>
            <div className="h-6 bg-gray-200 rounded-xl mb-4 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded-lg mb-2"></div>
            <div className="h-4 bg-gray-200 rounded-lg mb-2 w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-2/3"></div>
        </div>
    );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-6">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}

export function SkeletonTable() {
    return (
        <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-10 animate-pulse">
            <div className="h-8 bg-gray-200 rounded-xl mb-6 w-1/4"></div>
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                        <div className="h-12 bg-gray-200 rounded-xl flex-1"></div>
                        <div className="h-12 bg-gray-200 rounded-xl flex-1"></div>
                        <div className="h-12 bg-gray-200 rounded-xl flex-1"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
