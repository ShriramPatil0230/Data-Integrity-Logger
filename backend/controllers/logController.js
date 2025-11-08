import { Log } from '../models/Log.js';
import { AuditEvent } from '../models/AuditEvent.js';
import { computeSha256Hex, computeHmacHex, canonicalizeText } from '../utils/hashUtil.js';

export async function createLog(req, res, next) {
  try {
    // Validate user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

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
    // Get userId - Mongoose will handle ObjectId conversion automatically
    const userId = req.user.id;
    
    // Validate userId exists and is not empty
    if (!userId) {
      // eslint-disable-next-line no-console
      console.error('Missing user ID in request:', req.user);
      return res.status(401).json({ message: 'User ID not found in token' });
    }


    const hash = computeSha256Hex(canonical);
    const secret = process.env.INTEGRITY_SECRET || process.env.JWT_SECRET || 'dev-integrity-secret';
    
    if (!secret) {
      return res.status(500).json({ message: 'Server configuration error: INTEGRITY_SECRET not set' });
    }

    // Convert userId to string for HMAC computation (handle both ObjectId and string)
    const userIdString = userId.toString ? userId.toString() : String(userId);
    const hmac = computeHmacHex({ text: canonical, createdAtIso: createdAt.toISOString(), userId: userIdString, secret });

    // Create log entry - Mongoose will automatically convert userId to ObjectId if needed
    const log = await Log.create({ user: userId, text: canonical, hash, hmac, createdAt });
    
    try {
      await AuditEvent.create({ user: userId, action: 'create', entity: 'Log', entityId: log._id, success: true });
    } catch (auditErr) {
      // Log audit error but don't fail the request
      // eslint-disable-next-line no-console
      console.error('Audit event creation failed:', auditErr.message);
    }
    
    return res.status(201).json(log);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error creating log:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      userId: req.user?.id,
      textLength: req.body?.text?.length
    });
    
    // Provide more specific error messages
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors || {}).map(e => e.message).join(', ');
      return res.status(400).json({ message: `Validation error: ${errors}` });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ message: `Invalid data format: ${err.message}` });
    }
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Duplicate entry' });
    }
    // For other errors, pass to error handler
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
    try {
      await AuditEvent.create({ user: req.user.id, action: 'verify', entity: 'Log', entityId: log._id, success: verified, metadata: { verifiedSha, verifiedHmac } });
    } catch (auditErr) {
      // eslint-disable-next-line no-console
      console.error('Audit event creation failed:', auditErr.message);
    }
    return res.json(response);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error verifying log:', err);
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
    try {
      await AuditEvent.create({ user: req.user.id, action: 'delete', entity: 'Log', entityId: updated._id, success: true });
    } catch (auditErr) {
      // eslint-disable-next-line no-console
      console.error('Audit event creation failed:', auditErr.message);
    }
    return res.status(200).json({ id: updated.id, isDeleted: true, deletedAt: updated.deletedAt })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error deleting log:', err);
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
    try {
      await AuditEvent.create({ user: req.user.id, action: 'rehash', entity: 'Log', entityId: log._id, success: true });
    } catch (auditErr) {
      // eslint-disable-next-line no-console
      console.error('Audit event creation failed:', auditErr.message);
    }
    return res.json({ id: log.id, hash: log.hash, hmac: log.hmac })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error rehashing log:', err);
    return next(err)
  }
}


