const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const User = require('../models/User');
const { handleWhois } = require('./whois');
const { handleDNS } = require('./dns');
const { handleScan } = require('./scan');
const { handleSSL } = require('./ssl');
const { handleCVE } = require('./cve');
const { handleReputacao } = require('./reputacao');
const { handleCrypto } = require('./crypto');
const { handleIP } = require('./ip');
const { handleWhatWeb } = require('./whatweb');
const { handleWayback } = require('./wayback');
const { handleNaturalLanguage } = require('../services/ai');
const { getMonthlyRanking } = require('../services/ranking');

function sanitizeHTML(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// 🔥 A FUNÇÃO PRINCIPAL JÁ ERA ASYNC, ENTÃO O AWAIT DENTRO DELA É VÁLIDO!
async function handleCommand(ws, textoRecebido, userId) {
    let user = null;
    if (userId) { try { user = await User.findById(userId); } catch(e){} }
    if (!user) { user = { isPremium: true, username: 'Anonymous' }; }

    const isPremium = user.isPremium;

    // 🔥 MODO FREE (Curl)
    if (isPremium === false) {
        const regexDominio = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+)/g;
        const match = regexDominio.exec(textoRecebido);
        if (match) {
            let alvo = match[0];
            const alvoSeguro = alvo.replace(/[^a-zA-Z0-9.\-_:]/g, '');
            ws.send(`🛡️ Executando análise de cabeçalhos para ${alvoSeguro}...`);
            try {
                const response = await fetch(`https://api.hackertarget.com/httpheaders/?q=${alvoSeguro}`);
                const resultado = await response.text();
                let msgFinal = `📋 <b>Resultado para ${alvoSeguro}:</b><br><br>${sanitizeHTML(resultado).replace(/\n/g, '<br>')}`;
                ws.send(msgFinal);
            } catch (e) {
                ws.send("❌ Erro na consulta.");
            }
            return;
        } else {
            ws.send("🚫 Comando exclusivo para Premium. Acesse o carrinho 🛒.");
            return;
        }
    }

    // 🔥 INTELIGÊNCIA DE LINGUAGEM NATURAL
    const wasHandledByAI = await handleNaturalLanguage(ws, textoRecebido);
    if (wasHandledByAI) return;

    // 🔥 ROTEAMENTO PREMIUM
    let cmdToProcess = textoRecebido;
    if (textoRecebido.startsWith('TERM_CMD::')) {
        cmdToProcess = textoRecebido.replace('TERM_CMD::', '');
    }

    // 🔥 COMANDO DE RANKING (/ranking)
    if (cmdToProcess === '/ranking') {
        const ranking = await getMonthlyRanking();
        if (ranking.length === 0) {
            ws.send(`TERM_RESULT::🏆 Nenhuma estrela concedida este mês ainda.`);
            return;
        }
        let msg = `🏆 <b>RANKING DO MÊS</b><br><br>`;
        ranking.forEach((r, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⭐';
            msg += `${medal} ${r.username} - ${r.stars} estrelas<br>`;
        });
        ws.send(`TERM_RESULT::${msg}`);
        return;
    }

    if (cmdToProcess.startsWith('whois ')) {
        await handleWhois(ws, cmdToProcess);
    } else if (cmdToProcess.startsWith('dns ')) {
        await handleDNS(ws, cmdToProcess);
    } else if (cmdToProcess.startsWith('scan ')) {
        await handleScan(ws, cmdToProcess, userId);
    } else if (cmdToProcess.startsWith('ssl ')) {
        await handleSSL(ws, cmdToProcess);
    } else if (cmdToProcess.startsWith('cve ')) {
        await handleCVE(ws, cmdToProcess);
    } else if (cmdToProcess.startsWith('reputacao ')) {
        await handleReputacao(ws, cmdToProcess);
    } else if (cmdToProcess === 'btc' || cmdToProcess === 'eth' || cmdToProcess === 'sol' || cmdToProcess === 'cripto') {
        await handleCrypto(ws, cmdToProcess);
    } else if (cmdToProcess.startsWith('ip ')) {
        await handleIP(ws, cmdToProcess);
    } else if (cmdToProcess.startsWith('whatweb ')) {
        await handleWhatWeb(ws, cmdToProcess);
    } else if (cmdToProcess.startsWith('wayback ') || cmdToProcess.startsWith('arquivo ')) {
        await handleWayback(ws, cmdToProcess);
    } else {
        ws.send(`TERM_RESULT::❌ Comando não reconhecido. Digite 'help' para ver os comandos disponíveis.`);
    }
}

module.exports = { handleCommand };
