export default function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
    const sizeClasses = {
        sm: "w-6 h-6 border-2",
        md: "w-10 h-10 border-3",
        lg: "w-16 h-16 border-4",
    };

    return (
        <div className="flex items-center justify-center p-8">
            <div
                className={`${sizeClasses[size]} border-primary/20 border-t-primary rounded-full animate-spin`}
                role="status"
                aria-label="Loading"
            >
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    );
}
