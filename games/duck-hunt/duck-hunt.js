(() => {
  'use strict';

  const canvas = document.getElementById('duck-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('duck-score');
  const ammoEl = document.getElementById('duck-ammo');
  const overlay = document.getElementById('duck-overlay');
  const resultMsg = document.getElementById('duck-result-msg');
  const restartBtn = document.getElementById('duck-restart-btn');

  const dpr = window.devicePixelRatio || 1;
  let W, H;
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  let score = 0, round = 1, shots = 3, maxShots = 3, gameRunning = false;
  let ducks = [];
  let animId = null;
  let isGameOver = false;

  function spawnDuck() {
    const dir = Math.random() > 0.5 ? 1 : -1;
    const speed = 1.5 + (round * 0.3);
    ducks.push({
      x: dir === 1 ? -20 : W + 20,
      y: 50 + Math.random() * (H * 0.5),
      vx: dir * (speed + Math.random()),
      vy: (Math.random() - 0.5) * 0.5,
      size: 28,
      alive: true,
      phase: Math.random() * Math.PI * 2
    });
  }

  function startRound() {
    ducks = [];
    shots = maxShots;
    gameRunning = true;
    isGameOver = false;
    overlay.style.display = 'none';
    updateHUD();
    for(let i=0; i<Math.min(round, 4); i++) { spawnDuck(); }
  }

  function updateHUD() {
    scoreEl.textContent = score.toString().padStart(4, '0');
    ammoEl.innerHTML = `⚡ ${shots}`;
  }

  function drawCrosshair(x, y) {
    ctx.strokeStyle = '#ff3333'; ctx.shadowColor = '#ff3333'; ctx.shadowBlur = 10;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 15, y); ctx.lineTo(x - 5, y); ctx.moveTo(x + 5, y); ctx.lineTo(x + 15, y);
    ctx.moveTo(x, y - 15); ctx.lineTo(x, y - 5); ctx.moveTo(x, y + 5); ctx.lineTo(x, y + 15);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function update() {
    if(!gameRunning || isGameOver) return;
    ducks.forEach(d => {
      if(!d.alive) return;
      d.x += d.vx;
      d.y += Math.sin(d.phase) * 0.3;
      d.phase += 0.05;
      if(d.x < -50 || d.x > W + 50) { d.alive = false; }
    });
    if(ducks.every(d => !d.alive)) {
      if(shots > 0) {
        round++;
        setTimeout(startRound, 600);
      } else {
        gameOver(false);
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.05)'; ctx.lineWidth = 1;
    for(let c=0; c<=W; c+=40) { ctx.beginPath(); ctx.moveTo(c,0); ctx.lineTo(c,H); ctx.stroke(); }
    for(let r=0; r<=H; r+=40) { ctx.beginPath(); ctx.moveTo(0,r); ctx.lineTo(W,r); ctx.stroke(); }
    ducks.forEach(d => {
      if(!d.alive) return;
      ctx.fillStyle = '#00ff41'; ctx.shadowColor = '#00ff41'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.ellipse(d.x, d.y, d.size, d.size*0.7, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffb000'; ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.arc(d.x - 5, d.y - 8, 4, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  function shoot(e) {
    if(!gameRunning || isGameOver || shots <= 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const y = (e.clientY - rect.top);
    shots--;
    updateHUD();
    drawCrosshair(x, y);
    let hit = false;
    ducks.forEach(d => {
      if(!d.alive) return;
      const dist = Math.hypot(x - d.x, y - d.y);
      if(dist < d.size) {
        d.alive = false;
        hit = true;
        score += 10 + (round * 5);
        updateHUD();
      }
    });
    if(shots <= 0 && !ducks.some(d => d.alive)) {
      setTimeout(() => gameOver(true), 300);
    } else if(shots <= 0) {
      gameOver(false);
    }
  }

  function gameOver(won) {
    if(isGameOver) return;
    gameRunning = false;
    isGameOver = true;
    overlay.style.display = 'flex';
    if(won) {
      resultMsg.innerText = `🎯 Patos abatidos! Próximo round: ${round+1}`;
      restartBtn.innerText = '▶ PRÓXIMA RODADA';
    } else {
      resultMsg.innerText = `💀 Munição esgotada! Score: ${score}`;
      restartBtn.innerText = '🔄 TENTAR NOVO';
    }
  }

  canvas.addEventListener('click', shoot);
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); shoot(e.touches[0]); });
  restartBtn.addEventListener('click', () => {
    if(!gameRunning && isGameOver) {
      if(restartBtn.innerText.includes('PRÓXIMA')) { round++; }
      else { score = 0; round = 1; }
      startRound();
    }
  });

  window.__duckHuntCleanup = function() {
    if(animId) cancelAnimationFrame(animId);
    canvas.removeEventListener('click', shoot);
  };

  function loop() {
    update(); draw();
    animId = requestAnimationFrame(loop);
  }
  loop();
  startRound();
})();
