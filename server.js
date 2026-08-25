const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

// ROTA PRINCIPAL - SERVE INDEX.HTML DIRETO
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 MATRIX OS rodando na porta ${PORT}`);
    console.log(`📱 Página inicial: index.html`);
});
