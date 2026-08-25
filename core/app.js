// 🔥 ROTEADOR SPA PARA O MATRIX OS (Módulos Secundários)
const modules = {
  'hub': { html: 'core/index.html', css: ['core/styles.css'], js: [] }
};

let currentCleanup = null;

async function loadModule(name) {
  const mod = modules[name] || modules.hub;
  const container = document.getElementById('app-container');

  if (currentCleanup) { currentCleanup(); currentCleanup = null; }
  document.querySelectorAll('[data-mod-asset]').forEach(el => el.remove());

  container.innerHTML = `<div style="display:flex; justify-content:center; align-items:center; height:100%; color:#00ff41;">[ SYSTEM LOADING... ]</div>`;
  mod.css.forEach(href => {
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = href;
    link.setAttribute('data-mod-asset', ''); document.head.appendChild(link);
  });
  try {
    const res = await fetch(mod.html); if(!res.ok) throw new Error('HTTP ' + res.status);
    const html = await res.text(); container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div style="color:#ff3333; text-align:center; padding:20px;">ERRO: ${err.message}</div>`;
  }
}
window.navigateTo = function(name) { loadModule(name); };
document.addEventListener('DOMContentLoaded', () => { loadModule('hub'); });
