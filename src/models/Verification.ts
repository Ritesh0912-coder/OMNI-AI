import mongoose, { Schema, Document } from 'mongoose';

export interface IVerification extends Document {
    email: string;
    code: string;
    expiresAt: Date;
}

const VerificationSchema: Schema = new Schema({
    email: { type: String, required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true, expires: 0 } // Auto-delete after expiry
});

export default mongoose.models.Verification || mongoose.model<IVerification>('Verification', VerificationSchema);
