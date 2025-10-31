import { Log } from '../models/Log.js';
import { computeSha256Hex } from '../utils/hashUtil.js';

export async function createLog(req, res, next) {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ message: 'Text is required' });
    }
    const hash = computeSha256Hex(text);
    const log = await Log.create({ user: req.user.id, text, hash });
    return res.status(201).json(log);
  } catch (err) {
    return next(err);
  }
}

export async function listLogs(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page || 1))
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)))
    const skip = (page - 1) * limit
    const q = (req.query.q || '').trim()
    const filter = { user: req.user.id }
    if (q) {
      filter.text = { $regex: q, $options: 'i' }
    }
    const [items, total] = await Promise.all([
      Log.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Log.countDocuments(filter)
    ])
    return res.json({ items, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (err) {
    return next(err);
  }
}

export async function verifyLog(req, res, next) {
  try {
    const { id } = req.params;
    const log = await Log.findOne({ _id: id, user: req.user.id });
    if (!log) {
      return res.status(404).json({ message: 'Not found' });
    }
    const recomputed = computeSha256Hex(log.text);
    const verified = recomputed === log.hash;
    return res.json({ id: log.id, verified, currentHash: recomputed, originalHash: log.hash });
  } catch (err) {
    return next(err);
  }
}

export async function deleteLog(req, res, next) {
  try {
    const { id } = req.params
    const deleted = await Log.findOneAndDelete({ _id: id, user: req.user.id })
    if (!deleted) return res.status(404).json({ message: 'Not found' })
    return res.status(204).end()
  } catch (err) {
    return next(err)
  }
}


