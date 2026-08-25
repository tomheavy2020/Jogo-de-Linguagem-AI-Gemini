// 🔥 EASTER EGG: JOGO SPACE INVADERS
const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');

let gameRunning = false;
let gameLoop = null;
let player = { x: 150, y: 280, width: 30, height: 20, speed: 5 };
let bullets = [];
let enemies = [];
let score = 0;
let keys = { left: false, right: false };

function initGame() {
    player.x = 150;
    bullets = [];
    enemies = [];
    score = 0;
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 3; j++) {
            enemies.push({ x: 30 + j * 60, y: 30 + i * 40, width: 30, height: 30, alive: true });
        }
    }
}

function drawGame() {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Player
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    // Laser do player
    ctx.fillRect(player.x + 5, player.y + 20, 5, 10);
    ctx.fillRect(player.x + 20, player.y + 20, 5, 10);

    // Bullets
    ctx.fillStyle = '#00ff00';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, 3, 10));

    // Enemies
    enemies.forEach(e => {
        if (e.alive) {
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(e.x, e.y, e.width, e.height);
            ctx.fillStyle = '#ff0000';
            ctx.font = '20px Arial';
            ctx.fillText('👾', e.x-5, e.y+25);
        }
    });

    // Score
    ctx.fillStyle = '#00ff00';
    ctx.font = '16px Courier New';
    ctx.fillText(`Pontos: ${score}`, 10, 20);
}

function updateGame() {
    if (keys.left && player.x > 0) player.x -= player.speed;
    if (keys.right && player.x < gameCanvas.width - player.width) player.x += player.speed;

    bullets.forEach((b, idx) => {
        b.y -= 5;
        if (b.y < 0) bullets.splice(idx, 1);
    });

    enemies.forEach(e => {
        if (e.alive) {
            bullets.forEach(b => {
                if (b.x > e.x && b.x < e.x + e.width && b.y > e.y && b.y < e.y + e.height) {
                    e.alive = false;
                    score += 10;
                }
            });
        }
    });
}

function gameFrame() {
    if (!gameRunning) return;
    updateGame();
    drawGame();
    requestAnimationFrame(gameFrame);
}

// Função pública para iniciar o jogo
window.startMatrixGame = function() {
    const vidWrapper = document.getElementById('videoWrapper');
    const gameOverlay = document.getElementById('gameOverlay');
    if (!vidWrapper || !gameOverlay) return;

    vidWrapper.style.display = 'none';
    gameOverlay.style.display = 'flex';
    gameRunning = true;
    initGame();

    if (gameLoop) cancelAnimationFrame(gameLoop);
    gameLoop = requestAnimationFrame(gameFrame);
};

function stopGame() {
    gameRunning = false;
    if (gameLoop) cancelAnimationFrame(gameLoop);
    document.getElementById('videoWrapper').style.display = 'block';
    document.getElementById('gameOverlay').style.display = 'none';
}

// Comandos
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === ' ' && gameRunning) {
        bullets.push({ x: player.x + 12, y: player.y - 5 });
    }
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
});
