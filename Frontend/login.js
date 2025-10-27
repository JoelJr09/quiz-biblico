const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const messageEl = document.getElementById("message");

  if (!email || !password) {
    messageEl.textContent = "Preencha todos os campos!";
    return;
  }

  try {
    const response = await fetch("https://quiz-biblico-api-joel.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("username", data.username);
      localStorage.setItem("userLevel", data.level);
      window.location.href = "quiz.html"; // redireciona ao quiz
    } else {
      messageEl.textContent = data.message;
    }
  } catch (err) {
    messageEl.textContent = "Erro de conexão com o servidor.";
  }
});
