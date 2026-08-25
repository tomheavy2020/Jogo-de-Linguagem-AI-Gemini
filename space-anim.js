const canvas = document.getElementById('spaceCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Estrelas em 3D (Efeito Hiperespaço)
let stars = [];
for (let i = 0; i < 350; i++) {
    stars.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: (Math.random() - 0.5) * 2000
    });
}

// Naves Espaciais padrão (Triângulos)
let standardShips = [];
for (let i = 0; i < 6; i++) {
    standardShips.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speedX: (Math.random() - 0.5) * 5,
        speedY: (Math.random() - 0.5) * 5,
        color: Math.random() > 0.5 ? '#ff0000' : '#00ffff',
        size: 10 + Math.random() * 10
    });
}

// 🔥 Array de Naves Customizadas (para as imagens do usuário)
let customShips = [];

// Função chamada pelo script.js para adicionar uma nova nave customizada
window.addUserShip = function(imageUrl) {
    const img = new Image();
    img.onload = function() {
        customShips.push({
            img: img,
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speedX: (Math.random() - 0.5) * 4,
            speedY: (Math.random() - 0.5) * 4,
            angle: 0,
            size: 40 // Tamanho base
        });
        console.log("🚀 Nave customizada adicionada!");
    };
    img.onerror = function() {
        console.error("Erro ao carregar a imagem da nave.");
    };
    img.src = imageUrl;
};

// Raios Laser
let lasers = [];
function fireLaser() {
    if (lasers.length < 25) {
        lasers.push({
            x: Math.random() * canvas.width,
            y: 0,
            speedY: 8 + Math.random() * 6,
            color: Math.random() > 0.5 ? '#00ff00' : '#ffff00'
        });
    }
}
setInterval(fireLaser, 200);

function drawStars() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
        star.z -= 3;
        if (star.z < -2000) star.z = 2000;

        const k = 200 / star.z;
        const sx = star.x * k + canvas.width / 2;
        const sy = star.y * k + canvas.height / 2;
        const size = Math.abs(k) * 1.5;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(size, 0.5), 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawShips() {
    // Desenha as naves padrão (triângulos)
    standardShips.forEach(ship => {
        ship.x += ship.speedX;
        ship.y += ship.speedY;

        if (ship.x > canvas.width + 100) ship.x = -100;
        if (ship.x < -100) ship.x = canvas.width + 100;
        if (ship.y > canvas.height + 100) ship.y = -100;
        if (ship.y < -100) ship.y = canvas.height + 100;

        ctx.fillStyle = ship.color;
        ctx.beginPath();
        ctx.moveTo(ship.x, ship.y - ship.size);
        ctx.lineTo(ship.x - ship.size/2, ship.y + ship.size/2);
        ctx.lineTo(ship.x + ship.size/2, ship.y + ship.size/2);
        ctx.closePath();
        ctx.fill();
    });

    // 🔥 Desenha as naves customizadas (com a imagem do usuário)
    customShips.forEach(ship => {
        ship.x += ship.speedX;
        ship.y += ship.speedY;

        // Rebater nas bordas
        if (ship.x > canvas.width + 50) ship.x = -50;
        if (ship.x < -50) ship.x = canvas.width + 50;
        if (ship.y > canvas.height + 50) ship.y = -50;
        if (ship.y < -50) ship.y = canvas.height + 50;

        // Calcula o ângulo de rotação baseado na direção da velocidade
        ship.angle = Math.atan2(ship.speedY, ship.speedX);

        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.angle);

        // 🔥 Efeito de Brilho Neon na nave customizada
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#00ff00';

        // Desenha a imagem centralizada
        const size = ship.size;
        ctx.drawImage(ship.img, -size/2, -size/2, size, size);
        ctx.restore();
        ctx.shadowBlur = 0;
    });
}

function drawLasers() {
    lasers = lasers.filter(laser => laser.y < canvas.height);
    lasers.forEach(laser => {
        laser.y += laser.speedY;
        ctx.fillStyle = laser.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = laser.color;
        ctx.fillRect(laser.x, laser.y, 4, 20);
    });
    ctx.shadowBlur = 0;
}

function animate() {
    drawStars();
    drawShips();
    drawLasers();
    requestAnimationFrame(animate);
}

animate();
