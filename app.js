// Configurações do seu Firebase (Você pegará no Console do Firebase)
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "ID",
  appId: "APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Função de Login Simplificada
function handleLogin() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, pass).then(userCredential => {
        const user = userCredential.user;
        checkPermissions(user.email);
    }).catch(error => alert("Erro ao acessar: " + error.message));
}

// Lógica de Permissões
function checkPermissions(email) {
    document.getElementById('login-container').classList.add('hidden');
    
    // Defina aqui o e-mail do administrador
    if (email === "admin@seuemail.com") {
        document.getElementById('admin-panel').classList.remove('hidden');
        loadComandasAdmin();
    } else {
        document.getElementById('atendente-panel').classList.remove('hidden');
    }
}

// Salvar Comanda (Atendente)
function saveComanda() {
    const num = document.getElementById('comanda-num').value;
    if (num.length !== 4) return alert("Insira os 4 números");

    db.collection("comandas").add({
        numero: num,
        status: "aberto",
        data: new Date(),
        atendente: auth.currentUser.email
    }).then(() => {
        alert("Comanda registrada!");
        document.getElementById('comanda-num').value = "";
    });
}

// Carregar Dados (Admin)
function loadComandasAdmin() {
    db.collection("comandas").orderBy("data", "desc").onSnapshot(snapshot => {
        const lista = document.getElementById('lista-comandas');
        lista.innerHTML = "";
        snapshot.forEach(doc => {
            const data = doc.data();
            lista.innerHTML += `
                <div style="border-bottom: 1px solid #333; padding: 10px 0; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong># ${data.numero}</strong><br>
                        <small>${data.status === 'aberto' ? '🟡 Pendente' : '🟢 Confirmado'}</small>
                    </div>
                    ${data.status === 'aberto' ? `<button style="width: auto; padding: 5px 10px;" onclick="confirmarComanda('${doc.id}')">Confirmar</button>` : ''}
                </div>
            `;
        });
    });
}

function confirmarComanda(id) {
    db.collection("comandas").doc(id).update({ status: "confirmado" });
}

function logout() {
    auth.signOut().then(() => location.reload());
}

