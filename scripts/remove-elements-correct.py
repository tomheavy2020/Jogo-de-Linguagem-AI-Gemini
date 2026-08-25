#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re

def remove_elements_correct():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. REMOVER O BOTÃO "ENTRAR" (linha exata)
    content = re.sub(
        r'<a[^>]*class="enter-btn"[^>]*>.*?ENTRAR.*?</a>',
        '',
        content,
        flags=re.DOTALL | re.IGNORECASE
    )

    content = re.sub(
        r'<button[^>]*class="enter-btn"[^>]*>.*?ENTRAR.*?</button>',
        '',
        content,
        flags=re.DOTALL | re.IGNORECASE
    )

    # 2. REMOVER A DIV DA BARRA DE BUSCA
    content = re.sub(
        r'<div class="search-wrap"[^>]*>.*?<input[^>]*id="appSearchInput"[^>]*>.*?<button[^>]*id="searchClearBtn"[^>]*>.*?</div>',
        '',
        content,
        flags=re.DOTALL
    )

    # 3. REMOVER O TEXTO "Buscar módulo..." que possa ter ficado
    content = re.sub(
        r'Buscar módulo\.\.\.',
        '',
        content
    )

    # 4. REMOVER O PLACEHOLDER
    content = re.sub(
        r'placeholder="Buscar módulo[^"]*"',
        '',
        content,
        flags=re.IGNORECASE
    )

    # 5. REMOVER O JAVASCRIPT DA BUSCA (apenas as referências)
    content = re.sub(
        r'const searchInput = document\.getElementById\(\'appSearchInput\'\);\s*',
        '',
        content
    )

    content = re.sub(
        r'const searchClearBtn = document\.getElementById\(\'searchClearBtn\'\);\s*',
        '',
        content
    )

    content = re.sub(
        r'const searchWrap = document\.getElementById\(\'searchWrap\'\);\s*',
        '',
        content
    )

    # 6. REMOVER O EVENT LISTENER DA BUSCA
    content = re.sub(
        r'searchInput\.addEventListener\([\s\S]*?}\);',
        '',
        content
    )

    content = re.sub(
        r'searchClearBtn\.addEventListener\([\s\S]*?}\);',
        '',
        content
    )

    # 7. REMOVER A QUERY DA BUSCA
    content = re.sub(
        r'const query = document\.getElementById\(\'appSearchInput\'\)\.value\.trim\(\)\.toLowerCase\(\);\s*',
        '',
        content
    )

    # 8. AJUSTAR A FUNÇÃO renderSections
    content = re.sub(
        r'function renderSections\(query\)\s*\{',
        'function renderSections() {',
        content
    )

    content = re.sub(
        r'renderSections\(query\);',
        'renderSections();',
        content
    )

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)

    print("✅ Elementos removidos corretamente:")
    print("   - Botão ENTRAR")
    print("   - Barra de busca")
    print("   - JavaScript da busca ajustado")

if __name__ == '__main__':
    remove_elements_correct()
