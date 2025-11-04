import { Log } from '../models/Log.js'
import { Anchoring } from '../models/Anchoring.js'
import { buildMerkleRoot, buildMerkleProof } from '../utils/merkleUtil.js'

function ymd(d) { return d.toISOString().slice(0, 10) }

export async function anchorDay(req, res, next) {
  try {
    const date = req.body?.date || ymd(new Date())
    const start = new Date(`${date}T00:00:00.000Z`)
    const end = new Date(`${date}T23:59:59.999Z`)
    const logs = await Log.find({ createdAt: { $gte: start, $lte: end }, isDeleted: { $ne: true } }).select('_id hash').sort({ _id: 1 })
    const leaves = logs.map((l) => l.hash)
    if (leaves.length === 0) {
      return res.status(400).json({ message: 'No logs to anchor for this date' })
    }
    const root = buildMerkleRoot(leaves)
    const doc = await Anchoring.findOneAndUpdate(
      { date },
      { $set: { root, count: leaves.length } },
      { upsert: true, new: true }
    )
    return res.json(doc)
  } catch (err) {
    return next(err)
  }
}

export async function getProof(req, res, next) {
  try {
    const { id } = req.params
    const log = await Log.findById(id).select('_id hash createdAt isDeleted')
    if (!log || log.isDeleted) return res.status(404).json({ message: 'Not found' })
    const date = ymd(new Date(log.createdAt))
    const start = new Date(`${date}T00:00:00.000Z`)
    const end = new Date(`${date}T23:59:59.999Z`)
    const logs = await Log.find({ createdAt: { $gte: start, $lte: end }, isDeleted: { $ne: true } }).select('_id hash').sort({ _id: 1 })
    const leaves = logs.map((l) => l.hash)
    const index = logs.findIndex((l) => String(l._id) === String(log._id))
    if (index === -1) return res.status(404).json({ message: 'Leaf not found in day set' })
    const root = buildMerkleRoot(leaves)
    const proof = buildMerkleProof(leaves, index)
    return res.json({ date, root, proof, leaf: log.hash, index, count: leaves.length })
  } catch (err) {
    return next(err)
  }
}


