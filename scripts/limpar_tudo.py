import re

arquivo = "index.html"
with open(arquivo, 'r', encoding='utf-8') as f:
    conteudo = f.read()

# AÇÃO 1: Apagar qualquer <div> que tenha a classe "header", "topbar" ou "boot"
# Isso remove o cabeçalho inteiro, incluindo o "MATRIX OS" e o botão "ENTRAR" antigo
conteudo = re.sub(r'<div[^>]*class=["\'][^"\']*(header|topbar|boot)[^"\']*["\'][^>]*>.*?</div>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)

# AÇÃO 2: Apagar qualquer <header> ou <nav> inteiro
conteudo = re.sub(r'<header[^>]*>.*?</header>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)
conteudo = re.sub(r'<nav[^>]*>.*?</nav>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)

# AÇÃO 3: Apagar qualquer <a> ou <button> que contenha o texto "ENTRAR" ou esteja dentro de uma classe fixa
conteudo = re.sub(r'<a[^>]*>.*?ENTRAR.*?</a>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)
conteudo = re.sub(r'<button[^>]*>.*?ENTRAR.*?</button>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)

# AÇÃO 4: Apagar qualquer texto que tenha "MATRIX GAME HUB" solto no HTML (fora dos cards)
conteudo = re.sub(r'<h1[^>]*>.*?MATRIX GAME HUB.*?</h1>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)

# AÇÃO 5: Apagar qualquer <div> que tenha "text-align: center" e contenha "MATRIX OS"
conteudo = re.sub(r'<div[^>]*>.*?MATRIX OS.*?<div[^>]*>.*?ENTRAR.*?</div>.*?</div>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)

with open(arquivo, 'w', encoding='utf-8') as f:
    f.write(conteudo)

print("✅ Limpeza nuclear concluída!")
print("🔍 Procurando resquícios...")
if "ENTRAR" in conteudo or "MATRIX GAME HUB" in conteudo or "<header" in conteudo:
    print("⚠️  Ainda existe algo. Verifique se o site carregou certo depois.")
else:
    print("🎉 Nenhum cabeçalho, botão ENTRAR ou GAME HUB encontrado no arquivo!")
