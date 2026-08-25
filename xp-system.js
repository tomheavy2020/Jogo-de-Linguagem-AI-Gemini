// ============================================================
//  MATRIX WORLD - SISTEMA DE XP E NÍVEIS
// ============================================================

const XP_CONFIG = {
    actions: {
        open_app: 5,
        play_game: 15,
        complete_module: 25,
        daily_login: 10,
        share_app: 20,
        rate_app: 30,
        add_favorite: 10
    },
    xpPerLevel: (level) => Math.floor(100 * Math.pow(1.5, level - 1)),
    titles: [
        { minLevel: 1, title: 'Recruta' },
        { minLevel: 2, title: 'Operador' },
        { minLevel: 5, title: 'Analista' },
        { minLevel: 10, title: 'Especialista' },
        { minLevel: 20, title: 'Arquiteto' },
        { minLevel: 35, title: 'Mestre' },
        { minLevel: 50, title: 'Lenda' },
        { minLevel: 75, title: 'Imortal' },
        { minLevel: 100, title: 'MATRIX' }
    ],
    badges: [
        { id: 'first_step', name: 'Primeiro Passo', icon: '🚀', condition: (u) => u.totalActions >= 1 },
        { id: 'explorer', name: 'Explorador', icon: '🌍', condition: (u) => u.modulesUsed >= 5 },
        { id: 'dedicated', name: 'Dedicado', icon: '⭐', condition: (u) => u.daysActive >= 7 },
        { id: 'master', name: 'Mestre', icon: '🏆', condition: (u) => u.level >= 10 },
        { id: 'social', name: 'Social', icon: '👥', condition: (u) => u.shares >= 5 },
        { id: 'gamer', name: 'Gamer', icon: '🎮', condition: (u) => u.gamesPlayed >= 20 },
        { id: 'collector', name: 'Colecionador', icon: '📦', condition: (u) => u.modulesUsed >= 15 }
    ]
};

class MatrixXP {
    constructor() { this.load(); }
    load() {
        const saved = localStorage.getItem('matrix_xp');
        if (saved) { this.data = JSON.parse(saved); }
        else {
            this.data = {
                xp: 0, level: 1, totalActions: 0, modulesUsed: 0,
                daysActive: 1, shares: 0, gamesPlayed: 0,
                lastLogin: new Date().toDateString(),
                badges: [], favorites: []
            };
            this.save();
        }
    }
    save() {
        localStorage.setItem('matrix_xp', JSON.stringify(this.data));
        this.updateUI();
    }
    addXP(action, amount = null) {
        const xpAmount = amount || XP_CONFIG.actions[action] || 5;
        this.data.xp += xpAmount;
        this.data.totalActions += 1;
        this.checkLevelUp();
        this.save();
        return this.data.xp;
    }
    checkLevelUp() {
        const needed = XP_CONFIG.xpPerLevel(this.data.level);
        if (this.data.xp >= needed) {
            this.data.level += 1;
            this.data.xp -= needed;
            if (window.showToast) window.showToast(`⬡ NÍVEL ${this.data.level} DESBLOQUEADO!`);
            this.checkBadges();
            return true;
        }
        return false;
    }
    checkBadges() {
        const earned = [];
        XP_CONFIG.badges.forEach(badge => {
            if (!this.data.badges.includes(badge.id) && badge.condition(this.data)) {
                this.data.badges.push(badge.id);
                earned.push(badge);
                if (window.showToast) window.showToast(`🏅 BADGE DESBLOQUEADA: ${badge.name}`);
            }
        });
        return earned;
    }
    useModule(moduleId) {
        this.data.modulesUsed += 1;
        if (!this.data.favorites.includes(moduleId)) this.data.favorites.push(moduleId);
        this.addXP('open_app', 5);
        this.save();
    }
    playGame() {
        this.data.gamesPlayed += 1;
        this.addXP('play_game', 15);
        this.save();
    }
    share() {
        this.data.shares += 1;
        this.addXP('share_app', 20);
        this.save();
    }
    dailyLogin() {
        const today = new Date().toDateString();
        if (this.data.lastLogin !== today) {
            this.data.daysActive += 1;
            this.data.lastLogin = today;
            this.addXP('daily_login', 10);
            this.save();
        }
    }
    getUserData() {
        const needed = XP_CONFIG.xpPerLevel(this.data.level);
        const progress = Math.round((this.data.xp / needed) * 100);
        let title = 'Recruta';
        for (let i = XP_CONFIG.titles.length - 1; i >= 0; i--) {
            if (this.data.level >= XP_CONFIG.titles[i].minLevel) {
                title = XP_CONFIG.titles[i].title;
                break;
            }
        }
        return {
            xp: this.data.xp, level: this.data.level,
            xpNext: needed, progress: Math.min(progress, 100),
            title: title, badges: this.data.badges,
            modulesUsed: this.data.modulesUsed,
            totalActions: this.data.totalActions,
            daysActive: this.data.daysActive,
            favorites: this.data.favorites
        };
    }
    updateUI() {
        const data = this.getUserData();
        const els = {
            xpBar: document.getElementById('xpBar'),
            xpText: document.getElementById('xpText'),
            nextLevelText: document.getElementById('nextLevelText'),
            userLevel: document.getElementById('userLevel'),
            modulesCount: document.getElementById('modulesCount'),
            badgesCount: document.getElementById('badgesCount')
        };
        if (els.xpBar) els.xpBar.style.width = `${data.progress}%`;
        if (els.xpText) els.xpText.textContent = `${data.xp} XP`;
        if (els.nextLevelText) els.nextLevelText.textContent = `PRÓXIMO: ${data.xpNext} XP`;
        if (els.userLevel) els.userLevel.textContent = `NÍVEL ${data.level} · ${data.title}`;
        if (els.modulesCount) els.modulesCount.textContent = data.modulesUsed;
        if (els.badgesCount) els.badgesCount.textContent = data.badges.length;
        // Atualizar badges
        const container = document.getElementById('badgesContainer');
        if (container) {
            const allBadges = XP_CONFIG.badges;
            container.innerHTML = allBadges.map(b => {
                const unlocked = data.badges.includes(b.id);
                return `<span class="badge-item${unlocked ? '' : ' locked'}" title="${b.name}">${unlocked ? b.icon : '❓'}</span>`;
            }).join('');
        }
    }
}

const matrixXP = new MatrixXP();
matrixXP.dailyLogin();
window.matrixXP = matrixXP;
window.XP_CONFIG = XP_CONFIG;
console.log('⬡ MATRIX XP SYSTEM ATIVADO');
console.log(`📊 Nível: ${matrixXP.data.level} | XP: ${matrixXP.data.xp} | Badges: ${matrixXP.data.badges.length}`);
