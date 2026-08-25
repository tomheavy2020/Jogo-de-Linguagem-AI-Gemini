import re

with open("index.html", 'r', encoding='utf-8') as f:
    conteudo = f.read()

# Verificar se a tela de boot existe
if '<div id="tela-boot">' not in conteudo:
    print("⚠️ Tela de boot não encontrada. Adicionando...")
    # Adicionar tela de boot no início do body
    conteudo = re.sub(r'(<body[^>]*>)', r'''\1
    <div id="tela-boot">
        <img src="android.png" alt="Android" class="android-img">
        <div class="boot-title">MATRIX OS</div>
        <div class="boot-sub">WEB 3.0 BOOT - FASTBOOT</div>
    </div>''', conteudo, count=1, flags=re.IGNORECASE)
else:
    print("✅ Tela de boot já existente.")

# Verificar si o JavaScript do boot existe
if 'function entrarApp()' not in conteudo and 'setTimeout' not in conteudo and 'tela-boot' not in conteudo:
    print("⚠️ JavaScript do boot não encontrado. Adicionando...")
    conteudo += """
    <script>
        setTimeout(function() {
            // Sonha o boot
            var boot = document.getElementById('tela-boot');
            if (boot) {
                boot.style.opacity = '0';
                setTimeout(function() {
                    boot.remove();
                }, 1000);
            }
        }, 2500);
    </script>
    """
else:
    print("✅ JavaScript do boot já existente.")

with open("index.html", 'w', encoding='utf-8') as f:
    f.write(conteudo)

print("✅ Backup estável restaurado e tela de boot verificada.")
