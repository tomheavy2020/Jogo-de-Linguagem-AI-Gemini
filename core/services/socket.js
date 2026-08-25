class SocketService {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectTimer = null;
    this.isConnected = false;
    this.url = 'wss://' + window.location.host;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    this.ws = new WebSocket(this.url);
    this.ws.onopen = () => {
      this.isConnected = true;
      this.emit('open', null);
      console.log('[Socket] Conectado');
    };
    this.ws.onmessage = (e) => {
      try { const msg = JSON.parse(e.data); this.emit(msg.type, msg.payload); }
      catch (err) { this.emit('raw', e.data); }
    };
    this.ws.onclose = () => {
      this.isConnected = false; this.emit('close', null);
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = setTimeout(() => this.connect(), 3000);
    };
    this.ws.onerror = (e) => { this.emit('error', e); };
  }

  disconnect() {
    clearTimeout(this.reconnectTimer);
    if (this.ws) { this.ws.close(); this.ws = null; }
  }

  send(type, payload) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  emit(event, data) { this.listeners.get(event)?.forEach(cb => cb(data)); }
}

window.SocketService = new SocketService();
