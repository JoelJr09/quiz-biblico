const apiUrl = "https://quiz-biblico-api-joel.onrender.com";

// O array 'questions' fixo foi REMOVIDO
// As perguntas agora vêm do backend

let shuffledQuestions = []; // Isso agora vai ser preenchido pela API
let currentQuestionIndex = 0;
let score = 0;

// Pega os dados do usuário do localStorage
let username = localStorage.getItem("username");
let userId = localStorage.getItem("userId");
let currentLevel = localStorage.getItem("userLevel"); // Nível do usuário

// Pega os elementos do HTML
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const nextBtn = document.getElementById("next-btn");
const resultEl = document.getElementById("result");
const welcomeEl = document.getElementById("welcome");
const questionContainerEl = document.getElementById("question-container");

// Inicia o quiz quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", startQuiz);

/**
 * Inicia o quiz: busca perguntas do nível atual, reseta o estado.
 */
async function startQuiz() {
  // 1. Verifica se o usuário está logado
  if (!userId) {
    alert("Faça login primeiro!");
    window.location.href = "index.html"; // Redireciona para o login (index.html)
    return;
  }

  // 2. Controla a visibilidade dos elementos
  resultEl.classList.add("hidden"); // Esconde o resultado anterior
  welcomeEl.classList.remove("hidden"); // Mostra a boas-vindas
  questionContainerEl.classList.remove("hidden"); // Mostra o container das perguntas

  // 3. Reseta o estado do quiz
  // Pega só a parte antes do @
  const simpleUsername = username.split('@')[0];
  welcomeEl.innerText = `Bem-vindo(a), ${simpleUsername}! (Nível ${currentLevel})`; // Mostra o nível
  currentQuestionIndex = 0;
  score = 0;

  // 4. Busca as perguntas do backend (API)
  try {
    const response = await fetch(`${apiUrl}/questions/${currentLevel}`);
    if (!response.ok) throw new Error("Falha ao buscar perguntas");

    shuffledQuestions = await response.json();

    // Se não houver perguntas (acabou o jogo ou erro)
    if (shuffledQuestions.length === 0) {
      showGameWin(); // Mostra a tela de "zerou o jogo"
      return;
    }
  } catch (err) {
    console.error("Erro ao carregar perguntas:", err);
    questionEl.innerText =
      "Não foi possível carregar as perguntas. Tente recarregar a página.";
    return;
  }

  // 5. Configura o botão "Próxima"
  nextBtn.innerText = "Próxima";
  nextBtn.onclick = handleNextQuestion; // Define a ação do botão

  // 6. Mostra a primeira pergunta
  showQuestion();
}

/**
 * Mostra a pergunta atual e as opções de resposta.
 */
function showQuestion() {
  resetState(); // Limpa o estado anterior (botões, etc.)

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  questionEl.innerText = currentQuestion.question;

  currentQuestion.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.innerText = answer;
    button.classList.add("answer-btn");
    button.addEventListener("click", () => selectAnswer(index));
    answersEl.appendChild(button);
  });
}

/**
 * Reseta a interface (esconde botão "Próxima" e limpa respostas).
 */
function resetState() {
  nextBtn.classList.add("hidden"); // O botão "Próxima" fica escondido
  answersEl.innerHTML = ""; // Limpa as respostas da pergunta anterior
}

/**
 * Chamada quando o usuário clica em uma resposta.
 * Valida a resposta, atualiza a pontuação e mostra o feedback visual.
 */
function selectAnswer(index) {
  const correct = shuffledQuestions[currentQuestionIndex].correct;
  const buttons = document.querySelectorAll(".answer-btn");

  // Aumenta a pontuação se a resposta estiver correta
  if (index === correct) score++;

  // Feedback visual (cores)
  buttons.forEach((btn, i) => {
    btn.disabled = true; // Desabilita todos os botões
    if (i === correct) {
      btn.style.backgroundColor = "#b2f2bb"; // Verde para a correta
    } else if (i === index) {
      btn.style.backgroundColor = "#f08080"; // Vermelho para a incorreta escolhida
    }
  });

  nextBtn.classList.remove("hidden"); // Mostra o botão "Próxima"
}

/**
 * Chamada quando o usuário clica em "Próxima".
 * Avança para a próxima pergunta ou mostra o resultado final.
 */
function handleNextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < shuffledQuestions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

/**
 * Mostra o resultado final, salva a pontuação e verifica se o usuário subiu de nível.
 */
async function showResult() {
  resetState(); // Limpa a tela

  // Esconde os elementos do quiz
  welcomeEl.classList.add("hidden");
  questionContainerEl.classList.add("hidden");

  const passed = score >= 4; // Condição para subir de nível (4 de 5)
  let message = "";

  if (passed) {
    // --- USUÁRIO PASSOU DE NÍVEL ---
    message = `Perfeito! Você passou para o próximo nível! 🏆`;
    nextBtn.innerText = "Próximo Nível";

    try {
      // Atualiza o nível no backend
      await fetch(`${apiUrl}/update-level`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      // Atualiza o nível no localStorage para o próximo quiz
      currentLevel++;
      localStorage.setItem("userLevel", currentLevel);

    } catch (err) {
      console.error("Erro ao atualizar nível:", err);
      message = "Você passou, mas houve um erro ao salvar seu progresso.";
    }
  } else {
    // --- USUÁRIO NÃO PASSOU ---
    if (score >= 3) {
      message = "Muito bom! Mas você precisa de 4/5 para avançar. Tente de novo! 🙏";
    } else {
      message = "Você ainda pode aprender mais. Tente este nível novamente! 📖";
    }
    nextBtn.innerText = "Tentar Novamente";
  }

  // Mostra a mensagem de resultado
  resultEl.innerHTML = `Parabéns, ${username}!<br>${message}<br><br>Sua pontuação: ${score}/5`;
  resultEl.classList.remove("hidden");

  // Salva o resultado (pontuação) da tentativa atual no backend
  try {
    await fetch(`${apiUrl}/save-result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, score }), // Salva a pontuação
    });
  } catch (err) {
    console.error("Erro ao salvar resultado:", err);
  }

  // Mostra o botão ("Próximo Nível" ou "Tentar Novamente")
  nextBtn.classList.remove("hidden");

  // O botão sempre chama startQuiz, que buscará as perguntas do nível correto (o novo ou o atual)
  nextBtn.onclick = startQuiz;
}

/**
 * (Opcional) Mostra uma mensagem quando o usuário zera o jogo.
 */
function showGameWin() {
  resetState();
  welcomeEl.classList.add("hidden");
  questionContainerEl.classList.add("hidden");
  nextBtn.classList.add("hidden"); // Esconde o botão, não há mais níveis

  resultEl.innerHTML = `Parabéns, ${username}!<br>Você zerou o Quiz Bíblico! 🚀<br><br>Você é um verdadeiro mestre da Palavra!`;
  resultEl.classList.remove("hidden");
}