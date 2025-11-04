import { Log } from '../models/Log.js';
import { AuditEvent } from '../models/AuditEvent.js';
import { computeSha256Hex, computeHmacHex, canonicalizeText } from '../utils/hashUtil.js';

export async function createLog(req, res, next) {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ message: 'Text is required' });
    }
    const MAX_LEN = Number(process.env.MAX_TEXT_LENGTH || 65536);
    const canonical = canonicalizeText(text);
    if (Buffer.byteLength(canonical, 'utf8') > MAX_LEN) {
      return res.status(413).json({ message: `Text exceeds max size of ${MAX_LEN} bytes` });
    }

    const createdAt = new Date();
    const userId = req.user.id;
    const hash = computeSha256Hex(canonical);
    const secret = process.env.INTEGRITY_SECRET;

    const hmac = computeHmacHex({ text: canonical, createdAtIso: createdAt.toISOString(), userId, secret });

    const log = await Log.create({ user: userId, text: canonical, hash, hmac, createdAt });
    await AuditEvent.create({ user: userId, action: 'create', entity: 'Log', entityId: log._id, success: true });
    return res.status(201).json(log);
  } catch (err) {
    try { await AuditEvent.create({ user: req.user?.id, action: 'create', entity: 'Log', entityId: null, success: false, metadata: { error: err.message } }); } catch {}
    return next(err);
  }
}

export async function listLogs(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page || 1))
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)))
    const skip = (page - 1) * limit
    const q = (req.query.q || '').trim()
    const filter = { user: req.user.id, isDeleted: { $ne: true } }
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
    const secret = process.env.INTEGRITY_SECRET || process.env.JWT_SECRET || 'dev-secret';
    const recomputedHmac = computeHmacHex({
      text: log.text,
      createdAtIso: new Date(log.createdAt).toISOString(),
      userId: String(log.user),
      secret
    });
    const verifiedSha = recomputed === log.hash;
    const verifiedHmac = recomputedHmac === log.hmac;
    const verified = verifiedSha && verifiedHmac;
    const response = {
      id: log.id,
      verified,
      verifiedSha,
      verifiedHmac,
      currentHash: recomputed,
      originalHash: log.hash
    };
    await AuditEvent.create({ user: req.user.id, action: 'verify', entity: 'Log', entityId: log._id, success: verified, metadata: { verifiedSha, verifiedHmac } });
    return res.json(response);
  } catch (err) {
    try { await AuditEvent.create({ user: req.user?.id, action: 'verify', entity: 'Log', entityId: req.params?.id, success: false, metadata: { error: err.message } }); } catch {}
    return next(err);
  }
}

export async function deleteLog(req, res, next) {
  try {
    const { id } = req.params
    const updated = await Log.findOneAndUpdate(
      { _id: id, user: req.user.id, isDeleted: { $ne: true } },
      { $set: { isDeleted: true, deletedAt: new Date(), deletedBy: req.user.id } },
      { new: true }
    )
    if (!updated) return res.status(404).json({ message: 'Not found' })
    await AuditEvent.create({ user: req.user.id, action: 'delete', entity: 'Log', entityId: updated._id, success: true })
    return res.status(200).json({ id: updated.id, isDeleted: true, deletedAt: updated.deletedAt })
  } catch (err) {
    try { await AuditEvent.create({ user: req.user?.id, action: 'delete', entity: 'Log', entityId: req.params?.id, success: false, metadata: { error: err.message } }); } catch {}
    return next(err)
  }
}

export async function rehashLog(req, res, next) {
  try {
    const { id } = req.params
    const log = await Log.findOne({ _id: id, user: req.user.id })
    if (!log) return res.status(404).json({ message: 'Not found' })

    const canonical = canonicalizeText(log.text)
    const userId = String(log.user)
    const createdAtIso = new Date(log.createdAt).toISOString()
    const secret = process.env.INTEGRITY_SECRET || process.env.JWT_SECRET || 'dev-secret'
    const newHash = computeSha256Hex(canonical)
    const newHmac = computeHmacHex({ text: canonical, createdAtIso, userId, secret })

    log.text = canonical
    log.hash = newHash
    log.hmac = newHmac
    await log.save()
    await AuditEvent.create({ user: req.user.id, action: 'rehash', entity: 'Log', entityId: log._id, success: true })
    return res.json({ id: log.id, hash: log.hash, hmac: log.hmac })
  } catch (err) {
    try { await AuditEvent.create({ user: req.user?.id, action: 'rehash', entity: 'Log', entityId: req.params?.id, success: false, metadata: { error: err.message } }); } catch {}
    return next(err)
  }
}


