const fetch = require('node-fetch');
const { sanitizeDomain } = require('../core/validation'); // Para termo, simples validação

async function handleCVE(ws, cmdToProcess) {
    let termo = cmdToProcess.substring(4).trim();
    if (!termo || termo.length < 3) {
        ws.send(`TERM_RESULT::👾 Digite um termo válido! Ex: cve apache 2.4.49`);
        return;
    }

    ws.send(`TERM_RESULT::🛰️ Buscando CVEs públicos para "${termo}"...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
        const response = await fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(termo)}&resultsPerPage=5`, { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await response.json();
        if (!data.vulnerabilities || data.vulnerabilities.length === 0) {
            ws.send(`TERM_RESULT::ℹ️ Nenhum CVE encontrado para "${termo}".`);
            return;
        }
        let msg = `📊 <b>CVEs encontrados para "${termo}":</b><br><br>`;
        data.vulnerabilities.forEach(v => {
            const cve = v.cve;
            const id = cve.id;
            const desc = (cve.descriptions.find(d => d.lang === 'en') || {}).value || 'Sem descrição.';
            const descCurta = desc.length > 200 ? desc.substring(0, 200) + '...' : desc;
            const metrica = cve.metrics && (cve.metrics.cvssMetricV31 || cve.metrics.cvssMetricV30 || cve.metrics.cvssMetricV2);
            const score = metrica && metrica[0] ? metrica[0].cvssData.baseScore : 'N/A';
            msg += `🔸 <b>${id}</b> (CVSS: ${score})<br>${descCurta}<br><br>`;
        });
        ws.send(`TERM_RESULT::${msg}`);
    } catch (e) {
        clearTimeout(timeoutId);
        ws.send(`TERM_RESULT::❌ Erro ao consultar a base do NIST/NVD.`);
    }
}

module.exports = { handleCVE };
