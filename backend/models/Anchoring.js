import mongoose from 'mongoose'

const AnchoringSchema = new mongoose.Schema(
  {
    date: { type: String, index: true, required: true }, // YYYY-MM-DD
    root: { type: String, required: true },
    count: { type: Number, required: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
)

AnchoringSchema.index({ date: 1 }, { unique: true })

export const Anchoring = mongoose.model('Anchoring', AnchoringSchema)


