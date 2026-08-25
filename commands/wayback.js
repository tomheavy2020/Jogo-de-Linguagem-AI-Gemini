const fetch = require('node-fetch');
const { sanitizeDomain } = require('../core/validation');

async function handleWayback(ws, cmdToProcess) {
    let alvo = cmdToProcess.substring(cmdToProcess.indexOf(' ') + 1).trim();
    const alvoSeguro = sanitizeDomain(alvo);
    if (!alvoSeguro) {
        ws.send(`TERM_RESULT::👾 Alvo inválido! Digite: wayback google.com`);
        return;
    }

    ws.send(`TERM_RESULT::🕵️‍♂️ Buscando URLs históricas de ${alvoSeguro}...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
        const response = await fetch(`https://web.archive.org/cdx/search/cdx?url=${alvoSeguro}/*&output=json&fl=original&collapse=urlkey&limit=25`, { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await response.json();
        let resultado = "";
        if (!data || data.length === 0 || data[1].length === 0) {
            resultado = "ℹ️ Nenhum diretório histórico encontrado.";
        } else {
            const urls = data.slice(1).map(item => item[0]);
            resultado = `🔗 URLs históricas encontradas:<br><br>${urls.join('<br>')}`;
        }
        ws.send(`TERM_RESULT::📊 Resultado Wayback:<br><br>${resultado.replace(/\n/g, '<br>')}`);
    } catch (e) {
        clearTimeout(timeoutId);
        ws.send(`TERM_RESULT::⚠️ A API retornou um formato inesperado.`);
    }
}

module.exports = { handleWayback };
