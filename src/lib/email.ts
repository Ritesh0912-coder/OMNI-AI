import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendWelcomeEmail(email: string, name: string) {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Welcome to SYNAPSE AI',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px; border-radius: 10px;">
                    <h1 style="color: #00ff66;">Welcome, ${name}</h1>
                    <p>Access Granted. You have successfully initialized your connection to SYNAPSE AI.</p>
                    <p>We are ready to assist you in your strategic intelligence operations.</p>
                    <br/>
                    <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} SYNAPSE AI Intelligence</p>
                </div>
            `,
        });
        console.log(`[EMAIL] Welcome email sent to ${email}`);
    } catch (error) {
        console.error(`[EMAIL] Failed to send welcome email to ${email}:`, error);
    }
}

export async function sendLoginNotification(email: string, name: string, provider: string) {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'New Login Detected | SYNAPSE AI',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #00ff66;">New Login Detected</h2>
                    <p>Hello ${name},</p>
                    <p>We detected a new login to your SYNAPSE AI account via <strong>${provider}</strong>.</p>
                    <p>Time: ${new Date().toLocaleString()}</p>
                    <p>If this was you, no action is required.</p>
                    <br/>
                    <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} SYNAPSE AI Intelligence</p>
                </div>
            `,
        });
        console.log(`[EMAIL] Login notification sent to ${email}`);
    } catch (error) {
        console.error(`[EMAIL] Failed to send login notification to ${email}:`, error);
    }
}

export async function sendVerificationCode(email: string, code: string) {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Verification Code | SYNAPSE AI',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #00ff66;">Identity Verification</h2>
                    <p>Use the following code to verify your email address:</p>
                    <h1 style="font-size: 32px; letter-spacing: 5px; color: #fff; border: 1px solid #333; padding: 10px; display: inline-block;">${code}</h1>
                    <p>This code will expire in 10 minutes.</p>
                    <br/>
                    <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} SYNAPSE AI Intelligence</p>
                </div>
            `,
        });
        console.log(`[EMAIL] Verification code sent to ${email}`);
    } catch (error) {
        console.error(`[EMAIL] Failed to send verification code to ${email}:`, error);
        throw error; // Re-throw to handle in API
    }
}
