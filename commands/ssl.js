const fetch = require('node-fetch');
const { sanitizeDomain } = require('../core/validation');

async function handleSSL(ws, cmdToProcess) {
    let alvo = cmdToProcess.substring(4).trim();
    const alvoSeguro = sanitizeDomain(alvo);
    if (!alvoSeguro) {
        ws.send(`TERM_RESULT::👾 Domínio inválido! Digite: ssl google.com`);
        return;
    }

    ws.send(`TERM_RESULT::🔒 Verificando certificado SSL de ${alvoSeguro}...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
        const response = await fetch(`https://ssl-tools.net/api/v1/validity/${alvoSeguro}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await response.json();
        if (!data.valid) {
            ws.send(`TERM_RESULT::⚠️ O certificado SSL de ${alvoSeguro} NÃO é válido.`);
            return;
        }
        let res = `🔐 <b>SSL de ${alvoSeguro}:</b><br>✅ Válido: Sim<br>📅 Emite: ${data.issued_to ? data.issued_to : 'N/A'}<br>⏳ Expira: ${data.expiry_date}<br>🏢 Emissor: ${data.issuer ? data.issuer : 'N/A'}`;
        ws.send(`TERM_RESULT::📊 Resultado SSL:<br><br>${res.replace(/\n/g, '<br>')}`);
    } catch(e) {
        clearTimeout(timeoutId);
        ws.send(`TERM_RESULT::⚠️ Erro ao verificar o certificado SSL.`);
    }
}

module.exports = { handleSSL };
