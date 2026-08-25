const express = require('express');
const path = require('path');
const http = require('http');
const fetch = require('node-fetch');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// CHAVES DE API SEGURAS (VIA PROCESS.ENV)
const OWM_API_KEY = process.env.OWM_API_KEY || 'f26682033c10c580f50134f89739e0ac';
const N2YO_API_KEY = process.env.N2YO_API_KEY || 'B6GHQ6-XG2J4X-BK77S4-4NZ9';

app.use(express.json());
app.use(express.static(__dirname));

// PROXY SEGURO PARA WEATHER (OPENWEATHERMAP)
app.get('/api/weather', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) return res.status(400).json({ error: 'Lat/Lon requeridos' });
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${OWM_API_KEY}`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar dados meteorológicos' });
    }
});

// PROXY SEGURO PARA SATÉLITES (N2YO)
app.get('/api/satpos', async (req, res) => {
    try {
        const { satid, lat, lng, seconds } = req.query;
        if (!satid || !lat || !lng) return res.status(400).json({ error: 'Parâmetros requeridos' });
        const sec = seconds || 1;
        const response = await fetch(`https://api.n2yo.com/rest/v1/satellite/positions/${satid}/${lat}/${lng}/0/${sec}/&apiKey=${N2YO_API_KEY}`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar dados de satélite' });
    }
});

app.get('/api/satpos/passes', async (req, res) => {
    try {
        const { satid, lat, lng, days } = req.query;
        if (!satid || !lat || !lng) return res.status(400).json({ error: 'Parâmetros requeridos' });
        const d = days || 5;
        const response = await fetch(`https://api.n2yo.com/rest/v1/satellite/visualpasses/${satid}/${lat}/${lng}/0/${d}/300/&apiKey=${N2YO_API_KEY}`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar passagens de satélite' });
    }
});

// PROXY PARA RADAR DE VOOS
app.get('/api/flights', async (req, res) => {
    try {
        const response = await fetch('https://opensky-network.org/api/states/all');
        if (!response.ok) throw new Error('Falha OpenSky');
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar dados de voos' });
    }
});

// ROTA PRINCIPAL SERVE INDEX.HTML DIRETO (MANTIDO INTACTO)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(PORT, () => {
    console.log(`🚀 MATRIX OS rodando na porta ${PORT}`);
    console.log(`📱 Página inicial: index.html`);
});
