// core/arena-engine.js (v2 — suporte a N jogadores por sala)
const ROOM_MAX_LIMIT = 6;
const ROUND_DURATION_MS = 3 * 60_000;

class ArenaRoom {
  constructor(code, maxPlayers) {
    this.code = code;
    this.maxPlayers = Math.min(maxPlayers, ROOM_MAX_LIMIT);
    this.players = new Map();
    this.targetIp = null;
    this.status = 'waiting';
    this.timer = null;
  }

  addPlayer(userId, username, socket) {
    if (this.status !== 'waiting') return { ok: false, reason: 'Sala já iniciou.' };
    if (this.players.size >= this.maxPlayers) return { ok: false, reason: 'Sala cheia.' };
    this.players.set(userId, { username, socket, points: 0, connected: true });
    return { ok: true };
  }

  removePlayer(userId) {
    const p = this.players.get(userId);
    if (p) p.connected = false;
  }

  broadcast(message) {
    for (const p of this.players.values()) {
      if (p.connected && p.socket?.readyState === 1) {
        p.socket.send(`TERM_RESULT::${message}`);
      }
    }
  }

  start(targetIpGenerator) {
    if (this.players.size < 2) return { ok: false, reason: 'Precisa de pelo menos 2 jogadores.' };
    this.status = 'active';
    this.targetIp = targetIpGenerator();
    this.broadcast('ARENA INICIADA');
    this.broadcast(`ALVO DEFINIDO: ${this.targetIp}`);

    this.timer = setTimeout(() => this.finish('tempo esgotado'), ROUND_DURATION_MS);
    return { ok: true };
  }

  addPoints(userId, points) {
    const p = this.players.get(userId);
    if (!p || this.status !== 'active') return;
    p.points += points;
  }

  finish(reason = 'pontuação máxima') {
    if (this.status === 'finished') return;
    this.status = 'finished';
    if (this.timer) clearTimeout(this.timer);

    const ranking = [...this.players.entries()]
      .map(([id, p]) => ({ id, username: p.username, points: p.points }))
      .sort((a, b) => b.points - a.points);

    const winner = ranking[0];
    const lines = ranking.map((r, i) => `${i + 1}º ${r.username} — ${r.points} pts`);

    this.broadcast(`🏆 VENCEDOR: ${winner?.username ?? 'Ninguém'}\n${lines.join('\n')}\n(${reason})`);
    return ranking;
  }

  isEmpty() {
    return [...this.players.values()].every((p) => !p.connected);
  }
}

class ArenaManager {
  constructor() {
    this.rooms = new Map();
  }

  getOrCreateRoom(code, maxPlayers) {
    let room = this.rooms.get(code);
    if (!room) {
      room = new ArenaRoom(code, maxPlayers);
      this.rooms.set(code, room);
    }
    return room;
  }

  join(code, userId, username, socket, maxPlayers = 2) {
    const room = this.getOrCreateRoom(code, maxPlayers);
    const result = room.addPlayer(userId, username, socket);

    if (result.ok && room.players.size === room.maxPlayers) {
      room.start(() => `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`);
    } else if (result.ok) {
      room.broadcast(`Aguardando jogadores... (${room.players.size}/${room.maxPlayers})`);
    }
    return result;
  }

  leave(code, userId) {
    const room = this.rooms.get(code);
    if (!room) return;
    room.removePlayer(userId);
    if (room.isEmpty()) {
      if (room.timer) clearTimeout(room.timer);
      this.rooms.delete(code);
    }
  }
}

module.exports = { ArenaManager };
