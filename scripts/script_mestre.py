import re

# 1. RESTAURAR O ARQUIVO QUE TINHA OS CARDS
# Usando o backup que tinha a barra (e os cards) intactos
try:
    with open("backup_com_pesquisa.html", 'r', encoding='utf-8') as f:
        conteudo = f.read()
    print("✅ Backup com cards restaurado.")
except FileNotFoundError:
    print("❌ ERRO: Arquivo 'backup_com_pesquisa.html' não encontrado. Verifique se ele existe.")
    exit()

# 2. REMOVER A BARRA DE PESQUISA (Buscar módulo...)
conteudo = re.sub(r'<div[^>]*class=["\'][^"\']*(search|pesquisa|search-bar|search-wrapper)[^"\']*["\'][^>]*>\s*<input[^>]*>.*?</div>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)
conteudo = re.sub(r'<input[^>]*placeholder=["\'][^"\']*(Buscar|Search|Pesquisar)[^"\']*["\'][^>]*>', '', conteudo, flags=re.IGNORECASE)
conteudo = re.sub(r'<div[^>]*class=["\'][^"\']*(search|pesquisa|search-bar|search-wrapper)[^"\']*["\'][^>]*>.*?</div>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)
conteudo = re.sub(r'<form[^>]*class=["\'][^"\']*(search|pesquisa)[^"\']*["\'][^>]*>.*?</form>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)

# 3. TRAZER O CUBO 3D DE VOLTA (Girando no fundo)
if '<canvas id="cube-3d">' not in conteudo:
    conteudo = re.sub(r'(<body[^>]*>)', r'\1\n<canvas id="cube-3d"></canvas>', conteudo, count=1, flags=re.IGNORECASE)

# 4. RECRIAR O JAVASCRIPT DO CUBO (se não existir)
if 'drawCube' not in conteudo:
    conteudo += """
    <script>
        // Desenha o cubo 3D no fundo (invisível para cliques, sem empurrar nada)
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

# 5. CORRIGIR CSS: PUXAR CARDS PARA CIMA, CUBO NO FUNDO, SEM ESPAÇO VAZIO
conteudo += """
<style>
    /* CUBO 3D: Fica no fundo, sem empurrar nada, sem bloqueio de cliques */
    #cube-3d, canvas {
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

    /* PUXA OS CARDS PARA CIMA, COLADOS NAS BARRAS DE STATUS */
    .cards, .game-grid, .card-grid, .app-grid, .grid, .modules, .hub-content, .container {
        margin-top: -220px !important;
        padding-top: 0px !important;
        position: relative !important;
        z-index: 999 !important;
    }

    /* TIRA A ALTURA DE QUALQUER ELEMENTO QUE ESTEJA PUXANDO PARA BAIXO */
    .main-content, .content, .dashboard, .game-hub, #app {
        height: auto !important;
        min-height: auto !important;
        margin-top: 0px !important;
        padding-top: 0px !important;
    }

    /* ESCONDE AS BARRAS DE PESQUISA QUE POSSAM VOLTAR */
    .search, .search-bar, .search-wrapper, .search-input, .pesquisa {
        display: none !important;
        visibility: hidden !important;
        height: 0px !important;
        width: 0px !important;
        margin: 0px !important;
        padding: 0px !important;
        z-index: -100 !important;
    }
</style>
"""

with open("index.html", 'w', encoding='utf-8') as f:
    f.write(conteudo)

print("✅ SCRIPT MESTRE CONCLUÍDO!")
print("1. Cards restaurados.")
print("2. Barra de pesquisa remota.")
print("3. Cubo 3D girando no fundo.")
print("4. Cards puxados para cima.")
