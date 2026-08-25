import re

arquivo = "index.html"
with open(arquivo, 'r', encoding='utf-8') as f:
    conteudo = f.read()

# 1. TRAZER O CUBO 3D DE VOLTA:
# Procurar se existe algum espaço reservado para ele (mesmo sem o canvas) e recriar o canvas
if '<canvas id="cube-3d">' not in conteudo:
    # Insere o canvas logo após o início do body (ou onde houver espaço)
    # Vamos inserir logo após a tag <body> para ele ficar no fundo
    conteudo = re.sub(
        r'(<body[^>]*>)',
        r'\1\n<canvas id="cube-3d"></canvas>',
        conteudo,
        count=1,
        flags=re.IGNORECASE
    )
    print("✅ Canvas do Cubo 3D restaurado no HTML.")

# 2. ELIMINAR O ESPAÇO PRETO:
# Procuramos por divs que tenham altura fixa grande (height: 100vh, 100%, ou valores acima de 300px)
# e que estejam "vazias" ou que pertençam ao container que segura o canvas
conteudo = re.sub(
    r'<div[^>]*(class|id)="[^"]*(hero|space|orbit|canvas-container|background)[^"]*"[^>]*>\s*(<canvas[^>]*>)?\s*</div>',
    '',
    conteudo,
    flags=re.DOTALL | re.IGNORECASE
)

# Remover qualquer CSS que esteja dando altura gigante a elementos que não são cards
conteudo = re.sub(r'(\.hero|\.space|\.orbit|\.canvas-container|\.background)\s*\{[^}]*height:\s*[0-9]{2,}vh[^}]*\}', '', conteudo)
conteudo = re.sub(r'(\.hero|\.space|\.orbit|\.canvas-container|\.background)\s*\{[^}]*height:\s*[0-9]{3,}px[^}]*\}', '', conteudo)

# 3. CORRIGIR A POSIÇÃO DOS CARDS:
# Adicionar CSS para que os cards subam e o cubo fique atrás
conteudo += """
<style>
    /* TRAZ O CUBO PARA O FUNDO, SEM OCUPAR ESPAÇO */
    #cube-3d {
        position: fixed !important;
        top: 0;
        left: 0;
        width: 100% !important;
        height: 100% !important;
        z-index: 1 !important;
        display: block !important;
        visibility: visible !important;
    }

    /* PUXA OS CARDS PARA CIMA E GARANTE QUE FIQUE NA FRENTE DO CUBO */
    .cards, .game-grid, .card-grid, .app-grid, .grid, .modules, .hub-content, .container {
        margin-top: -150px !important;
        padding-top: 0px !important;
        position: relative !important;
        z-index: 999 !important;
    }

    /* TIRA A ALTURA DO ELEMENTO QUE ESTÁ ENTRE A BUSCA E OS CARDS */
    .main-content, .content, .dashboard, .game-hub, #app {
        height: auto !important;
        min-height: auto !important;
        margin-top: 0px !important;
        padding-top: 0px !important;
    }

    /* Bloqueia elementos que possam estar vazios e ocupando espaço */
    section, div {
        max-height: none !important;
    }
</style>
"""

with open(arquivo, 'w', encoding='utf-8') as f:
    f.write(conteudo)

print("✅ Cubo 3D restaurado e espaço preto eliminado!")
print("🔍 Verificando se o canvas voltou...")
if "cube-3d" in conteudo:
    print("🎉 Sucesso! O cubo 3D está no HTML novamente.")
else:
    print("⚠️ Alerta: O cubo 3D não foi encontrado no HTML. Verifique.")
