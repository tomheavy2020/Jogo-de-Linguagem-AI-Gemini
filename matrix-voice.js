// 🔥 MATRIX VOICE & RADAR SYSTEM (Versão 2.0)
// Não precisa de servidor, roda 100% no navegador do usuário

let isRadarActive = false;
let currentUserPosition = null;
let matrixRadarInterval = null;

// Função para ativar o Radar e o Reconhecimento de Voz Global
window.activateMatrixRadar = function() {
    if (isRadarActive) {
        console.log("👾 Radar Matrix já está ativo.");
        return;
    }

    // 1. Ativar o modo "Siri" (Reconhecimento de Voz Contínuo)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = function(event) {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }

            // 🔥 DETECÇÃO DE COMANDOS DE NAVEGAÇÃO PELA VOZ
            const lowerText = finalTranscript.toLowerCase();
            if (lowerText.includes("matrix") || lowerText.includes("leva") || lowerText.includes("navegar")) {
                // Extrai o destino da fala
                let destino = lowerText.replace("matrix", "").replace("leva", "").replace("navegar", "").replace("para", "").replace("até", "").trim();

                if (destino.length > 3) {
                    // Encontra o lugar via API externa e manda para o mapa
                    console.log("🗣️ Comando de voz detectado:", destino);
                    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destino)}&limit=1`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.length > 0) {
                            const place = data[0];
                            // Envia um comando especial para o mapa
                            window.postMessage({
                                type: 'matrix_navigation',
                                lat: parseFloat(place.lat),
                                lng: parseFloat(place.lon),
                                name: place.display_name
                            }, '*');

                            // Responde no chat
                            if (typeof addMessage === 'function') {
                                addMessage('bot', `🎯 <b>Comando de Voz aceito!</b><br>Navegando para: <b>${place.display_name}</b>`);
                            }
                        }
                    }).catch(() => {});
                }
            }
        };
        recognition.start();
        isRadarActive = true;

        if (typeof addMessage === 'function') {
            addMessage('bot', '🎤 <b>MODO SIRI ATIVADO!</b><br>Diga "Matrix, me leve até [local]" e eu te levo no mapa 3D.');
        }
    } else {
        alert("Seu navegador não suporta comandos de voz.");
    }

    // 2. Radar de Localização (Se movimentar no mapa)
    if (navigator.geolocation) {
        matrixRadarInterval = setInterval(() => {
            navigator.geolocation.getCurrentPosition((pos) => {
                currentUserPosition = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                // Se o mapa 3D estiver aberto, centraliza nele
                if (typeof map !== 'undefined' && map) {
                    map.flyTo({ center: [currentUserPosition.lng, currentUserPosition.lat], zoom: 16, pitch: 60 });
                }
            }, null, { enableHighAccuracy: true, timeout: 3000 });
        }, 10000); // Atualiza o radar a cada 10 segundos
    }
};

// Desativar o radar se o usuário sair da página
window.addEventListener('beforeunload', function() {
    if (matrixRadarInterval) clearInterval(matrixRadarInterval);
});

console.log("🛰️ Sistema de Radar e Voz Matrix carregado. Digite no chat: /ativar_radar para ligar.");
