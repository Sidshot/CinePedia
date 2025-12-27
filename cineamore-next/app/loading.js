export default function Loading() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-6 pointer-events-none">
                {/* Brand Ring Animation */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-[var(--accent)] opacity-20 blur-xl animate-pulse"></div>
                    <div className="absolute inset-0 border-2 border-white/10 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-t-[var(--accent)] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin duration-1000"></div>
                    <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse shadow-[0_0_10px_var(--accent)]"></div>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <div className="text-white text-xs font-mono tracking-[0.3em] font-bold">INITIALIZING</div>
                    <div className="w-8 h-[1px] bg-white/20"></div>
                </div>
            </div>
        </div>
    );
}
