import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import cors from "cors";
import User from "./models/User.js";
import Result from "./models/Result.js";
import Question from "./models/Question.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔗 Conexão com o MongoDB
// Pega a string de conexão secreta do ambiente do servidor
const dbUri = process.env.MONGODB_URI; 

mongoose.connect(dbUri)
  .then(() => console.log("✅ MongoDB (Atlas) conectado"))
  .catch(err => console.error("❌ Erro ao conectar ao MongoDB:", err));

// 🧾 Registro de usuário
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email já cadastrado" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ username, email, passwordHash });
    await user.save();

    res.json({ message: "Usuário registrado com sucesso" });
  } catch (err) {
    res.status(500).json({ message: "Erro ao registrar usuário" });
  }
});

// 🔑 Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Usuário não encontrado" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(400).json({ message: "Senha incorreta" });

  // 👇 ENVIE O NÍVEL DO USUÁRIO JUNTO
  res.json({ 
    userId: user._id, 
    username: user.username,
    level: user.level // <-- ADICIONADO
  });
});

// 💾 Salvar resultado
app.post("/save-result", async (req, res) => {
  const { userId, score } = req.body;
  const result = new Result({ userId, score });
  await result.save();
  res.json({ message: "Resultado salvo!" });
});

app.get("/questions/:level", async (req, res) => {
  try {
    const level = parseInt(req.params.level, 10);

    // Isso usa um "aggregation pipeline" do MongoDB para:
    // 1. $match: Encontrar todas as perguntas do nível certo.
    // 2. $sample: Pegar 5 delas aleatoriamente.
    const questions = await Question.aggregate([
      { $match: { level: level } },
      { $sample: { size: 5 } }
    ]);

    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar perguntas" });
  }
});

app.get("/user-data/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    // Envia apenas os dados seguros e necessários
    res.json({
      username: user.username,
      level: user.level
    });
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar dados do usuário" });
  }
});

app.post("/update-level", async (req, res) => {
  try {
    const { userId } = req.body;
    
    // $inc (increment) é um operador do MongoDB para somar 1 ao campo 'level'
    await User.findByIdAndUpdate(userId, { $inc: { level: 1 } });
    
    res.json({ message: "Nível atualizado com sucesso!" });
  } catch (err) {
    res.status(500).json({ message: "Erro ao atualizar nível" });
  }
});

// 📜 Consultar resultados
app.get("/results/:userId", async (req, res) => {
  const results = await Result.find({ userId: req.params.userId }).sort({ date: -1 });
  res.json(results);
});

app.listen(3000, () => console.log("✅ Servidor na porta 3000"));
