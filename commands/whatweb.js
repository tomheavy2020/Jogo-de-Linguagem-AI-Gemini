const fetch = require('node-fetch');
const { sanitizeDomain } = require('../core/validation');

async function handleWhatWeb(ws, cmdToProcess) {
    let alvo = cmdToProcess.substring(8).trim();
    const alvoSeguro = sanitizeDomain(alvo);
    if (!alvoSeguro) {
        ws.send(`TERM_RESULT::👾 Alvo inválido! Digite: whatweb google.com`);
        return;
    }

    ws.send(`TERM_RESULT::🕸️ Analisando tecnologias e WAF de ${alvoSeguro}...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
        const response = await fetch(`https://api.hackertarget.com/whatweb/?q=${alvoSeguro}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        const resultado = await response.text();
        ws.send(`TERM_RESULT::📊 Resultado WhatWeb:<br><br>${resultado.replace(/\n/g, '<br>')}`);
    } catch (e) {
        clearTimeout(timeoutId);
        ws.send(`TERM_RESULT::❌ Erro na consulta WhatWeb.`);
    }
}

module.exports = { handleWhatWeb };
