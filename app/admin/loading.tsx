import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminLoading() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="text-primary/60 font-medium mt-4">Loading admin panel...</p>
            </div>
        </div>
    );
}
