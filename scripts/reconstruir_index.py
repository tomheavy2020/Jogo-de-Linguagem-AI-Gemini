import re

# 1. LER O ARQUIVO ORIGINAL COM OS CARDS
with open("index-old.html", 'r', encoding='utf-8') as f:
    conteudo = f.read()

# 2. APAGAR A BARRA DE PESQUISA
conteudo = re.sub(r'<div[^>]*class=["\'][^"\']*(search|pesquisa|search-bar|search-wrapper)[^"\']*["\'][^>]*>.*?</div>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)
conteudo = re.sub(r'<input[^>]*placeholder=["\'][^"\']*(Buscar|Search|Pesquisar)[^"\']*["\'][^>]*>', '', conteudo, flags=re.IGNORECASE)

# 3. ADICIONAR O CUBO 3D GIRANDO NO FUNDO
# A) Insere o canvas no início do body
conteudo = re.sub(r'(<body[^>]*>)', r'\1\n<canvas id="cube-3d"></canvas>', conteudo, count=1, flags=re.IGNORECASE)

# B) Adicionar o JavaScript do cubo (com animação fluida, projetada para 3D real)
conteudo += """
    <script>
        // ==== CUBO 3D PERFEITO ====
        const canvasCubo = document.getElementById('cube-3d');
        if (canvasCubo) {
            const ctxCubo = canvasCubo.getContext('2d');
            let anguloX = 0.5;
            let anguloY = 0.5;

            function resizeCubo() {
                canvasCubo.width = window.innerWidth;
                canvasCubo.height = window.innerHeight;
            }
            resizeCubo();
            window.addEventListener('resize', resizeCubo);

            // Pontos do cubo
            const pontos = [
                [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
                [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
            ];

            // Arestas do cubo
            const arestas = [
                [0,1], [1,2], [2,3], [3,0],
                [4,5], [5,6], [6,7], [7,4],
                [0,4], [1,5], [2,6], [3,7]
            ];

            function desenharCubo() {
                ctxCubo.clearRect(0, 0, canvasCubo.width, canvasCubo.height);
                const cx = canvasCubo.width / 2;
                const cy = canvasCubo.height / 2;
                const size = Math.min(canvasCubo.width, canvasCubo.height) * 0.4;

                // Rotação X
                const cosX = Math.cos(anguloX), sinX = Math.sin(anguloX);
                // Rotação Y
                const cosY = Math.cos(anguloY), sinY = Math.sin(anguloY);

                const projecoes = pontos.map(p => {
                    // Rotação em X
                    let y1 = p[1] * cosX - p[2] * sinX;
                    let z1 = p[1] * sinX + p[2] * cosX;

                    // Rotação em Y
                    let x2 = p[0] * cosY - z1 * sinY;
                    let z2 = p[0] * sinY + z1 * cosY;

                    return [cx + x2 * size, cy + y1 * size, z2];
                });

                // Desenhar arestas
                ctxCubo.strokeStyle = 'rgba(0, 255, 65, 0.4)';
                ctxCubo.lineWidth = 2;
                ctxCubo.beginPath();
                arestas.forEach(([a, b]) => {
                    ctxCubo.moveTo(projecoes[a][0], projecoes[a][1]);
                    ctxCubo.lineTo(projecoes[b][0], projecoes[b][1]);
                });
                ctxCubo.stroke();

                // Desenhar pontos
                ctxCubo.fillStyle = 'rgba(0, 255, 65, 0.8)';
                projecoes.forEach(p => {
                    ctxCubo.beginPath();
                    ctxCubo.arc(p[0], p[1], 3, 0, 2 * Math.PI);
                    ctxCubo.fill();
                });

                // Aumentar ângulos para girar
                anguloX += 0.01;
                anguloY += 0.015;
                requestAnimationFrame(desenharCubo);
            }
            desenharCubo();
        }
    </script>
"""

# 4. ADICIONAR CSS PERFEITO (Puxar cards, esconder busca, esconder cabeçalho)
conteudo += """
<style>
    /* Esconde barra de pesquisa */
    .search, .search-bar, .search-wrapper, .search-input, .pesquisa {
        display: none !important;
        visibility: hidden !important;
        height: 0px !important;
        width: 0px !important;
        margin: 0px !important;
        padding: 0px !important;
        z-index: -100 !important;
    }

    /* Cubo 3D no fundo, sem bloquear cliques */
    #cube-3d {
        position: fixed !important;
        top: 0;
        left: 0;
        width: 100% !important;
        height: 100% !important;
        z-index: 0 !important;
        display: block !important;
        visibility: visible !important;
        pointer-events: none !important;
    }

    /* Puxa os cards para cima */
    .cards, .game-grid, .card-grid, .app-grid, .grid, .modules, .hub-content, .container {
        margin-top: -200px !important;
        padding-top: 0px !important;
        position: relative !important;
        z-index: 999 !important;
    }

    /* Tira altura de elementos que empurram para baixo */
    .main-content, .content, .dashboard, .game-hub, #app {
        height: auto !important;
        min-height: auto !important;
        margin-top: 0px !important;
        padding-top: 0px !important;
    }

    /* Esconde cabeçalho gigante */
    .header, .back, .close-btn, .top-bar, .navbar {
        display: none !important;
        visibility: hidden !important;
        position: static !important;
        opacity: 0 !important;
        height: 0px !important;
        overflow: hidden !important;
    }
</style>
"""

# 5. SALVAR ARQUIVO
with open("index.html", 'w', encoding='utf-8') as f:
    f.write(conteudo)

print("✅ SUCESSO TOTAL!")
print("1. Base restaurada a partir do index-old.html (com os cards).")
print("2. Barra de pesquisa escondida.")
print("3. Cubo 3D real adicionado e girando no fundo.")
print("4. Cards puxados para cima.")
print("5. Cabeçalho gigante escondido.")
