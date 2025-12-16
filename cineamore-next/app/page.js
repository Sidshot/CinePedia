import dbConnect from '@/lib/mongodb';
import Movie from '@/models/Movie';
import MovieGrid from '@/components/MovieGrid';
import staticData from '@/lib/movies.json';
import Hero from '@/components/Hero';
import ActionFABs from '@/components/ActionFABs';

// Server Component
export default async function Home() {
  let serializedMovies = [];

  try {
    if (process.env.MONGODB_URI) {
      await dbConnect();
      const movies = await Movie.find({})
        .select('title year director ratingSum ratingCount __id addedAt letterboxd backdrop')
        .sort({ addedAt: -1 })
        .lean();

      serializedMovies = movies.map(doc => {
        const d = { ...doc };
        d._id = d._id.toString();
        if (d.addedAt) d.addedAt = d.addedAt.toISOString();
        return d;
      });
    } else {
      throw new Error("No Mongo URI");
    }
  } catch (error) {
    console.warn('⚠️ Database connection failed or missing. Using Static Fallback.');
    serializedMovies = staticData;
  }

  // Deduplicate by _id to prevent React key errors (Applies to both Mongo and Static data)
  const uniqueMovies = new Map();
  serializedMovies.forEach(m => {
    uniqueMovies.set(m._id || m.__id, m);
  });
  serializedMovies = Array.from(uniqueMovies.values());

  return (
    <main className="min-h-screen p-8 max-w-[1600px] mx-auto">
      {/* Client Hero handling Randomization */}
      <Hero movies={serializedMovies} />

      {/* Client Grid Handles Search/Sort */}
      <div className="flex justify-between items-center pb-4 mb-4 border-b border-[var(--border)]">
        <h2 className="text-2xl font-bold text-[var(--fg)]">Library</h2>
      </div>

      <MovieGrid initialMovies={serializedMovies} />

      {/* Floating Action Buttons */}
      <ActionFABs />
    </main>
  );
}
