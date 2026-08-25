# 🟢 MATRIX OS 2.0

> *"A Nave Espacial da Segurança Cibernética e OSINT"*

Matrix OS é um **Sistema Operacional Web (PWA)** interativo, focado em **Segurança Cibernética, OSINT (Inteligência de Fontes Abertas) e Criptomoedas**. Construído com uma interface visual neon inspirada no filme Matrix, ele atua como uma "Nave Espacial" que oferece terminais de comando, monitoramento de hardware em tempo real e um conjunto de ferramentas de hacking ético.

---

## 📦 Estrutura do Projeto

O projeto foi refatorado para uma arquitetura modular, garantindo fácil manutenção e escalabilidade.

```text
/
├── core/
│   └── websocket.js        # Gerencia conexões WebSocket, autenticação e broadcast de usuários online
├── commands/
│   ├── command-router.js   # Roteador inteligente (Free/Premium e encaminhamento de comandos)
│   ├── whois.js            # Registro de domínio (RDAP)
│   ├── dns.js              # Registros A, AAAA, MX, NS, TXT (Google DoH)
│   ├── scan.js             # Escaneamento de portas (Hackertarget API)
│   ├── ssl.js              # Validade de certificados SSL
│   ├── whatweb.js          # Tecnologias do site (Hackertarget)
│   ├── wayback.js          # URLs históricas (Wayback Machine)
│   ├── cve.js              # Vulnerabilidades públicas (NIST NVD)
│   ├── reputacao.js        # Análise de IP (Proxy, VPN, Hosting)
│   ├── ip.js               # GeoIP (ip-api.com)
│   └── crypto.js           # Cotações BTC, ETH, SOL (CoinGecko)
├── services/
│   └── ai.js               # Inteligência Natural: interpreta linguagem humana e executa cadeias de comandos
├── models/
│   ├── User.js             # Modelo de usuário (MongoDB)
│   └── Scan.js             # Modelo de histórico de scans (MongoDB)
├── index.html              # Tela Free (Chat, ISS, Terminal Nano, Horóscopo)
├── nave.html               # Interface Premium (Nave Espacial)
├── map.html                # Mapa GPS e navegação 2D
├── tools.html              # Super Tools (Bússola, Lanterna, Gravador, etc.)
├── login.html              # Tela de Login e Registro
├── premium.html            # Tela de Ativação Premium (código único)
├── style.css               # Estilos Neon Matrix globais
├── server.js               # Ponto de entrada do servidor Node.js
├── package.json            # Dependências do projeto
└── README.md               # Você está aqui!
```

---

## 🚀 Funcionalidades Principais

### 1. Terminal OSINT & Cripto (Premium)

Todos os comandos são executados via WebSocket e retornam respostas estruturadas:

- `whois [domínio]` → Informações de registro.
- `scan [domínio]` → Escaneamento de portas abertas.
- `dns [domínio]` → Registros A, AAAA, MX, NS, TXT.
- `whatweb [domínio]` → Tecnologias e WAF do site.
- `wayback [domínio]` → URLs históricas via Wayback Machine.
- `ssl [domínio]` → Validade e detalhes do certificado SSL.
- `cve [termo]` → Busca de vulnerabilidades públicas (NIST NVD).
- `reputacao [ip]` → Análise de IP (Proxy, VPN, Hosting).
- `ip [ip]` → GeoIP.
- `btc`, `eth`, `sol`, `cripto` → Cotações em tempo real (CoinGecko).

### 2. Inteligência Artificial Natural

O serviço `services/ai.js` interpreta comandos em português e dispara ações automáticas.

**Exemplo:**
> *"Matrix, analise terra.com.br"*

O sistema entende a intenção, extrai o domínio e executa automaticamente **WHOIS, DNS, WHATWEB e SSL** em sequência, devolvendo um resumo completo no chat.

### 3. Interface Nave Espacial (`nave.html`)

- **Terminais Independentes:** Terminal superior para comandos, Chat inferior para IA. Ambos executam comandos sem interferência.
- **Sys Monitor:** Gráficos em tempo real (Canvas) exibindo CPU, RAM, Rede e Armazenamento.
- **File Manager:** Navegação em pastas e upload de arquivos.
- **Notificações:** Sistema de alertas visuais em tempo real.

### 4. Mapa e GPS (`map.html`)

- Mapa 2D com modo Dark, Satélite e Relevo.
- Localização automática e rastreamento contínuo.
- Rotas neon e indicadores de precisão.

---

## ⚙️ Configuração e Deploy

### Pré-requisitos

- Node.js (v18+)
- MongoDB Atlas (URI de conexão)
- Conta no Render (para deploy)

### Instalação (Ambiente Local)

```bash
git clone https://github.com/tomheavy2020/matrix-bot.git
cd matrix-bot
npm install
```

### Variáveis de Ambiente (`.env`)

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
DB_URL=mongodb+srv://<usuario>:<senha>@cluster0.mongodb.net/?appName=MatrixOS
JWT_SECRET=<sua_chave_secreta_aleatoria>
PORT=8080
```

### Executar Localmente

```bash
npm start
# ou
node server.js
```
O servidor rodará em `http://localhost:8080`.

### Deploy no Render

1. Conecte o repositório do GitHub ao Render.
2. Escolha a opção **Node.js**.
3. Defina o comando de build como `npm install`.
4. Defina o comando de start como `node server.js`.
5. Adicione as variáveis de ambiente (`DB_URL`, `JWT_SECRET`) no painel do Render.

---

## 🛡️ Segurança e Permissões

- **JWT com expiração:** Tokens expiram em 7 dias.
- **Verificação Premium no Backend:** O status `isPremium` é validado no MongoDB a cada comando (não confia apenas no token).
- **Sanitização Anti-XSS:** Todas as respostas de APIs externas e mensagens privadas passam por `sanitizeHTML()`.
- **Rate Limit:** Máximo de 5 comandos por segundo por usuário.

## 💰 Modelo de Negócio (Free vs Premium)

| Recurso | Free | Premium |
| :--- | :---: | :---: |
| Análise de cabeçalhos (Curl) | ✅ | ✅ |
| Comandos OSINT (whois, dns, scan...) | ❌ | ✅ |
| Criptomoedas (btc, eth, sol...) | ❌ | ✅ |
| IA Natural | ❌ | ✅ |
| Nave Espacial Completa | ❌ | ✅ |
| Mapa e GPS 2D | ❌ | ✅ |

**Ativação Premium:** Código único salvo no banco de dados, validado exclusivamente no backend.

## 📂 PWA (Aplicativo Progressivo)

O Matrix OS é um **PWA (Progressive Web App)**. Ele pode ser instalado na tela inicial do celular e funciona offline graças ao Service Worker registrado (`sw.js`).

## 🤝 Contribuição

Este é um projeto proprietário em desenvolvimento ativo. Para sugestões, relatórios de bugs ou parcerias, entre em contato através do repositório oficial.

## 📄 Licença

Todos os direitos reservados. Matrix OS © 2026.

