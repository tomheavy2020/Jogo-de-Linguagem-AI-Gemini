// 🔥 BASE DE DADOS DE RADARES FIXOS (Brasil)
// Adicione mais no formato: { lat: -23.xxxx, lng: -46.xxxx, name: "Nome do Radar", type: "Fixo" }
const radarDatabase = [
    { lat: -23.5505, lng: -46.6333, name: "Radar Av. Paulista (SP)", type: "Fixo" },
    { lat: -23.5610, lng: -46.6564, name: "Radar Av. Rebouças (SP)", type: "Fixo" },
    { lat: -23.5255, lng: -46.6680, name: "Radar Marginal Tietê (SP)", type: "Fixo" },
    { lat: -22.9110, lng: -43.1990, name: "Radar Av. Brasil (RJ)", type: "Fixo" },
    { lat: -25.4310, lng: -49.2630, name: "Radar BR-277 (PR)", type: "Fixo" },
    // Adicione mais aqui conforme sua região
];

window.getRadarDatabase = function() {
    return radarDatabase;
};
