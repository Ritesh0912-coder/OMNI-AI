import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Verification from '@/models/Verification';
import User from '@/models/User';
import { sendVerificationCode } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'Email already registered. Please login.' }, { status: 400 });
        }

        // Generate 6-digit code
        const code = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Upsert verification record
        await Verification.findOneAndUpdate(
            { email },
            { code, expiresAt },
            { upsert: true, new: true }
        );

        // Send email
        await sendVerificationCode(email, code);

        return NextResponse.json({ message: 'Verification code sent' }, { status: 200 });
    } catch (error) {
        console.error('Error sending verification code:', error);
        return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 });
    }
}
