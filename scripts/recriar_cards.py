import re

# Ler o arquivo atual (que está vazio)
with open("index.html", 'r', encoding='utf-8') as f:
    conteudo = f.read()

# 1. Criar o HTML dos novos Cards
cards_html = """
<!-- ====== INICIO DOS CARDS ====== -->
<div class="card-container">
    <div class="game-grid">
        <div class="card">
            <div class="card-icon">&#9818;</div>
            <div class="card-title">Xadrez 3D</div>
            <div class="card-sub">3D Chess</div>
        </div>
        <div class="card">
            <div class="card-icon">&#128640;</div>
            <div class="card-title">Nave Espacial</div>
            <div class="card-sub">Space Ship</div>
        </div>
        <div class="card">
            <div class="card-icon">&#128247;</div>
            <div class="card-title">Pro Camera 360</div>
            <div class="card-sub">Camera App</div>
        </div>
        <div class="card">
            <div class="card-icon">&#128674;</div>
            <div class="card-title">Nautical Ultra</div>
            <div class="card-sub">Navigation</div>
        </div>
        <div class="card">
            <div class="card-icon">&#9876;</div>
            <div class="card-title">Matrix Arena</div>
            <div class="card-sub">Arena</div>
        </div>
        <div class="card">
            <div class="card-icon">&#127942;</div>
            <div class="card-title">Ranking</div>
            <div class="card-sub">Ranking</div>
        </div>
    </div>
</div>
<!-- ====== FIM DOS CARDS ====== -->
"""

# 2. Inserir os cards no corpo da página, logo após a barra de status
# Procuramos pela tag </body> ou pela última div principal
if 'class="card-container"' not in conteudo:
    conteudo = re.sub(r'(</body>)', cards_html + r'\1', conteudo, count=1, flags=re.IGNORECASE)
    print("✅ Cards inseridos no HTML.")

# 3. Recriar o JavaScript do Cubo 3D (se não existir)
if 'drawCube' not in conteudo:
    conteudo += """
    <script>
        // Desenha elipses girando no fundo (efeito de cubo/planeta)
        const canvasCubo = document.getElementById('cube-3d');
        if (canvasCubo) {
            const ctxCubo = canvasCubo.getContext('2d');
            let frame = 0;

            function resizeCubo() {
                canvasCubo.width = window.innerWidth;
                canvasCubo.height = window.innerHeight;
            }
            resizeCubo();
            window.addEventListener('resize', resizeCubo);

            function desenharEfeito() {
                ctxCubo.clearRect(0, 0, canvasCubo.width, canvasCubo.height);
                const cx = canvasCubo.width / 2;
                const cy = canvasCubo.height / 2;
                const size = Math.min(canvasCubo.width, canvasCubo.height) * 0.35;

                // Desenhar um anel (elipse) girando
                ctxCubo.strokeStyle = 'rgba(0, 255, 65, 0.4)';
                ctxCubo.lineWidth = 1.5;

                // Anel 1
                ctxCubo.beginPath();
                ctxCubo.ellipse(cx, cy, size, size * 0.3, frame * 0.01, 0, 2 * Math.PI);
                ctxCubo.stroke();

                // Anel 2
                ctxCubo.beginPath();
                ctxCubo.ellipse(cx, cy, size, size * 0.3, -frame * 0.02, 0, 2 * Math.PI);
                ctxCubo.stroke();

                // Anel 3 (interno)
                ctxCubo.beginPath();
                ctxCubo.ellipse(cx, cy, size * 0.6, size * 0.2, frame * 0.015, 0, 2 * Math.PI);
                ctxCubo.stroke();

                frame++;
                requestAnimationFrame(desenharEfeito);
            }
            desenharEfeito();
        }
    </script>
    """
    print("✅ Efeito de cubo girando no fundo adicionado.")

# 4. Adicionar CSS para PUXAR os cards para cima, colados nas barras, e esconder a busca
conteudo += """
<style>
    /* Esconde qualquer barra de pesquisa */
    .search, .search-bar, .search-wrapper, .search-input, .pesquisa {
        display: none !important;
        visibility: hidden !important;
        height: 0px !important;
        width: 0px !important;
        margin: 0px !important;
        padding: 0px !important;
        z-index: -100 !important;
    }

    /* Cubo/Elipses no fundo, sem bloquear cliques */
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

    /* Puxa os novos cards para cima */
    .card-container {
        margin-top: -200px !important;
        padding-top: 0px !important;
        position: relative !important;
        z-index: 999 !important;
    }

    /* Estilo dos novos cards */
    .game-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        max-width: 420px;
        margin: 0 auto;
    }

    .card {
        background: rgba(0, 10, 5, 0.85);
        border: 1px solid rgba(0, 255, 65, 0.15);
        border-radius: 16px;
        padding: 16px;
        text-align: center;
        min-height: 120px;
        box-shadow: 0 0 10px rgba(0, 255, 65, 0.1);
    }

    .card-icon {
        font-size: 26px;
        color: #00ff41;
        margin-bottom: 8px;
    }

    .card-title {
        font-family: 'Orbitron', sans-serif;
        font-size: 14px;
        color: #00ff41;
        letter-spacing: 1px;
    }

    .card-sub {
        font-family: 'Share Tech Mono', monospace;
        font-size: 10px;
        color: rgba(0, 255, 65, 0.6);
        margin-top: 4px;
    }
</style>
"""

with open("index.html", 'w', encoding='utf-8') as f:
    f.write(conteudo)

print("✅ SCRIPT CONCLUÍDO! Cards e efeito de cubo girando atrás adicionados.")
