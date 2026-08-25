const mongoose = require('mongoose');

// 🔥 LOG DE ESTRELAS (Para calcular o ranking do mês)
const StarLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    scanTarget: String,
    earnedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StarLog', StarLogSchema);
