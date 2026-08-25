// 🔥 VALIDAÇÃO DE ENTRADA REUTILIZÁVEL (Fase 1)

function sanitizeDomain(input) {
    if (typeof input !== 'string') return null;
    // Permite: letras, números, pontos, hífens e underlines. Mínimo 4 caracteres.
    const clean = input.trim().toLowerCase().replace(/[^a-zA-Z0-9.\-_]/g, '');
    if (clean.length < 4) return null;
    if (clean.split('.').length < 2) return null; // Precisa ter um ponto (domínio básico)
    return clean;
}

function sanitizeIP(input) {
    if (typeof input !== 'string') return null;
    const clean = input.trim().replace(/[^0-9.]/g, '');
    // Verifica se tem 4 octetos de 0-255
    const parts = clean.split('.');
    if (parts.length !== 4) return null;
    for (let part of parts) {
        const num = parseInt(part, 10);
        if (isNaN(num) || num < 0 || num > 255) return null;
    }
    return clean;
}

module.exports = { sanitizeDomain, sanitizeIP };
