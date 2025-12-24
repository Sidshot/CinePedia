import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Movie from '@/models/Movie';

/**
 * Debug endpoint to check a single movie's visibility field
 */
export async function GET(request) {
    try {
        const { isAdmin } = await import('@/lib/auth');
        if (!await isAdmin()) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        await dbConnect();

        // Get one random movie
        const movie = await Movie.findOne({}).lean();

        if (!movie) {
            return NextResponse.json({ error: 'No movies found' }, { status: 404 });
        }

        return NextResponse.json({
            title: movie.title,
            _id: movie._id,
            visibility: movie.visibility,
            hasVisibility: !!movie.visibility,
            hasState: !!movie.visibility?.state,
            stateValue: movie.visibility?.state,
            fullMovie: movie
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
