// 🔥 SISTEMA DE AUTENTICAÇÃO MATRIX OS (COM ACESSO CEO)
let token = null;
let currentUser = null;

const formTitle = document.getElementById('formTitle');
const actionBtn = document.getElementById('actionBtn');
const toggleText = document.getElementById('toggleText');
const errorMsg = document.getElementById('errorMsg');
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const bioBtn = document.getElementById('bioBtn');

// Alternância entre Login e Cadastro
toggleText.addEventListener('click', () => {
    if (formTitle.innerText === 'Entrar') {
        formTitle.innerText = 'Cadastrar';
        actionBtn.innerText = 'Cadastrar';
        toggleText.innerText = 'Já tem conta? Faça login';
    } else {
        formTitle.innerText = 'Entrar';
        actionBtn.innerText = 'Entrar';
        toggleText.innerText = 'Não tem conta? Cadastre-se';
    }
});

// 🔥 FUNÇÃO DE ENTRADA DO CEO (Sem precisar de senha)
window.ceoLogin = function() {
    const userToSave = {
        id: 'ceo_dev_999',
        username: '@ceo',
        isPremium: true, // 🔥 Plano Matrix total
        token: 'ceo_token_infinity'
    };
    localStorage.setItem('matrixUser', JSON.stringify(userToSave));
    window.location.href = '/index.html';
    console.log("🚀 Acesso CEO ativado! Bem-vindo, Comandante.");
};

// 🔥 VERIFICAR SE O CELULAR SUPORTA BIOMETRIA
async function checkBioSupport() {
    if (window.PublicKeyCredential &&
        (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())) {
        const saved = localStorage.getItem('matrix_bio_credentials');
        if (saved) {
            bioBtn.classList.remove('hidden');
        }
    }
}
checkBioSupport();

// 🔥 AUTENTICAÇÃO BIOMÉTRICA
bioBtn.addEventListener('click', async () => {
    const saved = localStorage.getItem('matrix_bio_credentials');
    if (!saved) return;

    try {
        const creds = JSON.parse(saved);
        const challenge = new Uint8Array(32);
        const credential = await navigator.credentials.get({
            publicKey: {
                challenge: challenge,
                allowCredentials: [{
                    id: Uint8Array.from(atob(creds.credentialId), c => c.charCodeAt(0)),
                    type: 'public-key'
                }],
                userVerification: 'required'
            }
        });

        if (credential) {
            usernameInput.value = creds.username;
            passwordInput.value = creds.password;
            errorMsg.style.display = 'none';
            actionBtn.click();
        }
    } catch (e) {
        errorMsg.innerText = 'Falha na autenticação biométrica.';
        errorMsg.style.display = 'block';
    }
});

// 🔥 FUNÇÃO DE LOGIN/CADASTRO NORMAL
actionBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    if (!username || !password) {
        errorMsg.innerText = 'Preencha todos os campos';
        errorMsg.style.display = 'block';
        return;
    }

    const isLogin = formTitle.innerText === 'Entrar';
    const url = isLogin ? '/auth/login' : '/auth/register';

    try {
        errorMsg.style.display = 'none';
        actionBtn.innerText = '⏳ Carregando...';

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (data.success) {
            const userToSave = {
                id: data.user._id || data.user.id,
                username: data.user.username,
                isPremium: data.user.isPremium || false,
                token: data.token
            };
            localStorage.setItem('matrixUser', JSON.stringify(userToSave));
            token = data.token;
            currentUser = userToSave;

            if (isLogin && window.PublicKeyCredential) {
                try {
                    const challenge = new Uint8Array(32);
                    const credential = await navigator.credentials.create({
                        publicKey: {
                            challenge: challenge,
                            rp: { name: "Matrix OS", id: window.location.hostname },
                            user: {
                                id: Uint8Array.from(username, c => c.charCodeAt(0)),
                                name: username,
                                displayName: username
                            },
                            pubKeyCredParams: [{ type: "public-key", alg: -7 }],
                            authenticatorSelection: {
                                authenticatorAttachment: "platform",
                                userVerification: "required"
                            }
                        }
                    });

                    if (credential) {
                        const credData = {
                            username: username,
                            password: password,
                            credentialId: btoa(String.fromCharCode(...new Uint8Array(credential.id)))
                        };
                        localStorage.setItem('matrix_bio_credentials', JSON.stringify(credData));
                    }
                } catch (e) {}
            }

            window.location.href = '/index.html';
        } else {
            errorMsg.innerText = data.error || 'Erro desconhecido';
            errorMsg.style.display = 'block';
        }
    } catch (e) {
        errorMsg.innerText = 'Erro de conexão.';
        errorMsg.style.display = 'block';
    } finally {
        actionBtn.innerText = isLogin ? 'Entrar' : 'Cadastrar';
    }
});
