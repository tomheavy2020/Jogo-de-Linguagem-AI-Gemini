const fetch = require('node-fetch');
const { sanitizeDomain } = require('../core/validation');

async function handleWhois(ws, cmdToProcess) {
    let alvo = cmdToProcess.substring(6).trim();
    const alvoSeguro = sanitizeDomain(alvo);
    if (!alvoSeguro) {
        ws.send(`TERM_RESULT::👾 Alvo inválido! Digite: whois google.com`);
        return;
    }

    ws.send(`TERM_RESULT::🕵️‍♂️ Buscando WHOIS de ${alvoSeguro}...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
        const response = await fetch(`https://rdap.org/domain/${alvoSeguro}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await response.json();
        let res = `🌐 Domínio: ${data.ldhName || alvoSeguro}\n`;
        if (data.events) {
            const registro = data.events.find(e => e.eventAction === 'registration');
            const expiracao = data.events.find(e => e.eventAction === 'expiration');
            if (registro) res += `📅 Registro: ${registro.eventDate}\n`;
            if (expiracao) res += `⏳ Expira: ${expiracao.eventDate}\n`;
        }
        if (data.entities) {
            const owner = data.entities.find(e => e.roles && e.roles.includes('registrant'));
            if (owner) res += `👤 Dono: ${owner.vcard[1][3] || 'Não informado'}\n`;
        }
        ws.send(`TERM_RESULT::📊 Resultado WHOIS:<br><br>${res.replace(/\n/g, '<br>')}`);
    } catch (e) {
        clearTimeout(timeoutId);
        ws.send(`TERM_RESULT::⚠️ Não foi possível obter o WHOIS no momento.`);
    }
}

module.exports = { handleWhois };
