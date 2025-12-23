import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Movie from '@/models/Movie';

/**
 * Export quarantined films for AI title fixing
 */
export async function GET(request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();

        const quarantined = await Movie.find({
            'visibility.state': 'quarantined'
        })
            .select('title year director _id')
            .sort({ title: 1 })
            .lean();

        // Format for AI processing
        const exportData = {
            instructions: {
                task: "Fix movie titles",
                guidelines: [
                    "Clean up formatting (remove extra spaces, fix capitalization)",
                    "Remove year from title if it's incorrectly included",
                    "Fix common typos and misspellings",
                    "Ensure proper title case (capitalize first letter of major words)",
                    "Remove file artifacts like '.', '_', or quality tags",
                    "If year seems wrong or missing, try to infer the correct year",
                    "Keep original language titles if they're correct"
                ],
                output_format: "Return the EXACT same JSON structure with 'fixedTitle' and 'fixedYear' fields filled in"
            },
            totalFilms: quarantined.length,
            films: quarantined.map(f => ({
                id: f._id.toString(),
                originalTitle: f.title,
                originalYear: f.year,
                director: f.director,
                // AI should fill these:
                fixedTitle: "",
                fixedYear: null,
                notes: "" // Optional: AI can add notes about changes
            }))
        };

        // Set headers for file download
        return new NextResponse(JSON.stringify(exportData, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': 'attachment; filename="quarantined_films_to_fix.json"'
            }
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Import AI-fixed film titles
 */
export async function POST(request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { films, unquarantineAll } = await request.json();

        if (!films || !Array.isArray(films)) {
            return NextResponse.json({
                error: 'Invalid format. Expected { films: [...] }'
            }, { status: 400 });
        }

        await dbConnect();

        let updated = 0;
        let errors = [];

        for (const film of films) {
            try {
                // Skip if AI didn't fill in fixedTitle
                if (!film.fixedTitle || film.fixedTitle.trim() === '') {
                    continue;
                }

                const update = {
                    title: film.fixedTitle.trim(),
                };

                if (film.fixedYear !== null && film.fixedYear !== undefined) {
                    update.year = film.fixedYear;
                }

                // Optionally unquarantine after fixing
                if (unquarantineAll) {
                    update['visibility.state'] = 'visible';
                    update['visibility.reason'] = null;
                    update['visibility.updatedAt'] = new Date();
                }

                await Movie.findByIdAndUpdate(film.id, { $set: update });
                updated++;
            } catch (err) {
                errors.push({
                    id: film.id,
                    originalTitle: film.originalTitle,
                    error: err.message
                });
            }
        }

        return NextResponse.json({
            success: true,
            updated,
            total: films.length,
            errors: errors.length > 0 ? errors : undefined,
            message: `Successfully updated ${updated} out of ${films.length} films`
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
