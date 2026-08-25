#!/usr/bin/env python3
"""
MATRIX OS - Adicionar Card ao Hub
Uso: python3 add_card.py <nome> <icone_svg> <link>
Exemplo:
python3 add_card.py "Matrix Craft" '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18M12 3v18"/>' "/matrixcraft.html"
"""

import sys
import re

def add_card(name, svg_icon, link):
    """Adiciona um card no array gameItems ou toolItems do index.html"""

    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Criar o HTML do card
    card_html = (
        f"        '<div class=\"app-tile\" onclick=\"window.location.href=\\'{link}\\'\">"
        f"<div class=\"icon-wrap\"><svg viewBox=\"0 0 24 24\">{svg_icon}</svg></div>"
        f"<span class=\"tile-name\">{name}</span></div>',"
    )

    # Encontrar o último card do array (antes de '];' ou '    ];')
    pattern = r"(\s+)'<div class=\"app-tile\".*?</div>',\n(\s+)\];"

    match = re.search(pattern, content)
    if match:
        # Inserir antes do fechamento do array
        insert_pos = match.end() - len(match.group(2)) - 3  # posição antes de '];'
        content = content[:insert_pos] + '\n' + card_html + content[insert_pos:]

        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"✅ Card '{name}' adicionado com sucesso!")
        print(f"   Link: {link}")
        print(f"   Ícone: {svg_icon[:30]}...")
    else:
        print("❌ Não foi possível encontrar o array de cards.")
        print("   Verifique se o index.html tem os cards no formato esperado.")

if __name__ == '__main__':
    if len(sys.argv) < 4:
        print("Uso: python3 add_card.py <nome> <icone_svg> <link>")
        print("Exemplo:")
        print('python3 add_card.py "Matrix Craft" \'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18M12 3v18"/>\' "/matrixcraft.html"')
        sys.exit(1)

    name = sys.argv[1]
    svg_icon = sys.argv[2]
    link = sys.argv[3]

    add_card(name, svg_icon, link)
