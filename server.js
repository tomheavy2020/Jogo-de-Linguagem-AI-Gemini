const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Tentar carregar mongoose para DB
let mongoose = null;
try {
    mongoose = require('mongoose');
} catch (e) {
    console.log('[Server] Mongoose não disponível, operando sem persistência MongoDB.');
}

// Tentar carregar WebSocket do core se existir
let initWebSocket = null;
try {
    initWebSocket = require('./core/websocket');
} catch (e) {
    console.log('[Server] core/websocket não disponível.');
}

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Conexão MongoDB (se DB_URL estiver configurada)
if (mongoose && process.env.DB_URL) {
    mongoose.connect(process.env.DB_URL)
        .then(() => console.log('[Server] MongoDB Conectado com Sucesso.'))
        .catch(err => console.error('[Server] Erro ao conectar no MongoDB:', err.message));
}

// Inicializar WebSocket
if (typeof initWebSocket === 'function') {
    initWebSocket(server);
    console.log('[Server] WebSocket Real-time Inicializado.');
}

// Middleware de Proxy para OpenWeatherMap API

// Middleware de Proxy para Tiles do Weather Map
app.get('/api/weather/tile/:layer/:z/:x/:y', async (req, res) => {
    try {
        const { layer, z, x, y } = req.params;
        const apiKey = process.env.OWM_API_KEY || '';
        if (!apiKey) return res.status(500).json({ error: 'OWM_API_KEY não configurada' });
        const url = `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) return res.status(response.status).end();
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        res.setHeader('Content-Type', 'image/png');
        return res.send(buffer);
    } catch (e) {
        return res.status(500).end();
    }
});


// Middleware de estatísticas online

// OTA Versioning and Update Check Endpoint
app.get('/api/version', (req, res) => {
    return res.json({
        version: '3.1.1',
        build: 'PRO',
        ota_status: 'UP_TO_DATE',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/online', (req, res) => {
    return res.json({ count: 1 });
});

app.get('/api/weather', async (req, res) => {
    try {
        const { lat, lon, city } = req.query;
        const apiKey = process.env.OWM_API_KEY || '';

        if (!apiKey) {
            return res.status(500).json({ error: 'OWM_API_KEY não configurada no servidor.' });
        }

        let url = '';
        if (lat && lon) {
            url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`;
        } else if (city) {
            url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pt_br`;
        } else {
            return res.status(400).json({ error: 'Informe lat/lon ou city' });
        }

        const response = await fetch(url);
        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        console.error('Erro no proxy weather:', error);
        return res.status(500).json({ error: 'Erro ao consultar API de Clima' });
    }
});

// Middleware de Proxy para Posição de Satélite N2YO API
app.get('/api/satpos', async (req, res) => {
    try {
        const { id, lat, lon, alt, sec } = req.query;
        const apiKey = process.env.N2YO_API_KEY || '';

        if (!apiKey) {
            return res.status(500).json({ error: 'N2YO_API_KEY não configurada no servidor.' });
        }

        const satId = id || '25544'; // ISS padrão
        const observerLat = lat || '-23.5505';
        const observerLng = lon || '-46.6333';
        const observerAlt = alt || '0';
        const seconds = sec || '2';

        const url = `https://api.n2yo.com/rest/v1/satellite/positions/${satId}/${observerLat}/${observerLng}/${observerAlt}/${seconds}/&apiKey=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        console.error('Erro no proxy satpos:', error);
        return res.status(500).json({ error: 'Erro ao consultar API de Satélite' });
    }
});

// Middleware de Proxy para Passes de Satélite N2YO API
app.get('/api/satpos/passes', async (req, res) => {
    try {
        const { id, lat, lon, alt, days, min_vis } = req.query;
        const apiKey = process.env.N2YO_API_KEY || '';

        if (!apiKey) {
            return res.status(500).json({ error: 'N2YO_API_KEY não configurada no servidor.' });
        }

        const satId = id || '25544';
        const observerLat = lat || '-23.5505';
        const observerLng = lon || '-46.6333';
        const observerAlt = alt || '0';
        const passDays = days || '1';
        const minVisibility = min_vis || '30';

        const url = `https://api.n2yo.com/rest/v1/satellite/visualpasses/${satId}/${observerLat}/${observerLng}/${observerAlt}/${passDays}/${minVisibility}/&apiKey=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        console.error('Erro no proxy satpos passes:', error);
        return res.status(500).json({ error: 'Erro ao consultar passes de Satélite' });
    }
});

// Middleware de Proxy para Radar de Voos OpenSky API
app.get('/api/flights', async (req, res) => {
    try {
        const url = 'https://opensky-network.org/api/states/all';
        const response = await fetch(url);
        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        console.error('Erro no proxy flights:', error);
        return res.status(500).json({ error: 'Erro ao consultar API de Voos' });
    }
});

// Servir arquivos estáticos da aplicação
app.use(express.static(path.join(__dirname)));

server.listen(PORT, () => {
    console.log(`[Server] Matrix OS Servidor rodando na porta ${PORT}`);
});
