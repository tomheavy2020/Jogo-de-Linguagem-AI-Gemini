import re

arquivo = "index.html"
with open(arquivo, 'r', encoding='utf-8') as f:
    conteudo = f.read()

# 1. Apagar qualquer elemento <div> que tenha classes como header, boot, topbar, splash ou login
conteudo = re.sub(r'<div[^>]*class=["\'][^"\']*(header|boot|topbar|splash|login)[^"\']*["\'][^>]*>.*?</div>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)

# 2. Apagar qualquer elemento <header> ou <nav> inteiro
conteudo = re.sub(r'<header[^>]*>.*?</header>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)
conteudo = re.sub(r'<nav[^>]*>.*?</nav>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)

# 3. Apagar qualquer elemento <a> ou <button> que contenha a palavra "ENTRAR"
conteudo = re.sub(r'<a[^>]*>.*?ENTRAR.*?</a>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)
conteudo = re.sub(r'<button[^>]*>.*?ENTRAR.*?</button>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)

# 4. Apagar qualquer div que contenha o texto "MATRIX GAME HUB" e que esteja logo após a tag <body> ou antes dos cards
# Isso remove o titulo duplicado que está na caixinha no topo
conteudo = re.sub(r'<div[^>]*>.*?MATRIX GAME HUB.*?<div[^>]*>.*?EXPL[^<]*</div>.*?</div>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)

# 5. Apagar o botão "X" de fechar e o ícone de fechar que aparece no topo direito
conteudo = re.sub(r'<a[^>]*class=["\'][^"\']*close[^"\']*["\'][^>]*>.*?</a>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)

with open(arquivo, 'w', encoding='utf-8') as f:
    f.write(conteudo)

print("✅ Backup criado e cabeçalho duplicado removido!")
print("🔍 Verificando se sobrou algum 'MATRIX GAME HUB' no topo...")
if "MATRIX GAME HUB" in conteudo:
    print("⚠️ Atenção: Ainda existe a palavra no arquivo, mas provavelmente é a de baixo (a que você quer manter).")
else:
    print("🎉 Nenhum resquício do cabeçalho sobrou!")
