export default function Loading() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-[var(--accent)] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                </div>
                <div className="text-white font-medium tracking-wider animate-pulse">INITIALIZING...</div>
            </div>
        </div>
    );
}
