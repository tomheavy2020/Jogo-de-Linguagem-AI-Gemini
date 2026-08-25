const fetch = require('node-fetch');
const { sanitizeDomain } = require('../core/validation');

async function handleDNS(ws, cmdToProcess) {
    let alvo = cmdToProcess.substring(4).trim();
    const alvoSeguro = sanitizeDomain(alvo);
    if (!alvoSeguro) {
        ws.send(`TERM_RESULT::👾 Domínio inválido! Digite: dns google.com`);
        return;
    }

    ws.send(`TERM_RESULT::🌐 Consultando registros DNS de ${alvoSeguro}...`);
    const tipos = ['A', 'AAAA', 'MX', 'NS', 'TXT'];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
        const resultados = await Promise.all(tipos.map(async (tipo) => {
            const r = await fetch(`https://dns.google/resolve?name=${alvoSeguro}&type=${tipo}`, { signal: controller.signal });
            const data = await r.json();
            if (!data.Answer || data.Answer.length === 0) return null;
            const valores = data.Answer.map(a => a.data).join(', ');
            return `<b>${tipo}</b>: ${valores}`;
        }));
        clearTimeout(timeoutId);
        const linhas = resultados.filter(Boolean);
        const msg = linhas.length > 0
            ? `📊 <b>Registros DNS de ${alvoSeguro}:</b><br><br>${linhas.join('<br>')}`
            : `ℹ️ Nenhum registro encontrado para ${alvoSeguro}.`;
        ws.send(`TERM_RESULT::${msg}`);
    } catch (e) {
        clearTimeout(timeoutId);
        ws.send(`TERM_RESULT::❌ Erro ao consultar DNS.`);
    }
}

module.exports = { handleDNS };
