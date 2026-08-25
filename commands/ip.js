const fetch = require('node-fetch');
const { sanitizeIP } = require('../core/validation');

async function handleIP(ws, cmdToProcess) {
    let ip = cmdToProcess.substring(3).trim();
    const ipSeguro = sanitizeIP(ip);
    if (!ipSeguro) {
        ws.send(`TERM_RESULT::👾 IP inválido! Digite: ip 8.8.8.8`);
        return;
    }

    ws.send(`TERM_RESULT::🌍 Buscando localização do IP ${ipSeguro}...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
        const response = await fetch(`http://ip-api.com/json/${ipSeguro}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await response.json();
        if (data.status === 'fail') {
            ws.send(`TERM_RESULT::⚠️ IP inválido ou não encontrado.`);
            return;
        }
        ws.send(`TERM_RESULT::📊 GeoIP de ${ipSeguro}:<br><br>📍 ${data.city}, ${data.regionName}, ${data.country}<br>🏢 ISP: ${data.isp}<br>🌐 Org: ${data.org}<br>🧭 Coordenadas: ${data.lat}, ${data.lon}`);
    } catch (e) {
        clearTimeout(timeoutId);
        ws.send(`TERM_RESULT::⚠️ Erro ao processar resposta do GeoIP.`);
    }
}

module.exports = { handleIP };
