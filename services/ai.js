const { handleWhois } = require('../commands/whois');
const { handleDNS } = require('../commands/dns');
const { handleWhatWeb } = require('../commands/whatweb');
const { handleSSL } = require('../commands/ssl');

// 🔥 Mapeamento de palavras-chave para ações
const intents = [
    { keywords: ['analise', 'analisar', 'investigar', 'verificar'], actions: ['whois', 'dns', 'whatweb', 'ssl'] },
    { keywords: ['onde estou', 'minha localização'], actions: ['location'] },
    { keywords: ['radar', 'redes', 'wifi'], actions: ['radar'] },
    { keywords: ['parar navegação', 'cancelar rota'], actions: ['stop_nav'] }
];

async function handleNaturalLanguage(ws, text) {
    const lowerText = text.toLowerCase();

    // 🔥 Detecta a intenção
    for (let intent of intents) {
        if (intent.keywords.some(kw => lowerText.includes(kw))) {
            // Extrai o domínio ou alvo da frase
            const regex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+)/g;
            const match = regex.exec(text);
            const target = match ? match[0] : null;

            if (target && intent.actions.includes('whois')) {
                ws.send(`🧠 Intenção detectada: Investigar domínio "${target}"`);
                // Executa uma cadeia de comandos automática
                await handleWhois(ws, `whois ${target}`);
                await handleDNS(ws, `dns ${target}`);
                await handleWhatWeb(ws, `whatweb ${target}`);
                await handleSSL(ws, `ssl ${target}`);
                ws.send(`✅ Análise automática do domínio concluída.`);
                return true;
            }
            return true;
        }
    }
    return false; // Nenhuma intenção encontrada, cai no roteador normal
}

module.exports = { handleNaturalLanguage };
