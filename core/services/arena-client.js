class ArenaClient {
  constructor() {
    this.socket = window.SocketService;
    this.handlers = [];
    this.roomId = null;
    this.playerId = null;
  }

  join(roomId, playerName) {
    this.roomId = roomId;
    this.socket.connect();
    this.socket.send('arena:join', { roomId, playerName });
  }

  move(x, y) { this.socket.send('arena:move', { roomId: this.roomId, x, y }); }
  attack(targetId) { this.socket.send('arena:attack', { roomId: this.roomId, targetId }); }

  onPlayerJoined(cb) { return this.socket.on('arena:player-joined', cb); }
  onGameState(cb) { return this.socket.on('arena:state', cb); }
  onPlayerHit(cb) { return this.socket.on('arena:hit', cb); }

  leave() {
    this.socket.send('arena:leave', { roomId: this.roomId });
    this.roomId = null;
  }
}
window.ArenaClient = ArenaClient;
