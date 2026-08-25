// 🔥 SISTEMA DE NAVEGAÇÃO SPA (Single Page Application)
// Este é o motor que carrega os módulos dentro do index.html

const modules = {
  'hub': { html: 'core/index.html', css: ['core/styles.css'], js: [] }
};

let currentCleanup = null;

async function loadModule(name) {
  const mod = modules[name] || modules.hub;
  const container = document.getElementById('app-container');

  if (!container) return;

  // Limpeza do módulo anterior
  if (currentCleanup) { currentCleanup(); currentCleanup = null; }
  document.querySelectorAll('[data-mod-asset]').forEach(el => el.remove());

  // Loader de carregamento
  container.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:center; height:100%; color:#00ff41; font-size:14px; gap:10px;">
      <span style="display:inline-block; width:16px; height:16px; border:2px solid #00ff41; border-top-color:transparent; border-radius:50%; animation:spin 1s linear infinite;"></span>
      <span>[ SISTEMA CARREGANDO... ]</span>
    </div>
  `;

  // Carrega CSS do módulo
  mod.css.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = href;
    link.setAttribute('data-mod-asset', '');
    document.head.appendChild(link);
  });

  try {
    // Busca o HTML do módulo
    const res = await fetch(mod.html);
    if (!res.ok) throw new Error('Arquivo não encontrado');
    const html = await res.text();
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `
      <div style="color:#ff3333; text-align:center; padding:20px;">
        <h2>⚠️ ERRO</h2>
        <p>Não foi possível carregar o módulo.</p>
        <button onclick="loadModule('hub')" style="background:#00ff00; border:none; padding:10px 20px; color:#000; border-radius:10px; font-weight:bold;">Tentar novamente</button>
      </div>
    `;
  }
}

// 🔥 EXPÕE A FUNÇÃO GLOBALMENTE
window.loadModule = loadModule;
window.navigateTo = function(name) { loadModule(name); };

// 🔥 INICIA O APP CARREGANDO O HUB
document.addEventListener('DOMContentLoaded', () => {
  loadModule('hub');
});

// 🔥 DETECTOR DE CLIQUES NOS CARDS
document.addEventListener('click', (e) => {
  const card = e.target.closest('.hub-card');
  if (card) {
    const module = card.getAttribute('data-module');
    const link = card.getAttribute('onclick');
    if (link) {
        // Extrai o link do onclick e redireciona
        const match = link.match(/window\.location\.href='(.*?)'/);
        if (match) window.location.href = match[1];
    } else if (module && modules[module]) {
        loadModule(module);
    }
  }
});
