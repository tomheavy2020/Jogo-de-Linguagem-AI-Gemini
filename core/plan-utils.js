const User = require('../models/User');

const PLAN_LIMITS = {
    free: 0,      // Plano Free = 0 pesquisas
    premium: 100, // Plano Premium = 100 pesquisas/mês
    matrix: Infinity // Plano Matrix = Ilimitado
};

async function checkScanLimit(userId) {
    const user = await User.findById(userId);
    if (!user) return { allowed: false, reason: "Usuário não encontrado" };

    const limit = PLAN_LIMITS[user.plan] || 0;
    if (user.scansThisMonth >= limit) {
        return {
            allowed: false,
            reason: `Limite de ${limit === Infinity ? 'ilimitado' : limit} pesquisas atingido.`
        };
    }
    return { allowed: true };
}

async function getUserPlan(userId) {
    const user = await User.findById(userId);
    if (!user) return 'free';
    return user.plan;
}

module.exports = { checkScanLimit, getUserPlan, PLAN_LIMITS };
