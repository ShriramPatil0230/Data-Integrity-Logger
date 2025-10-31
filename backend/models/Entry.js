const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema({
  text: { type: String, required: true },
  hash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Entry', EntrySchema);
