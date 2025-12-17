import dbConnect from '@/lib/mongodb';
import Report from '@/models/Report';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

export async function GET(req) {
    // 1. Auth Check
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    const session = sessionCookie ? await decrypt(sessionCookie) : null;

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const reports = await Report.find({}).sort({ createdAt: -1 }).lean();

        // 2. Convert to CSV
        const csvHeader = 'Name,Message,Movie,Resolved,Date\n';
        const csvRows = reports.map(r => {
            const date = new Date(r.createdAt).toISOString();
            const name = (r.name || 'Anonymous').replace(/,/g, ' ');
            const msg = (r.message || '').replace(/,/g, ' ').replace(/\n/g, ' ');
            const movie = (r.movieTitle || 'General').replace(/,/g, ' ');
            const status = r.resolved ? 'Fixed' : 'Open';
            return `${name},${msg},${movie},${status},${date}`;
        }).join('\n');

        const csvContent = csvHeader + csvRows;

        // 3. Return CSV File
        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="reports-${new Date().toISOString().split('T')[0]}.csv"`
            }
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
