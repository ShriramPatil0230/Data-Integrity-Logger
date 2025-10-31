import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    text: { type: String, required: true },
    hash: { type: String, required: true, index: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

export const Log = mongoose.model('Log', LogSchema);


