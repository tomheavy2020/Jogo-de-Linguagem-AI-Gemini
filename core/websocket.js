const { WebSocketServer } = require('ws');
let commandRouter = null;
try {
    commandRouter = require('../commands/command-router');
} catch(e) {
    console.log('[WebSocket] Router de comandos não encontrado:', e.message);
}

let activeConnections = 0;

function initWebSocket(server) {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        activeConnections++;
        broadcastOnlineCount(wss);

        ws.on('message', async (message) => {
            try {
                const msgStr = message.toString();
                if (msgStr.startsWith('TERM_CMD::')) {
                    const cmdText = msgStr.replace('TERM_CMD::', '').trim();
                    if (commandRouter && typeof commandRouter.handleCommand === 'function') {
                        await commandRouter.handleCommand(ws, cmdText, null);
                    } else {
                        ws.send(`TERM_RESULT::[COMANDO PROCESSADO]: ${cmdText}`);
                    }
                } else {
                    ws.send(`PONG::${msgStr}`);
                }
            } catch (err) {
                console.error('[WebSocket Error]:', err);
                ws.send(`TERM_RESULT::Erro ao processar comando: ${err.message}`);
            }
        });

        ws.on('close', () => {
            activeConnections = Math.max(0, activeConnections - 1);
            broadcastOnlineCount(wss);
        });
    });
}

function broadcastOnlineCount(wss) {
    const payload = JSON.stringify({ type: 'online_count', count: activeConnections });
    wss.clients.forEach((client) => {
        if (client.readyState === 1) {
            client.send(payload);
        }
    });
}

module.exports = initWebSocket;
