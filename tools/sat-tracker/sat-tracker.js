(() => {
  'use strict';

  const video = document.getElementById('ar-camera');
  const marker = document.getElementById('satMarker');
  const compassNeedle = document.getElementById('compassNeedle');
  const latEl = document.getElementById('sat-lat');
  const lngEl = document.getElementById('sat-lng');
  const altEl = document.getElementById('sat-alt');
  const passEl = document.getElementById('sat-pass');
  const trackBtn = document.getElementById('sat-track-btn');
  const satSelect = document.getElementById('sat-select');

  let userLat = -15.79, userLng = -47.88;
  let currentSatId = 25544;
  let alpha = 0, beta = 0; // Sensores do celular
  let satAzimuth = 0, satElevation = 0;
  let isTracking = false;
  let cameraReady = false;

  // 🔥 1. LIGAR A CÂMARA DO CELULAR
  async function initCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      video.srcObject = stream;
      await video.play();
      cameraReady = true;
    } catch (err) {
      alert("Permita o acesso à câmera para usar o rastreador AR.");
    }
  }

  // 🔥 2. LER OS SENSORES DO CELULAR (BÚSSOLA E INCLINAÇÃO)
  function initSensors() {
    if(window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        if(e.alpha !== null) {
          alpha = e.alpha || 0;
          beta = e.beta || 0;
        }
      });
    }
  }

  // 🔥 3. BUSCAR DADOS DO SATÉLITE NA API N2YO
  async function fetchSatelliteData() {
    const url = `https://api.n2yo.com/rest/v1/satellite/positions/${currentSatId}/${userLat}/${userLng}/0/1/&apiKey=B6GHQ6-XG2J4X-BK77S4-4NZ9`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if(data.positions && data.positions.length > 0) {
        const pos = data.positions[0];
        satAzimuth = pos.azimuth;
        satElevation = pos.elevation;
        latEl.innerText = pos.satlatitude.toFixed(4);
        lngEl.innerText = pos.satlongitude.toFixed(4);
        altEl.innerText = Math.round(pos.sataltitude) + ' km';
        return pos;
      }
    } catch (e) { console.error(e); }
    return null;
  }

  // 🔥 4. LÓGICA DE RASTREAMENTO AR (CÂMERA + BÚSSOLA + MARCADOR)
  function startTracking() {
    if(!cameraReady) { alert("Aguardando a câmera..."); return; }
    isTracking = true;
    trackBtn.innerText = "🛰️ RASTREANDO...";

    // Busca a posição do satélite e calcula a próxima passagem
    fetchSatelliteData();
    fetchNextPassage();

    // Atualiza a bússola e o marcador a cada frame
    function updateAR() {
      if(!isTracking) return;

      // Atualiza a agulha da bússola
      compassNeedle.style.transform = `rotate(${satAzimuth}deg)`;

      // Lógica do Marcador AR (Aponta para o satélite)
      const diff = satAzimuth - alpha;
      const elevationDiff = satElevation - beta;

      if(Math.abs(diff) < 10 && Math.abs(elevationDiff) < 10) {
        marker.classList.add('visible');
      } else {
        marker.classList.remove('visible');
      }
      requestAnimationFrame(updateAR);
    }
    updateAR();
  }

  // 🔥 5. CALCULAR A PRÓXIMA PASSAGEM VISÍVEL
  async function fetchNextPassage() {
    const url = `https://api.n2yo.com/rest/v1/satellite/visualpasses/${currentSatId}/${userLat}/${userLng}/5/1/&apiKey=B6GHQ6-XG2J4X-BK77S4-4NZ9`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if(data.passes && data.passes.length > 0) {
        const pass = data.passes[0];
        const date = new Date(pass.startUTC * 1000);
        passEl.innerText = date.toLocaleTimeString('pt-BR');
      } else {
        passEl.innerText = "Sem previsão";
      }
    } catch (e) { passEl.innerText = "Erro"; }
  }

  // 🔥 6. INICIALIZAÇÃO DO MÓDULO
  function initModule() {
    initCamera();
    initSensors();

    // Pega localização do usuário
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        userLat = pos.coords.latitude;
        userLng = pos.coords.longitude;
      }, () => {}, { enableHighAccuracy: true });
    }
  }

  trackBtn.addEventListener('click', startTracking);
  satSelect.addEventListener('change', () => {
    currentSatId = satSelect.value;
    if(isTracking) { fetchSatelliteData(); fetchNextPassage(); }
  });

  initModule();

  window.__satCleanup = function() {
    isTracking = false;
    if(video.srcObject) {
      video.srcObject.getTracks().forEach(t => t.stop());
      video.srcObject = null;
    }
  };
})();
