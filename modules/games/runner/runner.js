(function() {
  'use strict';
  const canvas = document.getElementById('runner-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('runner-score');
  const livesEl = document.getElementById('runner-lives');
  const overlay = document.getElementById('runner-overlay');

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const TILE = 32;
  let W, H, cols, rows;
  let animId;
  let lastTime = 0;
  let score = 0;
  let lives = 3;
  let gameOver = false;
  let player = { x: 2, y: 2, vx: 0, vy: 0, onGround: false, dir: 1 };
  let platforms = [];
  let enemies = [];
  let coins = [];
  let particles = [];

  function resize() {
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(W / TILE);
    rows = Math.ceil(H / TILE);
  }

  function buildLevel() {
    platforms = []; enemies = []; coins = [];
    for (let c = 0; c < cols; c++) platforms.push({ x: c, y: rows - 1, type: 'ground' });
    [rows - 4, rows - 7, rows - 10].forEach((row, i) => {
      const start = i % 2 === 0 ? 2 : cols - 8;
      for (let c = 0; c < 6; c++) platforms.push({ x: start + c, y: row, type: 'brick' });
    });
    enemies = [
      { x: 8, y: rows - 2, vx: 0.06, dir: -1 },
      { x: cols - 4, y: rows - 5, vx: 0.05, dir: 1 }
    ];
    for (let i = 0; i < 8; i++) {
      coins.push({
        x: 2 + Math.floor(Math.random() * (cols - 4)),
        y: rows - 2 - Math.floor(Math.random() * 8),
        collected: false, bob: Math.random() * Math.PI * 2
      });
    }
    player = { x: 2, y: rows - 2, vx: 0, vy: 0, onGround: false, dir: 1 };
    score = 0; lives = 3; gameOver = false;
    updateHUD(); overlay.style.display = 'none';
  }

  function updateHUD() {
    scoreEl.textContent = `SCORE: ${score.toString().padStart(4, '0')}`;
    livesEl.textContent = '♥'.repeat(lives);
  }

  function rectAt(tx, ty) { return platforms.some(p => p.x === tx && p.y === ty); }

  function update(dt) {
    if (gameOver) return;
    player.vy += 0.025 * dt;
    if (player.vy > 0.8) player.vy = 0.8;
    player.x += player.vx * dt;
    if (rectAt(Math.floor(player.x), Math.floor(player.y))) {
      player.x = Math.round(player.x); player.vx = 0;
    }
    player.y += player.vy * dt;
    player.onGround = false;
    const py = Math.floor(player.y + 0.95);
    if (rectAt(Math.floor(player.x), py) && player.vy >= 0) {
      player.y = py - 1; player.vy = 0; player.onGround = true;
    }
    if (player.x < 0) player.x = 0;
    if (player.x > cols - 1) player.x = cols - 1;
    if (player.y > rows) { loseLife(); }

    enemies.forEach(e => {
      e.x += e.vx * e.dir * dt;
      if (e.x <= 1 || e.x >= cols - 2 || rectAt(Math.floor(e.x + e.dir), Math.floor(e.y))) e.dir *= -1;
      if (Math.abs(e.x - player.x) < 0.8 && Math.abs(e.y - player.y) < 0.8) loseLife();
    });

    coins.forEach(c => {
      if (c.collected) return;
      c.bob += dt * 0.005;
      if (Math.abs(c.x - player.x) < 0.6 && Math.abs(c.y - player.y) < 0.8) {
        c.collected = true; score += 100; updateHUD();
        spawnParticles(c.x, c.y, '#00f0ff');
      }
    });
    particles.forEach(p => {
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; p.vy += 0.001 * dt;
    });
    particles = particles.filter(p => p.life > 0);
  }

  function loseLife() {
    lives--; updateHUD(); spawnParticles(player.x, player.y, '#ff3333');
    if (lives <= 0) { gameOver = true; overlay.style.display = 'flex'; }
    else { player.x = 2; player.y = rows - 2; player.vx = 0; player.vy = 0; }
  }

  function spawnParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
      particles.push({
        x: x + 0.5, y: y + 0.5,
        vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15,
        life: 400 + Math.random() * 300, color
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.04)'; ctx.lineWidth = 1;
    for (let c = 0; c <= cols; c++) { ctx.beginPath(); ctx.moveTo(c * TILE, 0); ctx.lineTo(c * TILE, H); ctx.stroke(); }
    for (let r = 0; r <= rows; r++) { ctx.beginPath(); ctx.moveTo(0, r * TILE); ctx.lineTo(W, r * TILE); ctx.stroke(); }

    platforms.forEach(p => {
      const px = p.x * TILE, py = p.y * TILE;
      if (p.type === 'ground') {
        ctx.fillStyle = '#0d2b0d'; ctx.fillRect(px, py, TILE, TILE);
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.25)'; ctx.strokeRect(px + 2, py + 2, TILE - 4, TILE - 4);
      } else {
        ctx.fillStyle = '#1a1a1a'; ctx.fillRect(px, py, TILE, TILE / 2);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)'; ctx.strokeRect(px + 1, py + 1, TILE - 2, TILE / 2 - 2);
      }
    });

    coins.forEach(c => {
      if (c.collected) return;
      const bob = Math.sin(c.bob) * 3;
      ctx.fillStyle = '#00f0ff'; ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(c.x * TILE + TILE/2, c.y * TILE + TILE/2 + bob, 5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    });

    enemies.forEach(e => {
      ctx.fillStyle = '#ff3333'; ctx.shadowColor = '#ff3333'; ctx.shadowBlur = 8;
      ctx.fillRect(e.x * TILE + 6, e.y * TILE + 4, TILE - 12, TILE - 8); ctx.shadowBlur = 0;
    });

    ctx.fillStyle = '#00ff41'; ctx.shadowColor = '#00ff41'; ctx.shadowBlur = 12;
    const px = player.x * TILE + 4; const py = player.y * TILE + 2;
    ctx.fillRect(px, py, TILE - 8, TILE - 4);
    ctx.fillStyle = '#000'; ctx.shadowBlur = 0;
    ctx.fillRect(px + (player.dir > 0 ? 14 : 4), py + 4, 4, 4);
    ctx.fillRect(px + (player.dir > 0 ? 20 : 10), py + 4, 4, 4);

    particles.forEach(p => {
      ctx.globalAlpha = Math.max(0, p.life / 500);
      ctx.fillStyle = p.color; ctx.fillRect(p.x * TILE, p.y * TILE, 3, 3);
    });
    ctx.globalAlpha = 1;
  }

  function loop(ts) {
    const dt = ts - lastTime; lastTime = ts;
    update(Math.min(dt, 50)); draw();
    animId = requestAnimationFrame(loop);
  }

  function onLeft(down)  { player.vx = down ? -0.12 : 0; if (down) player.dir = -1; }
  function onRight(down) { player.vx = down ? 0.12 : 0; if (down) player.dir = 1; }
  function onJump()      { if (player.onGround) player.vy = -0.45; }

  const btnLeft  = document.getElementById('btn-left');
  const btnRight = document.getElementById('btn-right');
  const btnJump  = document.getElementById('btn-jump');
  const btnRestart = document.getElementById('btn-restart');

  const addBtn = (el, cbDown, cbUp) => {
    el.addEventListener('mousedown',  (e) => { e.preventDefault(); cbDown(true); });
    el.addEventListener('mouseup',    () => cbDown(false));
    el.addEventListener('mouseleave', () => cbDown(false));
    el.addEventListener('touchstart', (e) => { e.preventDefault(); cbDown(true); }, {passive:false});
    el.addEventListener('touchend',   () => cbDown(false));
  };
  addBtn(btnLeft,  onLeft,  onLeft);
  addBtn(btnRight, onRight, onRight);
  btnJump.addEventListener('click', onJump);
  btnJump.addEventListener('touchstart', (e) => { e.preventDefault(); onJump(); }, {passive:false});

  const keys = {};
  window.addEventListener('keydown', e => {
    if (keys[e.code]) return; keys[e.code] = true;
    if (e.code === 'ArrowLeft'  || e.code === 'KeyA') onLeft(true);
    if (e.code === 'ArrowRight' || e.code === 'KeyD') onRight(true);
    if (e.code === 'ArrowUp'    || e.code === 'KeyW' || e.code === 'Space') onJump();
  });
  window.addEventListener('keyup', e => {
    keys[e.code] = false;
    if (e.code === 'ArrowLeft'  || e.code === 'KeyA') onLeft(false);
    if (e.code === 'ArrowRight' || e.code === 'KeyD') onRight(false);
  });

  btnRestart.addEventListener('click', () => { buildLevel(); lastTime = performance.now(); });

  resize(); buildLevel(); animId = requestAnimationFrame(loop);
  window.__runnerCleanup = () => { cancelAnimationFrame(animId); };
})();
