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
  let alpha = 0, beta = 0;
  let satAzimuth = 0, satElevation = 0;
  let isTracking = false;
  let cameraReady = false;

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

  async function fetchSatelliteData() {
    const url = `/api/satpos?satid=${currentSatId}&lat=${userLat}&lng=${userLng}&seconds=1`;
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

  function startTracking() {
    if(!cameraReady) { alert("Aguardando a câmera..."); return; }
    isTracking = true;
    trackBtn.innerText = "RASTREANDO...";

    fetchSatelliteData();
    fetchNextPassage();

    function updateAR() {
      if(!isTracking) return;
      if(compassNeedle) compassNeedle.style.transform = `rotate(${satAzimuth}deg)`;

      const diff = satAzimuth - alpha;
      const elevationDiff = satElevation - beta;

      if(marker) {
        if(Math.abs(diff) < 10 && Math.abs(elevationDiff) < 10) {
          marker.classList.add('visible');
        } else {
          marker.classList.remove('visible');
        }
      }
      requestAnimationFrame(updateAR);
    }
    updateAR();
  }

  async function fetchNextPassage() {
    const url = `/api/satpos/passes?satid=${currentSatId}&lat=${userLat}&lng=${userLng}&days=5`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if(data.passes && data.passes.length > 0) {
        const pass = data.passes[0];
        const date = new Date(pass.startUTC * 1000);
        if(passEl) passEl.innerText = date.toLocaleTimeString('pt-BR');
      } else {
        if(passEl) passEl.innerText = "Sem previsão";
      }
    } catch (e) { if(passEl) passEl.innerText = "Erro"; }
  }

  function initModule() {
    initCamera();
    initSensors();
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        userLat = pos.coords.latitude;
        userLng = pos.coords.longitude;
      }, () => {}, { enableHighAccuracy: true });
    }
  }

  if(trackBtn) trackBtn.addEventListener('click', startTracking);
  if(satSelect) {
    satSelect.addEventListener('change', () => {
      currentSatId = satSelect.value;
      if(isTracking) { fetchSatelliteData(); fetchNextPassage(); }
    });
  }

  initModule();

  window.__satCleanup = function() {
    isTracking = false;
    if(video && video.srcObject) {
      video.srcObject.getTracks().forEach(t => t.stop());
      video.srcObject = null;
    }
  };
})();
