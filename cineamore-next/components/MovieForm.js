'use client';

export default function MovieForm({ action, defaultValues = {} }) {
    // Format Download Links for Text Area (Array -> String)
    const linksString = defaultValues.downloadLinks
        ? defaultValues.downloadLinks.map(l => `${l.label} | ${l.url}`).join('\n')
        : '';

    return (
        <form action={action} className="w-full max-w-2xl mx-auto space-y-6 bg-[var(--card-bg)] p-8 rounded-3xl border border-[var(--border)] shadow-2xl backdrop-blur-md">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-[var(--muted)] font-bold">Title</label>
                    <input
                        name="title"
                        defaultValue={defaultValues.title}
                        required
                        className="w-full h-12 px-4 rounded-xl bg-black/20 border border-[var(--border)] text-[var(--fg)] focus:border-[var(--accent)] outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-[var(--muted)] font-bold">Year</label>
                    <input
                        name="year"
                        type="number"
                        min="1888"
                        defaultValue={defaultValues.year}
                        required
                        className="w-full h-12 px-4 rounded-xl bg-black/20 border border-[var(--border)] text-[var(--fg)] focus:border-[var(--accent)] outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-[var(--muted)] font-bold">Director</label>
                    <input
                        name="director"
                        defaultValue={defaultValues.director}
                        className="w-full h-12 px-4 rounded-xl bg-black/20 border border-[var(--border)] text-[var(--fg)] focus:border-[var(--accent)] outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-[var(--muted)] font-bold">Original Title</label>
                    <input
                        name="original"
                        defaultValue={defaultValues.original}
                        className="w-full h-12 px-4 rounded-xl bg-black/20 border border-[var(--border)] text-[var(--fg)] focus:border-[var(--accent)] outline-none"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-[var(--muted)] font-bold">Letterboxd URL</label>
                <input
                    name="lb"
                    type="url"
                    defaultValue={defaultValues.lb}
                    className="w-full h-12 px-4 rounded-xl bg-black/20 border border-[var(--border)] text-[var(--fg)] focus:border-[var(--accent)] outline-none"
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-[var(--muted)] font-bold">Plot / Notes</label>
                <textarea
                    name="notes"
                    defaultValue={defaultValues.notes}
                    rows={4}
                    className="w-full p-4 rounded-xl bg-black/20 border border-[var(--border)] text-[var(--fg)] focus:border-[var(--accent)] outline-none resize-none"
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-[var(--muted)] font-bold">Download Links</label>
                <p className="text-[10px] text-[var(--muted)] mb-2">Format per line: "Label | URL"</p>
                <textarea
                    name="downloadLinks"
                    defaultValue={linksString}
                    placeholder="Download 1080p | https://example.com/file.mkv"
                    rows={4}
                    className="w-full p-4 rounded-xl bg-black/20 border border-[var(--border)] text-[var(--fg)] font-mono text-sm focus:border-[var(--accent)] outline-none resize-none"
                />
            </div>

            <div className="pt-4 flex gap-4">
                <button
                    type="submit"
                    className="flex-1 h-12 bg-[var(--accent)] hover:brightness-110 text-[var(--bg)] font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.5)]"
                >
                    {defaultValues.title ? 'Update Movie' : 'Add Movie'}
                </button>
                <a href="/admin" className="h-12 px-6 flex items-center justify-center bg-white/5 hover:bg-white/10 text-[var(--fg)] font-bold rounded-xl transition">
                    Cancel
                </a>
            </div>
        </form>
    );
}
