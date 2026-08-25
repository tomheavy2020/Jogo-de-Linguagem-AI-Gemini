import re

arquivo = "index.html"
with open(arquivo, 'r', encoding='utf-8') as f:
    conteudo = f.read()

# 1. INSERIR O CANVAS DO CUBO DE VOLTA (se não existir)
if '<canvas id="cube-3d">' not in conteudo:
    conteudo = re.sub(r'(<body[^>]*>)', r'\1\n<canvas id="cube-3d"></canvas>', conteudo, count=1, flags=re.IGNORECASE)
    print("✅ Canvas do cubo inserido no HTML.")

# 2. RECRIAR O JAVASCRIPT DO CUBO (se a função original não existir mais)
if 'function drawCube' not in conteudo and 'cube-3d' in conteudo:
    cubo_js = """
    <script>
        // Código para desenhar o cubo 3D rodando no fundo
        const canvasCubo = document.getElementById('cube-3d');
        if (canvasCubo) {
            const ctxCubo = canvasCubo.getContext('2d');
            let anguloX = 0, anguloY = 0;

            function resizeCubo() {
                canvasCubo.width = window.innerWidth;
                canvasCubo.height = window.innerHeight;
            }
            resizeCubo();
            window.addEventListener('resize', resizeCubo);

            function desenharCubo() {
                ctxCubo.clearRect(0, 0, canvasCubo.width, canvasCubo.height);
                const cx = canvasCubo.width / 2;
                const cy = canvasCubo.height / 2;
                const size = Math.min(canvasCubo.width, canvasCubo.height) * 0.35;

                // Projeção 3D simplificada
                const pontos = [
                    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
                    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
                ];

                const rotacaoX = [[1,0,0],[0,Math.cos(anguloX),-Math.sin(anguloX)],[0,Math.sin(anguloX),Math.cos(anguloX)]];
                const rotacaoY = [[Math.cos(anguloY),0,Math.sin(anguloY)],[0,1,0],[-Math.sin(anguloY),0,Math.cos(anguloY)]];

                let proj = pontos.map(p => {
                    let x = rotacaoY[0][0]*p[0] + rotacaoY[0][1]*p[1] + rotacaoY[0][2]*p[2];
                    let y = rotacaoY[1][0]*p[0] + rotacaoY[1][1]*p[1] + rotacaoY[1][2]*p[2];
                    let z = rotacaoY[2][0]*p[0] + rotacaoY[2][1]*p[1] + rotacaoY[2][2]*p[2];

                    let x2 = rotacaoX[0][0]*x + rotacaoX[0][1]*y + rotacaoX[0][2]*z;
                    let y2 = rotacaoX[1][0]*x + rotacaoX[1][1]*y + rotacaoX[1][2]*z;
                    let z2 = rotacaoX[2][0]*x + rotacaoX[2][1]*y + rotacaoX[2][2]*z;

                    return [cx + x2 * size, cy + y2 * size, z2];
                });

                // Desenhar as arestas verdes
                ctxCubo.strokeStyle = 'rgba(0, 255, 65, 0.4)';
                ctxCubo.lineWidth = 1.5;
                const arestas = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];

                arestas.forEach(([a,b]) => {
                    ctxCubo.beginPath();
                    ctxCubo.moveTo(proj[a][0], proj[a][1]);
                    ctxCubo.lineTo(proj[b][0], proj[b][1]);
                    ctxCubo.stroke();
                });

                anguloX += 0.01;
                anguloY += 0.015;
                requestAnimationFrame(desenharCubo);
            }
            desenharCubo();
        }
    </script>
    """
    conteudo += cubo_js
    print("✅ Função JavaScript do cubo recriada.")

# 3. CORRIGIR CSS: CUBO NO FUNDO, SEM OCUPAR ESPAÇO, SEM BLOQUEAR CLIQUES
conteudo += """
<style>
    /* CUBO 3D: FICA NO FUNDO, SEM OCUPAR ESPAÇO */
    #cube-3d, canvas {
        position: fixed !important;
        top: 0;
        left: 0;
        width: 100% !important;
        height: 100% !important;
        z-index: 0 !important;
        display: block !important;
        visibility: visible !important;
        pointer-events: none !important; /* NÃO BLOQUEIA CLIQUES */
    }

    /* PUXA OS CARDS PARA CIMA E COLOCA NA FRENTE DO CUBO */
    .cards, .game-grid, .card-grid, .app-grid, .grid, .modules, .hub-content, .container {
        margin-top: -180px !important;
        padding-top: 0px !important;
        position: relative !important;
        z-index: 999 !important;
    }

    /* TIRA A ALTURA QUE O CANVAS OCUPAVA */
    .main-content, .content, .dashboard, .game-hub, #app {
        height: auto !important;
        min-height: auto !important;
        margin-top: 0px !important;
        padding-top: 0px !important;
    }
</style>
"""

with open(arquivo, 'w', encoding='utf-8') as f:
    f.write(conteudo)

print("✅ Cubo 3D invisível no fundo criado, girando atrás dos cards!")
