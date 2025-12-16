import dbConnect from '@/lib/mongodb';
import Request from '@/models/Request';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();

        if (!body.title) {
            return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
        }

        const request = await Request.create(body);
        return NextResponse.json({ success: true, data: request }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
