// ================= ADICIONAR CARD AO HUB =================
// Uso: node add_card.js "Nome" "<svg_icon>" "/link.html"

const fs = require('fs');

const name = process.argv[2];
const svgIcon = process.argv[3];
const link = process.argv[4];

if(!name || !svgIcon || !link) {
    console.log('Uso: node add_card.js "Nome" "<svg>" "/link.html"');
    console.log('Exemplo: node add_card.js "Matrix Craft" \'<rect x="3" y="3" width="18" height="18" rx="2"/>\' "/matrixcraft.html"');
    process.exit(1);
}

let content = fs.readFileSync('index.html', 'utf8');

// Criar o HTML do card (formato idêntico aos existentes)
const cardHTML = `        '<div class="app-tile" onclick="window.location.href=\\'${link}\\'"><div class="icon-wrap"><svg viewBox="0 0 24 24">${svgIcon}</svg></div><span class="tile-name">${name}</span></div>',`;

// Encontrar o último card do gameItems (linha com Ranking)
const rankingLine = content.indexOf("Ranking</span></div>'");
if(rankingLine === -1) {
    console.log('❌ Card do Ranking não encontrado');
    process.exit(1);
}

// Encontrar o final da linha do Ranking (a vírgula)
const commaPos = content.indexOf("',", rankingLine) + 2;

// Inserir o novo card após o Ranking
content = content.slice(0, commaPos) + '\n' + cardHTML + content.slice(commaPos);

fs.writeFileSync('index.html', content);
console.log(`✅ Card "${name}" adicionado após o Ranking!`);
console.log(`   Link: ${link}`);
