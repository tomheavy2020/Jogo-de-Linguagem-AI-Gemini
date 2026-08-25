import re

arquivo = "index.html"
with open(arquivo, 'r', encoding='utf-8') as f:
    conteudo = f.read()

# 1. Forçar que TODOS os elementos de fundo (images, divs decorativas) fiquem com z-index NEGATIVO
# Isso faz com que tudo que é "decorativo" vá para trás dos cards
conteudo = re.sub(
    r'(\.background|\.bg|\.fundo|\.glow|\.light|\.orb|\.particles|\.stars|\.effect|\.decoration)',
    r'\1 { z-index: -1 !important; position: relative !important; }',
    conteudo
)

# 2. Forçar a grade dos cards a ter o z-index MÁXIMO (acima de tudo que é fundo)
# Procurando por classes de card, grid ou container
grid_classes = ['\.cards', '\.grid', '\.card-grid', '\.game-grid', '\.container', '\.modules']
for gc in grid_classes:
    # Procura a definição da classe no CSS e adiciona z-index alto
    conteudo = re.sub(
        rf'({gc}\s*\{{[^}}]*)\}}',
        r'\1 z-index: 999 !important; }',
        conteudo
    )

with open(arquivo, 'w', encoding='utf-8') as f:
    f.write(conteudo)

print("✅ Fundo corrigido! Elementos decorativos foram para trás dos cards.")
