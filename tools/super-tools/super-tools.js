(() => {
  const tabs = document.querySelectorAll('.tools-tab');
  const panels = {
    compass: document.getElementById('panel-compass'),
    flashlight: document.getElementById('panel-flashlight'),
    level: document.getElementById('panel-level')
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      Object.keys(panels).forEach(k => panels[k].style.display = k === tab.dataset.tool ? 'flex' : 'none');
    });
  });

  const needle = document.getElementById('compass-needle');
  const degreesEl = document.getElementById('compass-degrees');
  function handleOrientation(e) {
    if(e.webkitCompassHeading) {
      const heading = e.webkitCompassHeading;
      needle.style.transform = `rotate(${heading}deg)`;
      const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
      const idx = Math.round(heading / 45) % 8;
      degreesEl.textContent = `${Math.round(heading)}° ${dirs[idx]}`;
    }
  }
  window.addEventListener('deviceorientation', handleOrientation);

  const flashBtn = document.getElementById('flash-btn');
  let flashTrack = null;
  flashBtn.addEventListener('click', async () => {
    if(!navigator.mediaDevices) { alert('Lanterna não suportada neste dispositivo.'); return; }
    try {
      if(!flashTrack) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        flashTrack = stream.getVideoTracks()[0];
        const capabilities = flashTrack.getCapabilities();
        if(!capabilities.torch) { alert('Flash não suportado.'); flashTrack.stop(); flashTrack = null; return; }
        await flashTrack.applyConstraints({ advanced: [{ torch: true }] });
        flashBtn.classList.add('on'); flashBtn.textContent = 'DESLIGAR';
      } else {
        await flashTrack.applyConstraints({ advanced: [{ torch: false }] });
        flashTrack.stop(); flashTrack = null;
        flashBtn.classList.remove('on'); flashBtn.textContent = 'LIGAR';
      }
    } catch(err) {
      alert('Erro ao acessar a câmera. Permita o acesso.');
    }
  });

  const bubble = document.getElementById('level-bubble');
  const status = document.getElementById('level-status');
  if(window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', (e) => {
      const x = e.accelerationIncludingGravity.x || 0;
      const y = e.accelerationIncludingGravity.y || 0;
      const box = document.querySelector('.level-box');
      const boxRect = box.getBoundingClientRect();
      const bubbleSize = 30;
      const maxOffset = (boxRect.width / 2) - (bubbleSize / 2);
      let nx = Math.max(-1, Math.min(1, x / 9.8));
      let ny = Math.max(-1, Math.min(1, y / 9.8));
      const posX = 50 + (nx * 40);
      const posY = 50 + (ny * 40);
      bubble.style.left = posX + '%';
      bubble.style.top = posY + '%';
      if(Math.abs(nx) < 0.05 && Math.abs(ny) < 0.05) {
        status.textContent = '✅ NIVELADO'; status.style.color = '#00ff41';
      } else {
        status.textContent = '🔴 INCLINADO'; status.style.color = '#ff3333';
      }
    });
  } else {
    status.textContent = 'Nível não suportado.';
  }

  window.__superToolsCleanup = function() {
    window.removeEventListener('deviceorientation', handleOrientation);
    if(flashTrack) { flashTrack.stop(); flashTrack = null; }
  };
})();
