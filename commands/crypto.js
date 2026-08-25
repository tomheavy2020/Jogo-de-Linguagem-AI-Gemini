const fetch = require('node-fetch');

async function handleCrypto(ws, cmdToProcess) {
    let ids = '';
    if (cmdToProcess === 'btc') ids = 'bitcoin';
    else if (cmdToProcess === 'eth') ids = 'ethereum';
    else if (cmdToProcess === 'sol') ids = 'solana';
    else if (cmdToProcess === 'cripto') ids = 'bitcoin,ethereum,solana,ripple,cardano,dogecoin';
    else { ws.send(`TERM_RESULT::👾 Comando não reconhecido. Use btc, eth, sol ou cripto.`); return; }

    ws.send(`TERM_RESULT::💰 Consultando cotações...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,brl`, { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await response.json();
        let msg = `📊 <b>MERCADO CRIPTO</b><br>`;
        if (data.bitcoin) msg += `🪙 BTC: $${data.bitcoin.usd} (R$ ${data.bitcoin.brl})<br>`;
        if (data.ethereum) msg += `🪙 ETH: $${data.ethereum.usd} (R$ ${data.ethereum.brl})<br>`;
        if (data.solana) msg += `🪙 SOL: $${data.solana.usd} (R$ ${data.solana.brl})<br>`;
        if (data.ripple) msg += `🪙 XRP: $${data.ripple.usd}<br>`;
        if (data.cardano) msg += `🪙 ADA: $${data.cardano.usd}<br>`;
        if (data.dogecoin) msg += `🪙 DOGE: $${data.dogecoin.usd}<br>`;
        ws.send(`TERM_RESULT::${msg}`);
    } catch (e) {
        clearTimeout(timeoutId);
        ws.send(`TERM_RESULT::❌ Erro ao consultar cotações.`);
    }
}

module.exports = { handleCrypto };
