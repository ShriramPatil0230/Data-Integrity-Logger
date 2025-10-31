const express = require('express');
const crypto = require('crypto');
const Entry = require('../models/Entry');
const router = express.Router();

function sha256Hex(input) {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Text required' });
    const hash = sha256Hex(text);
    const entry = await new Entry({ text, hash }).save();
    res.status(201).json(entry);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

router.get('/', async (req, res) => {
  try { const entries = await Entry.find().sort({ createdAt: -1 }); res.json(entries); } 
  catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

router.post('/:id/verify', async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Not found' });
    const recomputed = sha256Hex(entry.text);
    const result = recomputed === entry.hash ? 'Verified' : 'Mismatch';
    res.json({ result, recomputed, originalHash: entry.hash });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Text required' });
    const entry = await Entry.findById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Not found' });
    entry.text = text;
    await entry.save();
    res.json(entry);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
