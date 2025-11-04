import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    text: { type: String, required: true },
    hash: { type: String, required: true, index: true },
    hmac: { type: String, required: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

export const Log = mongoose.model('Log', LogSchema);


