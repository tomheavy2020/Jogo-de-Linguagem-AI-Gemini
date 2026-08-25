const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ArenaManager } = require('./arena-engine');

const clients = new Map();
const authenticatedUsers = new Map();
const arena = new ArenaManager();
const JWT_SECRET = process.env.JWT_SECRET;

function initWebSocket(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        let currentUserId = null;

        ws.on('message', (rawData) => {
            try {
                const message = rawData.toString();

                if (message.startsWith('AUTH_TOKEN::')) {
                    const token = message.replace('AUTH_TOKEN::', '');
                    try {
                        const decoded = jwt.verify(token, JWT_SECRET);
                        const userId = decoded.userId;
                        currentUserId = userId;
                        const user = { id: userId, username: decoded.username, isPremium: decoded.isPremium };
                        authenticatedUsers.set(ws, user);
                        if (!clients.has(userId)) clients.set(userId, new Set());
                        clients.get(userId).add(ws);
                        ws.send('🟢 Autenticado com sucesso!');
                    } catch (e) { ws.send('🔴 Token inválido.'); }
                    return;
                }

                const user = authenticatedUsers.get(ws);
                if (!user) { ws.send('⚠️ Aguardando autenticação.'); return; }

                // 🔥 INTEGRAÇÃO DA NOVA ARENA
                if (message.startsWith('ARENA_JOIN::')) {
                    const parts = message.split('::');
                    const roomId = parts[1];
                    const username = parts[2] || user.username;
                    const maxPlayers = parseInt(parts[3], 10) || 2;

                    arena.join(roomId, user.id, username, ws, maxPlayers);
                    return;
                }

                if (message.startsWith('TERM_CMD::')) {
                    const cmd = message.replace('TERM_CMD::', '');
                    // Verifica se o jogador está em uma arena para pontuar
                    for (const [code, room] of arena.rooms) {
                        if (room.players.has(user.id) && room.status === 'active') {
                            room.broadcast(`${user.username} executou: ${cmd}`);
                            room.addPoints(user.id, 10); // Simula pontuação
                            return;
                        }
                    }
                    // Roteamento normal de comandos se não estiver na arena...
                    ws.send(`TERM_RESULT::Comando recebido: ${cmd}`);
                    return;
                }
            } catch (err) {
                console.error('Erro no WebSocket:', err);
                ws.send('🔴 Erro interno no processamento.');
            }
        });

        ws.on('close', () => {
            if (currentUserId && clients.has(currentUserId)) {
                clients.get(currentUserId).delete(ws);
                if (clients.get(currentUserId).size === 0) clients.delete(currentUserId);
                authenticatedUsers.delete(ws);
            }
            // Limpeza da Arena
            for (const [code, room] of arena.rooms) {
                arena.leave(code, currentUserId);
            }
        });
    });
}

module.exports = { initWebSocket };
