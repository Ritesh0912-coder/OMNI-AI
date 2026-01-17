import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Verification from '@/models/Verification';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const { name, email, password, code } = await req.json();

        if (!name || !email || !password || !code) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        // Verify OTP
        const verification = await Verification.findOne({ email, code });
        if (!verification) {
            return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // Delete verification record
        await Verification.deleteOne({ email });

        // Send welcome email
        await sendWelcomeEmail(email, name);

        return NextResponse.json(
            { message: 'User created successfully', user: { name: newUser.name, email: newUser.email } },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error registering user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
