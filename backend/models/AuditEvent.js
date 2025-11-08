import mongoose from 'mongoose';

const AuditEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    action: { type: String, required: true, index: true }, // create|verify|delete|rehash
    entity: { type: String, required: true }, // Log
    entityId: { type: mongoose.Schema.Types.ObjectId, index: true, required: false }, // Allow null for failed operations
    success: { type: Boolean, default: true },
    metadata: { type: Object, default: {} }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

export const AuditEvent = mongoose.model('AuditEvent', AuditEventSchema);


