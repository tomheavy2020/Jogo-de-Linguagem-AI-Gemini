import re

arquivo = "index.html"
with open(arquivo, 'r', encoding='utf-8') as f:
    conteudo = f.read()

# 1. Remover os espaçamentos gigantes (margin e padding) que existem entre a busca e os cards
# Isso remove margin-top e padding-top de containers genéricos
conteudo = re.sub(r'(\.container\s*\{[^}]*?margin-top:\s*[0-9]+px)', r'.container { margin-top: 0px;', conteudo)
conteudo = re.sub(r'(\.container\s*\{[^}]*?padding-top:\s*[0-9]+px)', r'.container { padding-top: 0px;', conteudo)

# 2. Forçar os CARDS a subirem usando margin-top NEGATIVO (puxa para cima)
# Isso é feito para garantir que a grade fique colada na barra de busca
conteudo = re.sub(
    r'(\.cards|\.game-grid|\.card-grid|\.app-grid|\.grid|\.modules)\s*\{',
    r'\1 { margin-top: -150px !important; position: relative; z-index: 999 !important; }',
    conteudo
)

# 3. Se existir uma div separada para o "MATRIX GAME HUB" ou os cards, puxa ela também
conteudo = re.sub(r'(\.hub-content|\.game-hub|\.module-grid)\s*\{', r'\1 { margin-top: -150px !important; }', conteudo)

with open(arquivo, 'w', encoding='utf-8') as f:
    f.write(conteudo)

print("✅ Cards puxados para cima! Espaçamento removido.")
