// 🔥 MATRIX CHAT E SISTEMA DE VOZ (Módulo Reintegrado)
// Isso roda ao lado do mapa e do chat principal

let matrixVoiceActive = false;
let matrixRecognition = null;

// 1. INICIAR O MODO SIRI (Ouvir o usuário)
window.startMatrixVoice = function() {
    if (matrixVoiceActive) {
        console.log("👾 Voz Matrix já está ativa.");
        return;
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        matrixRecognition = new SpeechRecognition();
        matrixRecognition.lang = 'pt-BR';
        matrixRecognition.continuous = true;
        matrixRecognition.interimResults = true;

        matrixRecognition.onstart = function() {
            matrixVoiceActive = true;
            if (typeof addMessage === 'function') {
                addMessage('bot', '🎤 <b>SIRI MATRIX ATIVADA!</b><br>Fale algo como: "Matrix, me leve até a praia".');
            }
        };

        matrixRecognition.onresult = function(event) {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }

            const lowerText = finalTranscript.toLowerCase();
            // Detectar comandos de navegação
            if (lowerText.includes("matrix") || lowerText.includes("leva")) {
                let destino = lowerText.replace("matrix", "").replace("leva", "").replace("para", "").replace("até", "").trim();
                if (destino.length > 3) {
                    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destino)}&limit=1`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.length > 0) {
                            const place = data[0];
                            // Envia comando para o mapa
                            window.postMessage({
                                type: 'matrix_navigation',
                                lat: parseFloat(place.lat),
                                lng: parseFloat(place.lon),
                                name: place.display_name
                            }, '*');
                            if (typeof addMessage === 'function') {
                                addMessage('bot', `🎯 <b>Navegando para:</b> ${place.display_name}`);
                            }
                        }
                    }).catch(() => {});
                }
            }
        };

        matrixRecognition.onerror = function() {
            matrixVoiceActive = false;
        };

        matrixRecognition.start();
    } else {
        if (typeof addMessage === 'function') {
            addMessage('bot', '❌ Seu navegador não suporta comandos de voz.');
        }
    }
};

// 2. PARAR O SISTEMA DE VOZ
window.stopMatrixVoice = function() {
    if (matrixRecognition) {
        matrixRecognition.stop();
        matrixVoiceActive = false;
        if (typeof addMessage === 'function') {
            addMessage('bot', '🔇 Siri Matrix desativada.');
        }
    }
};

console.log("🧠 Módulo Matrix Voice carregado. Digite /siri para ativar.");
