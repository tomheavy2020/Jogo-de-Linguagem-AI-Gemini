import re

arquivo = "index.html"
with open(arquivo, 'r', encoding='utf-8') as f:
    conteudo = f.read()

# 1. Apagar quaisquer divs ou seções que tenham alturas muito grandes (acima de 150px)
# que estejam sendo usadas como "separadores" invisíveis
conteudo = re.sub(
    r'(\.separator|\.spacer|\.gap|\.section-divider|\.background-effect|\.globe|\.arena)\s*\{[^}]*height:\s*[0-9]{3,}px[^}]*\}',
    '',
    conteudo
)

# 2. Forçar QUALQUER div ou container genérico (que não seja card) a ter altura 0 ou auto
# Isso remove espaços gigantes que estejam empurrando os cards
conteudo = re.sub(
    r'(\.main-wrapper|\.content-wrapper|\.hero-section|\.intro|\.landing)\s*\{',
    r'\1 { height: auto !important; min-height: 0 !important; margin-bottom: 0 !important; padding-bottom: 0 !important; }',
    conteudo
)

# 3. Forçar os cards a subirem MUITO (colados na busca)
conteudo = re.sub(
    r'(\.cards|\.game-grid|\.card-grid|\.app-grid|\.grid|\.modules|\.hub-content)\s*\{',
    r'\1 { margin-top: -250px !important; position: relative; z-index: 999 !important; }',
    conteudo
)

with open(arquivo, 'w', encoding='utf-8') as f:
    f.write(conteudo)

print("✅ Espaço bloqueado removido! Cards puxados para cima com força.")
