// ================= SCRIPT AUTOMATIZADO MATRIX OS =================
// Este script faz alterações no projeto SEM quebrar nada
// Uso: node deploy.js

const fs = require('fs');
const path = require('path');

console.log('🔧 MATRIX OS - Script de Deploy Automatizado');
console.log('==========================================');

// Verificar se o arquivo existe
function fileExists(file) {
    return fs.existsSync(file);
}

// Adicionar card ao hub (sem quebrar)
function addCardToHub(name, svgIcon, link) {
    const indexFile = 'index.html';
    if(!fileExists(indexFile)) {
        console.log('❌ index.html não encontrado');
        return false;
    }

    let content = fs.readFileSync(indexFile, 'utf8');

    // Verificar se o card já existe
    if(content.includes(link)) {
        console.log(`⚠️ Card "${name}" já existe no hub`);
        return true;
    }

    // Criar o HTML do card
    const cardHTML = `        '<div class="app-tile" onclick="window.location.href=\\'${link}\\'"><div class="icon-wrap"><svg viewBox="0 0 24 24">${svgIcon}</svg></div><span class="tile-name">${name}</span></div>',`;

    // Encontrar o card do Ranking como referência
    const rankingPos = content.indexOf("Ranking</span></div>'");
    if(rankingPos === -1) {
        console.log('❌ Card do Ranking não encontrado');
        return false;
    }

    // Encontrar o final da linha do Ranking
    const commaPos = content.indexOf("',", rankingPos) + 2;

    // Inserir após o Ranking
    content = content.slice(0, commaPos) + '\n' + cardHTML + content.slice(commaPos);

    fs.writeFileSync(indexFile, content);
    console.log(`✅ Card "${name}" adicionado ao hub`);
    return true;
}

// Criar arquivo se não existir
function createFileIfNotExists(file, content) {
    if(fileExists(file)) {
        console.log(`⚠️ ${file} já existe - não vou sobrescrever`);
        return false;
    }
    fs.writeFileSync(file, content);
    console.log(`✅ ${file} criado`);
    return true;
}

// Listar arquivos do projeto
console.log('\n📁 Arquivos do projeto:');
const files = fs.readdirSync('.');
files.forEach(f => {
    if(f.endsWith('.html') || f.endsWith('.js')) {
        console.log(`  - ${f}`);
    }
});

console.log('\n==========================================');
console.log('✅ Script pronto! Uso:');
console.log('   node deploy.js');
