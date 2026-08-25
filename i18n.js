// ================= MATRIX OS - SISTEMA DE TRADUÇÃO =================
const translations = {
    'pt-BR': {
        app_name: 'MATRIX OS',
        game_hub: 'MATRIX GAME HUB',
        tools: 'FERRAMENTAS',
        sensors: 'SENSORES',
        cpu: 'CPU',
        mem: 'MEM',
        temp: 'TEMP',
        gpu: 'GPU',
        net: 'NET',
        encrypted: 'ENCRYPTED',
        chess: 'Xadrez 3D',
        camera: 'Pro Camera 360',
        nautical: 'Nautical Ultra',
        arena: 'Matrix Arena',
        ranking: 'Ranking',
        gps: 'Matrix GPS',
        tools_name: 'Super Tools',
        weather: 'Radar do Tempo',
        radar: 'Radar de Voos',
        satellite: 'Satélite AR',
        brain: 'Jogos de Lógica',
        version: 'v1.0',
        online: 'ONLINE',
        encrypted_net: 'ENCRYPTED',
        user: 'USER',
        system_loaded: 'SISTEMA CARREGADO',
        modules_active: 'MÓDULOS ATIVOS',
        operating_system: 'SISTEMA OPERACIONAL',
        last_sync: 'ÚLTIMA SINCRONIZAÇÃO',
        secure: 'SECURE',
        version_pro: 'v3.1.1 PRO'
    },
    'en': {
        app_name: 'MATRIX OS',
        game_hub: 'MATRIX GAME HUB',
        tools: 'TOOLS',
        sensors: 'SENSORS',
        cpu: 'CPU',
        mem: 'MEM',
        temp: 'TEMP',
        gpu: 'GPU',
        net: 'NET',
        encrypted: 'ENCRYPTED',
        chess: '3D Chess',
        camera: 'Pro Camera 360',
        nautical: 'Nautical Ultra',
        arena: 'Matrix Arena',
        ranking: 'Ranking',
        gps: 'Matrix GPS',
        tools_name: 'Super Tools',
        weather: 'Weather Radar',
        radar: 'Flight Radar',
        satellite: 'AR Satellite',
        brain: 'Logic Games',
        version: 'v1.0',
        online: 'ONLINE',
        encrypted_net: 'ENCRYPTED',
        user: 'USER',
        system_loaded: 'SYSTEM LOADED',
        modules_active: 'ACTIVE MODULES',
        operating_system: 'OPERATING SYSTEM',
        last_sync: 'LAST SYNC',
        secure: 'SECURE',
        version_pro: 'v3.1.1 PRO'
    },
    'es': {
        app_name: 'MATRIX OS',
        game_hub: 'MATRIX GAME HUB',
        tools: 'HERRAMIENTAS',
        sensors: 'SENSORES',
        cpu: 'CPU',
        mem: 'MEM',
        temp: 'TEMP',
        gpu: 'GPU',
        net: 'RED',
        encrypted: 'ENCRIPTADO',
        chess: 'Ajedrez 3D',
        camera: 'Pro Camera 360',
        nautical: 'Nautical Ultra',
        arena: 'Matrix Arena',
        ranking: 'Ranking',
        gps: 'Matrix GPS',
        tools_name: 'Super Herramientas',
        weather: 'Radar del Tiempo',
        radar: 'Radar de Vuelos',
        satellite: 'Satélite AR',
        brain: 'Juegos de Lógica',
        version: 'v1.0',
        online: 'EN LÍNEA',
        encrypted_net: 'ENCRIPTADO',
        user: 'USUARIO',
        system_loaded: 'SISTEMA CARGADO',
        modules_active: 'MÓDULOS ACTIVOS',
        operating_system: 'SISTEMA OPERATIVO',
        last_sync: 'ÚLTIMA SINCRONIZACIÓN',
        secure: 'SEGURO',
        version_pro: 'v3.1.1 PRO'
    },
    'fr': {
        app_name: 'MATRIX OS',
        game_hub: 'MATRIX GAME HUB',
        tools: 'OUTILS',
        sensors: 'CAPTEURS',
        cpu: 'CPU',
        mem: 'MEM',
        temp: 'TEMP',
        gpu: 'GPU',
        net: 'RÉSEAU',
        encrypted: 'CRYPTÉ',
        chess: 'Échecs 3D',
        camera: 'Pro Camera 360',
        nautical: 'Nautical Ultra',
        arena: 'Matrix Arena',
        ranking: 'Classement',
        gps: 'Matrix GPS',
        tools_name: 'Super Outils',
        weather: 'Radar Météo',
        radar: 'Radar de Vols',
        satellite: 'Satellite AR',
        brain: 'Jeux de Logique',
        version: 'v1.0',
        online: 'EN LIGNE',
        encrypted_net: 'CRYPTÉ',
        user: 'UTILISATEUR',
        system_loaded: 'SYSTÈME CHARGÉ',
        modules_active: 'MODULES ACTIFS',
        operating_system: 'SYSTÈME D\'EXPLOITATION',
        last_sync: 'DERNIÈRE SYNCHRO',
        secure: 'SÉCURISÉ',
        version_pro: 'v3.1.1 PRO'
    },
    'de': {
        app_name: 'MATRIX OS',
        game_hub: 'MATRIX GAME HUB',
        tools: 'WERKZEUGE',
        sensors: 'SENSOREN',
        cpu: 'CPU',
        mem: 'ARBEITSSPEICHER',
        temp: 'TEMP',
        gpu: 'GPU',
        net: 'NETZWERK',
        encrypted: 'VERSCHLÜSSELT',
        chess: '3D-Schach',
        camera: 'Pro Camera 360',
        nautical: 'Nautical Ultra',
        arena: 'Matrix Arena',
        ranking: 'Rangliste',
        gps: 'Matrix GPS',
        tools_name: 'Super Werkzeuge',
        weather: 'Wetterradar',
        radar: 'Flugradar',
        satellite: 'AR-Satellit',
        brain: 'Logikspiele',
        version: 'v1.0',
        online: 'ONLINE',
        encrypted_net: 'VERSCHLÜSSELT',
        user: 'BENUTZER',
        system_loaded: 'SYSTEM GELADEN',
        modules_active: 'AKTIVE MODULE',
        operating_system: 'BETRIEBSSYSTEM',
        last_sync: 'LETZTE SYNC',
        secure: 'SICHER',
        version_pro: 'v3.1.1 PRO'
    }
};

// Detectar idioma do navegador
function detectLanguage() {
    const saved = localStorage.getItem('matrix_language');
    if(saved && translations[saved]) return saved;

    const browserLang = navigator.language || navigator.userLanguage || 'pt-BR';

    // Verificar idioma completo (ex: pt-BR)
    if(translations[browserLang]) return browserLang;

    // Verificar idioma base (ex: pt)
    const baseLang = browserLang.split('-')[0];
    const match = Object.keys(translations).find(k => k.startsWith(baseLang));
    if(match) return match;

    return 'pt-BR'; // Fallback
}

let currentLanguage = detectLanguage();

function t(key) {
    return translations[currentLanguage][key] || translations['pt-BR'][key] || key;
}

function setLanguage(lang) {
    if(translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('matrix_language', lang);
        applyTranslations();
    }
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
}

// Aplicar traduções quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', applyTranslations);
