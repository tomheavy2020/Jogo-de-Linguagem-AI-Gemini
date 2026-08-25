const mongoose = require('mongoose');

const ScanSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    alvo: String,
    resultado: String,
    data: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Scan', ScanSchema);
