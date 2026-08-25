let socket;
let currentUser = null;
let isConnected = false;
let reconnectAttempts = 0;
let issLoaded = false;
let currentChannelIndex = 0;
let html5QrCode = null;
let recognition = null;
let terminalMode = 'cmd';
let scriptName = 'script.sh';
let isVoiceAuto = false;

const channels = [
    { name: "🛰️ ISS - Terra ao Vivo", url: "https://www.youtube.com/embed/Jm8wRjD3xVA?autoplay=1&mute=1&loop=1&playlist=Jm8wRjD3xVA&controls=0&rel=0&showinfo=0" },
    { name: "🚀 NASA TV Oficial", url: "https://www.youtube.com/embed/21X5lGlDOfg?autoplay=1&mute=1&loop=1&playlist=21X5lGlDOfg&controls=0&rel=0&showinfo=0" }
];

// ==========================
// 🔥 SISTEMA DE AUTENTICAÇÃO
// ==========================
window.onload = function() {
    const userData = localStorage.getItem('matrixUser');
    if (userData) {
        currentUser = JSON.parse(userData);
        const userTag = document.getElementById('userTag');
        if(userTag) userTag.innerText = '@' + currentUser.username;
    } else {
        currentUser = { id: 'guest_' + Date.now(), username: 'Visitante' };
        localStorage.setItem('matrixUser', JSON.stringify(currentUser));
    }
    connectWebSocket();
    initDrawer();
    initTerminalDrawer();
    initFileAttachment();
    initMatrixLens();
    initVoiceRecognition();
    initShipPanel();
};

// ==========================
// 🔥 CHAT E MENSAGENS
// ==========================
function addMessage(type, text) {
    const chatBox = document.getElementById('chatBox');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message ' + (type === 'user' ? 'user-message' : 'bot-message');
    if (text.includes('<') && text.includes('>')) { msgDiv.innerHTML = text; } else { msgDiv.textContent = text; }
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// ==========================
// 🔥 COMANDOS FREE (Apenas Curl e Ajuda)
// ==========================
function processUserMessage(text) {
    const lowerText = text.trim().toLowerCase();

    if (lowerText === 'clear') { document.getElementById('chatBox').innerHTML = ''; return true; }
    if (lowerText === 'help') {
        addMessage('bot', '🟢 <b>MATRIX HELP</b><br><br>🌐 <b>MODO FREE:</b><br>• Digite qualquer domínio (ex: terra.com.br) para executar <b>CURL</b>.<br><br>🚀 <b>MODO PREMIUM:</b><br>• Ative em /premium.html<br>• Comandos: whois, dns, scan, ssl, cve, btc, eth...<br><br>⚙️ <b>GERAL:</b><br>• clear - Limpa o chat<br>• help - Mostra este menu');
        return true;
    }

    const isPremium = currentUser && currentUser.isPremium === true;
    const advancedCommands = ['whois', 'dns', 'scan', 'ssl', 'cve', 'reputacao', 'whatweb', 'wayback', 'btc', 'eth', 'sol', 'cripto', 'ip'];
    const firstWord = lowerText.split(' ')[0];

    if (advancedCommands.includes(firstWord) && !isPremium) {
        addMessage('bot', '⚠️ <b>Comando bloqueado no modo Free.</b><br>Este comando exige plano Premium. Acesse <b>/premium.html</b> para desbloquear o poder da Matrix OS.');
        return true;
    }

    if (!isPremium || !advancedCommands.includes(firstWord)) {
        if (socket && socket.readyState === WebSocket.OPEN && isConnected) {
            socket.send('CURL_CMD::' + text);
            return true;
        }
    }
    return false;
}

function connectWebSocket() {
    socket = new WebSocket('wss://' + window.location.host);
    socket.addEventListener('open', function () {
        socket.send('USER_ID::' + currentUser.id);
        isConnected = true; reconnectAttempts = 0;
        addMessage('bot', '🟢 <b>Bem-vindo ao Matrix Bot!</b><br>🔹 <b>Modo Free:</b> Apenas CURL está habilitado.<br>🔹 <b>Digite "help"</b> para ver os comandos.');
    });
    socket.addEventListener('message', (event) => addMessage('bot', '👾 ' + event.data));
    socket.addEventListener('close', () => {
        isConnected = false;
        if (reconnectAttempts < 5) { reconnectAttempts++; setTimeout(connectWebSocket, 3000); }
    });
}

document.getElementById('sendBtn').addEventListener('click', function() {
    const input = document.getElementById('userInput');
    const text = input.value.trim();
    if (text === "" || !socket || socket.readyState !== WebSocket.OPEN || !isConnected) {
        if(!isConnected) addMessage('bot', '⚠️ Reconectando ao servidor...');
        return;
    }
    addMessage('user', '🚀 ' + text);
    if (!processUserMessage(text)) { socket.send(text); }
    input.value = "";
});
document.getElementById('userInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') document.getElementById('sendBtn').click(); });

// ==========================
// 🔥 TERMINAL ELEGANTE (Corrigido)
// ==========================
function initTerminalDrawer() {
    const terminalDrawer = document.getElementById('terminalDrawer');
    const terminalToggle = document.getElementById('terminalToggle');
    const terminalOutput = document.getElementById('terminalOutput');
    const terminalInput = document.getElementById('terminalInput');

    if (!terminalDrawer || !terminalToggle) return;

    terminalToggle.addEventListener('click', () => {
        const isOpening = !terminalDrawer.classList.contains('open');
        terminalDrawer.classList.toggle('open');
        terminalToggle.innerHTML = isOpening ? '⧉' : '_';
        if (isOpening && terminalInput) terminalInput.focus();
    });

    if (terminalInput) {
        terminalInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const cmd = terminalInput.value.trim();
                terminalInput.value = '';
                processTerminalCommand(cmd, terminalOutput);
            }
        });
    }
}

function processTerminalCommand(cmd, output) {
    const lowerCmd = cmd.trim().toLowerCase();
    output.innerHTML += `\nroot@matrix:~$ ${cmd}`;

    if (lowerCmd === 'clear') { output.innerHTML = ''; return; }
    if (lowerCmd === 'exit') {
        document.getElementById('terminalDrawer').classList.remove('open');
        document.getElementById('terminalToggle').innerHTML = '_';
        return;
    }
    if (lowerCmd === 'help') {
        output.innerHTML += `\n🟢 <b>MATRIX TERMINAL HELP</b>\n\n🌐 <b>MODO FREE (CURL)</b>\n• Digite qualquer URL ou IP\n\n🚀 <b>MODO PREMIUM</b>\n• whois [domínio]\n• dns [domínio]\n• scan [domínio/IP]\n• ssl [domínio]\n• cve [termo]\n• btc / eth / sol / cripto\n\n⚙️ <b>SISTEMA</b>\n• clear\n• exit`;
        output.scrollTop = output.scrollHeight;
        return;
    }

    const isPremium = currentUser && currentUser.isPremium === true;
    const advancedCommands = ['whois', 'dns', 'scan', 'ssl', 'cve', 'reputacao', 'whatweb', 'wayback', 'btc', 'eth', 'sol', 'cripto', 'ip'];
    const firstWord = lowerCmd.split(' ')[0];

    if (advancedCommands.includes(firstWord) && !isPremium) {
        output.innerHTML += `\n⚠️ <span style="color:#ffaa00;">[BLOQUEADO]</span> Comando disponível apenas no plano Premium.`;
        output.scrollTop = output.scrollHeight;
        return;
    }

    if (socket && socket.readyState === WebSocket.OPEN && isConnected) {
        socket.send('TERM_CMD::' + cmd);
        output.innerHTML += `\n⏳ Executando...`;
        output.scrollTop = output.scrollHeight;
    } else {
        output.innerHTML += `\n❌ Falha de conexão com o servidor.`;
        output.scrollTop = output.scrollHeight;
    }
}

// ==========================
// 🔥 Funções Auxiliares (Placeholders para não quebrar)
// ==========================
function initDrawer() {}
function initFileAttachment() {}
function initMatrixLens() {}
function initVoiceRecognition() {}
function initShipPanel() {}
