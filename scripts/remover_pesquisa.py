import re

arquivo = "index.html"
with open(arquivo, 'r', encoding='utf-8') as f:
    conteudo = f.read()

# 1. APAGAR O HTML DA BARRA DE PESQUISA (procurando por tags <input>, <div>, <form> com classe ou texto específico)
conteudo = re.sub(r'<div[^>]*class=["\'][^"\']*(search|pesquisa|search-bar|search-wrapper)[^"\']*["\'][^>]*>\s*<input[^>]*>.*?</div>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)
conteudo = re.sub(r'<input[^>]*placeholder=["\'][^"\']*(Buscar|Search|Pesquisar)[^"\']*["\'][^>]*>', '', conteudo, flags=re.IGNORECASE)
conteudo = re.sub(r'<div[^>]*class=["\'][^"\']*(search|pesquisa|search-bar|search-wrapper)[^"\']*["\'][^>]*>.*?</div>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)
conteudo = re.sub(r'<form[^>]*class=["\'][^"\']*(search|pesquisa)[^"\']*["\'][^>]*>.*?</form>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)

# 2. Apagar elementos soltos: <input> com placeholder de busca
conteudo = re.sub(r'<input[^>]*>', '', conteudo, flags=re.IGNORECASE)

# 3. Apagar qualquer CSS de barra de pesquisa (para não deixar resquícios)
conteudo = re.sub(r'(\.search|\.search-bar|\.search-wrapper|\.pesquisa)\s*\{[^}]*\}', '', conteudo, flags=re.DOTALL)

# 4. Adicionar CSS e JavaScript para "esconder e deletar" a barra que possa ter sido recriada por JS
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
</style>

<script>
    // Remoção física de qualquer barra de pesquisa gerada por JS
    function apagarPesquisa() {
        var elementos = document.querySelectorAll('.search, .search-bar, .search-wrapper, .search-input, .pesquisa');
        elementos.forEach(function(el) {
            el.parentNode.removeChild(el);
        });
    }
    apagarPesquisa();
    setInterval(apagarPesquisa, 500);
</script>
"""

with open(arquivo, 'w', encoding='utf-8') as f:
    f.write(conteudo)

print("✅ Barra de pesquisa removida.")
print("🔍 Verificando se sobrou...")
if "Buscar módulo" in conteudo:
    print("⚠️ Atenção: Ainda existe o texto na arquivo. Verifique se foi criada por JS.")
else:
    print("🎉 Nenhuma barra de pesquisa ou texto 'Buscar módulo' encontrado!")
