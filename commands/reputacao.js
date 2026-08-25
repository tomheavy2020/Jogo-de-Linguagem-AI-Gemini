const fetch = require('node-fetch');
const { sanitizeIP } = require('../core/validation');

async function handleReputacao(ws, cmdToProcess) {
    let ip = cmdToProcess.substring(10).trim();
    const ipSeguro = sanitizeIP(ip);
    if (!ipSeguro) {
        ws.send(`TERM_RESULT::👾 IP inválido! Digite: reputacao 8.8.8.8`);
        return;
    }

    ws.send(`TERM_RESULT::🕵️ Verificando reputação do IP ${ipSeguro}...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
        const response = await fetch(`http://ip-api.com/json/${ipSeguro}?fields=status,message,country,isp,org,as,proxy,hosting,mobile,query`, { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await response.json();
        if (data.status === 'fail') {
            ws.send(`TERM_RESULT::⚠️ IP inválido ou não encontrado.`);
            return;
        }
        let msg = `📊 <b>Reputação de ${data.query}:</b><br>`;
        msg += `🏢 ISP: ${data.isp}<br>🌐 Org: ${data.org}<br>🔢 ASN: ${data.as}<br>`;
        msg += `🕵️ Proxy/VPN: ${data.proxy ? '⚠️ Sim' : '✅ Não'}<br>`;
        msg += `🏭 Hosting/Datacenter: ${data.hosting ? '⚠️ Sim' : '✅ Não'}<br>`;
        msg += `📱 Rede móvel: ${data.mobile ? 'Sim' : 'Não'}`;
        ws.send(`TERM_RESULT::${msg}`);
    } catch (e) {
        clearTimeout(timeoutId);
        ws.send(`TERM_RESULT::❌ Erro ao consultar reputação do IP.`);
    }
}

module.exports = { handleReputacao };
