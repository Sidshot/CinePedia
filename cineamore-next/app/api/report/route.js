import dbConnect from '@/lib/mongodb';
import Report from '@/models/Report';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();

        if (!body.message) {
            return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
        }

        const report = await Report.create(body);
        return NextResponse.json({ success: true, data: report }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
