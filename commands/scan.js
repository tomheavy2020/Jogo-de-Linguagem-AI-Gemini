const fetch = require('node-fetch');
const Scan = require('../models/Scan');
const { sanitizeDomain } = require('../core/validation');
const { checkScanLimit, getUserPlan } = require('../core/plan-utils');
const { addStar } = require('../services/ranking');

async function handleScan(ws, cmdToProcess, userId) {
    let alvo = cmdToProcess.substring(5).trim();
    const alvoSeguro = sanitizeDomain(alvo);
    if (!alvoSeguro) {
        ws.send(`TERM_RESULT::👾 Alvo inválido! Digite: scan google.com`);
        return;
    }

    // 🔥 VERIFICA O LIMITE DO PLANO
    const limitCheck = await checkScanLimit(userId);
    if (!limitCheck.allowed) {
        ws.send(`TERM_RESULT::🚫 ${limitCheck.reason}`);
        return;
    }

    ws.send(`TERM_RESULT::🛡️ Escaneando portas de ${alvoSeguro}...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
        const response = await fetch(`https://api.hackertarget.com/portscan/?q=${alvoSeguro}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        const stdout = await response.text();
        let linhas = stdout.split('\n');
        let portasAbertas = [];
        linhas.forEach(linha => {
            if (/^\d+\/tcp/.test(linha.trim()) && !linha.includes("filtered")) {
                portasAbertas.push(linha.trim());
            }
        });
        let resultado = "";
        if (portasAbertas.length > 0) {
            resultado = `🔓 <b>Portas Abertas em ${alvoSeguro}:</b><br><br>`;
            portasAbertas.forEach(porta => { resultado += `➡️ ${porta}<br>`; });
        } else {
            resultado = `ℹ️ Nenhuma porta aberta encontrada em ${alvoSeguro}.`;
        }
        await new Scan({ user: userId, alvo: alvoSeguro, resultado: stdout }).save();

        // 🔥 CONCEDE ESTRELA E INFORMA O USUÁRIO
        await addStar(userId, alvoSeguro);
        const plan = await getUserPlan(userId);
        const limit = plan === 'free' ? 0 : plan === 'premium' ? 100 : '∞';
        ws.send(`TERM_RESULT::📊 Resultado do Scan:<br><br>${resultado.replace(/\n/g, '<br>')}<br><br>⭐ +1 estrela concedida! (Plano: ${plan.toUpperCase()} - ${limit} scans/mês)`);
    } catch (e) {
        clearTimeout(timeoutId);
        ws.send(`TERM_RESULT::❌ Erro ao escanear as portas.`);
    }
}

module.exports = { handleScan };
