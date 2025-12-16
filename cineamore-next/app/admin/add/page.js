import MovieForm from '@/components/MovieForm';
import { createMovie } from '@/lib/actions';

export default function AddMoviePage() {
    return (
        <main className="min-h-screen p-8 max-w-7xl mx-auto bg-[var(--bg)] flex flex-col items-center">
            <div className="w-full max-w-2xl mb-8">
                <a href="/admin" className="text-[var(--muted)] hover:text-[var(--fg)] text-sm mb-4 inline-block transition">
                    ← Back to Dashboard
                </a>
                <h1 className="text-3xl font-extrabold text-[var(--fg)]">Add New Movie</h1>
                <p className="text-[var(--muted)]">Expand the Infinite Cinema library.</p>
            </div>

            <MovieForm action={createMovie} />
        </main>
    );
}
