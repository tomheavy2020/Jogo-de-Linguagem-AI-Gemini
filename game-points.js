// Sistema unificado de pontos Matrix OS
const MatrixPoints = {
  KEY: 'matrixUser',

  // Inicializar usuário
  init() {
    let user = this.getUser();
    if (!user.name) {
      user = {
        name: 'USUÁRIO MATRIX',
        xp: 0,
        level: 1,
        chess: 0,
        logic: 0,
        reflex: 0,
        streak: 0,
        gender: 'male',
        clothing: 'casual',
        avatar: '👾',
        photo: null
      };
      this.saveUser(user);
    }
    return user;
  },

  // Obter dados do usuário
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || {};
    } catch(e) {
      return {};
    }
  },

  // Salvar dados
  saveUser(user) {
    localStorage.setItem(this.KEY, JSON.stringify(user));
    this.updateRanking(user);
  },

  // Adicionar pontos
  addXP(points, gameType = null) {
    const user = this.getUser();
    user.xp = (user.xp || 0) + points;
    user.level = Math.floor(user.xp / 1000) + 1;

    // Atualizar estatísticas específicas do jogo
    if (gameType === 'chess') user.chess = (user.chess || 0) + 1;
    if (gameType === 'logic') user.logic = (user.logic || 0) + 1;
    if (gameType === 'reflex') user.reflex = (user.reflex || 0) + 1;
    if (gameType === 'streak') user.streak = (user.streak || 0) + 1;

    this.saveUser(user);
    return user;
  },

  // Atualizar ranking mundial
  updateRanking(user) {
    fetch('/api/ranking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: user.name,
        xp: user.xp,
        level: user.level,
        chess: user.chess,
        logic: user.logic,
        reflex: user.reflex,
        streak: user.streak
      })
    }).catch(err => console.log('Ranking offline - dados salvos localmente'));
  }
};

// Inicializar
MatrixPoints.init();
