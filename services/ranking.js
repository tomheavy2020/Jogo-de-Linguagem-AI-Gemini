const User = require('../models/User');
const StarLog = require('../models/StarLog');

// 🔥 ADICIONA UMA ESTRELA AO USUÁRIO
async function addStar(userId, scanTarget) {
    const user = await User.findById(userId);
    if (!user) return;

    user.stars += 1;
    user.scansThisMonth += 1;
    await user.save();

    // Registra no log para o ranking
    await StarLog.create({ userId, scanTarget });
}

// 🔥 BUSCA OS TOP 10 USUÁRIOS DO MÊS
async function getMonthlyRanking() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    const ranking = await StarLog.aggregate([
        { $match: { earnedAt: { $gte: startOfMonth } } },
        { $group: { _id: "$userId", stars: { $sum: 1 } } },
        { $sort: { stars: -1 } },
        { $limit: 10 },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
        { $unwind: "$user" },
        { $project: { username: "$user.username", stars: 1 } }
    ]);
    return ranking;
}

module.exports = { addStar, getMonthlyRanking };
