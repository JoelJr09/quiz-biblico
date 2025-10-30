const apiUrl = "https://quiz-biblico-api-joel.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

  // 1. Proteção: Se não está logado, volta ao index
  if (!userId) {
    window.location.href = "index.html";
    return;
  }

  const welcomeEl = document.getElementById("map-welcome");
  const pathListEl = document.querySelector(".path-list");
  
 // welcomeEl.innerText = `Olá, ${username}! Este é o seu progresso:`;

  // 2. Busca o nível atualizado do usuário no backend
  fetchLevelData(userId, pathListEl);
});

async function fetchLevelData(userId, pathListEl) {
  try {
    const response = await fetch(`${apiUrl}/user-data/${userId}`);
    const data = await response.json();
    const userLevel = data.level;

    // 3. "Desenha" o mapa
    renderMap(userLevel, pathListEl);

  } catch (err) {
    console.error("Erro ao buscar nível:", err);
    pathListEl.innerHTML = "<p>Não foi possível carregar seu progresso.</p>";
  }
}

/**
 * Cria os 10 "nós" do caminho e aplica os estilos
 * @param {number} userLevel - O nível atual do usuário (ex: 3)
 */
function renderMap(userLevel, pathListEl) {
  pathListEl.innerHTML = ""; // Limpa o carregando
  const MAX_LEVELS = 10; // O seu objetivo de 10 níveis

  for (let i = 1; i <= MAX_LEVELS; i++) {
    const li = document.createElement("li");
    li.classList.add("level-node");
    li.innerText = i; // Mostra o número do nível

    // Adiciona uma linha de conexão (exceto para o último)
    if (i < MAX_LEVELS) {
      const line = document.createElement("span");
      line.classList.add("path-line");
      li.appendChild(line);
    }
    
    // 4. Aplica as classes de estilo
    if (i < userLevel) {
      // Nível já completado
      li.classList.add("level-complete");
      li.title = `Nível ${i}: Concluído`;
    } else if (i === userLevel) {
      // Nível atual do usuário
      li.classList.add("level-current");
      li.title = `Nível ${i}: Você está aqui!`;
    } else {
      // Nível futuro (bloqueado)
      li.classList.add("level-locked");
      li.title = `Nível ${i}: Bloqueado`;
    }

    pathListEl.appendChild(li);
  }
}