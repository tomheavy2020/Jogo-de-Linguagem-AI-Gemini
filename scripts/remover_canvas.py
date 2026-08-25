import re

arquivo = "index.html"
with open(arquivo, 'r', encoding='utf-8') as f:
    conteudo = f.read()

# 1. APAGAR FISICAMENTE o elemento <canvas id="cube-3d"> do HTML
conteudo = re.sub(r'<canvas id="cube-3d">.*?</canvas>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)
conteudo = re.sub(r'<canvas id="cube-3d"[^>]*>', '', conteudo, flags=re.IGNORECASE)

# 2. Apagar a função JavaScript que desenha o cube-3d (linhas 908 em diante)
# Procurando por blocos que contenham getElementById('cube-3d') e removendo a função inteira
conteudo = re.sub(r'function\s+drawCube3D\s*\(.*?\)\s*\{.*?\n\}', '', conteudo, flags=re.DOTALL | re.IGNORECASE)
conteudo = re.sub(r'function\s+initCube3D\s*\(.*?\)\s*\{.*?\n\}', '', conteudo, flags=re.DOTALL | re.IGNORECASE)

# 3. Apagar qualquer script que contenha a chamada para criar o canvas novamente
conteudo = re.sub(r'const\s+canvas\s*=\s*document\.getElementById\([\'"]cube-3d[\'"]\);[^;]*;', '', conteudo)
conteudo = re.sub(r'const\s+ctx\s*=\s*canvas\.getContext\([\'"]2d[\'"]\);', '', conteudo)

# 4. PROTEÇÃO: Adicionar CSS para esconder e impedir que o canvas ocupe espaço
conteudo += """
<style>
    canvas, #cube-3d, #matrix-rain {
        display: none !important;
        visibility: hidden !important;
        position: absolute !important;
        height: 0px !important;
        width: 0px !important;
        z-index: -100 !important;
    }
    /* Puxa os cards para cima, colados na busca */
    .cards, .game-grid, .card-grid, .app-grid, .grid, .modules, .hub-content {
        margin-top: -200px !important;
        position: relative;
        z-index: 999;
    }
</style>
"""

with open(arquivo, 'w', encoding='utf-8') as f:
    f.write(conteudo)

print("✅ Canvas 3D removido fisicamente! Espaço eliminado e cards puxados para cima.")
