import re

# Nome do arquivo a ser modificado
arquivo = "index.html"

try:
    with open(arquivo, 'r', encoding='utf-8') as f:
        conteudo = f.read()

    # 1. Remover blocos inteiros que começam com <header> e terminam com </header>
    conteudo = re.sub(r'<header[^>]*>.*?</header>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)

    # 2. Remover blocos de <div class="header"> ou <div class='header'> até o fechamento correto
    conteudo = re.sub(r'<div[^>]*class=["\'][^"\']*header[^"\']*["\'][^>]*>.*?</div>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)

    # 3. Remover qualquer link/botão (a) que tenha a classe 'back' ou que contenha o texto "ENTRAR"
    conteudo = re.sub(r'<a[^>]*class=["\'][^"\']*back[^"\']*["\'][^>]*>.*?</a>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)
    conteudo = re.sub(r'<a[^>]*>.*?ENTRAR.*?</a>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)

    # 4. Remover aquele botão gigante que está fixo no topo (se for um botão ou div separada)
    conteudo = re.sub(r'<div[^>]*id=["\']boot-screen["\'][^>]*>.*?</div>', '', conteudo, flags=re.DOTALL | re.IGNORECASE)

    # Salvar o arquivo limpo
    with open(arquivo, 'w', encoding='utf-8') as f:
        f.write(conteudo)

    print("✅ Arquivo limpo com sucesso!")
    print("Verificando se sobrou algo...")

    # Verificação final
    if "ENTRAR" in conteudo or "<header" in conteudo:
        print("⚠️  Ainda existe algum resquício. Verifique manualmente.")
    else:
        print("🎉 Nenhum botão gigante ou header encontrado no arquivo!")

except FileNotFoundError:
    print("❌ Erro: Arquivo index.html não encontrado!")
except Exception as e:
    print(f"❌ Erro inesperado: {e}")
