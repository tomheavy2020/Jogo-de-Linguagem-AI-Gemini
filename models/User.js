const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
    name: { type: String, required: true },
    maxScansPerDay: { type: Number, required: true },
    maxArenaPlayers: { type: Number, default: 2 },
    hasGames: { type: Boolean, default: false },
    hasOSINT: { type: Boolean, default: false },
    hasSatellite: { type: Boolean, default: false }
});

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    plan: {
        type: String,
        enum: ['free', 'premium', 'matrix'],
        default: 'free'
    },
    isPremium: { type: Boolean, default: false },
    activationCode: { type: String, default: null },
    stars: { type: Number, default: 0 },
    scansToday: { type: Number, default: 0 },
    lastScanDate: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

// 🔥 DEFINIÇÃO DOS PLANOS
const PLANS = {
    free: { name: 'Free', maxScansPerDay: 5, maxArenaPlayers: 2, hasGames: false, hasOSINT: false, hasSatellite: false },
    premium: { name: 'Premium', maxScansPerDay: 100, maxArenaPlayers: 4, hasGames: true, hasOSINT: true, hasSatellite: true },
    matrix: { name: 'Matrix', maxScansPerDay: Infinity, maxArenaPlayers: 6, hasGames: true, hasOSINT: true, hasSatellite: true }
};

// 🔥 MÉTODO PARA VERIFICAR SE PODE EXECUTAR UM COMANDO
UserSchema.methods.canPerformScan = function() {
    const planLimits = PLANS[this.plan];
    // Reseta o contador se for um novo dia
    const today = new Date();
    if (this.lastScanDate.toDateString() !== today.toDateString()) {
        this.scansToday = 0;
        this.lastScanDate = today;
    }
    return this.scansToday < planLimits.maxScansPerDay;
};

UserSchema.methods.incrementScan = function() {
    this.scansToday += 1;
    return this.save();
};

UserSchema.methods.getPlanLimits = function() {
    return PLANS[this.plan] || PLANS.free;
};

module.exports = mongoose.model('User', UserSchema);
