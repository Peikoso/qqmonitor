import express from "express";
import fetch from "node-fetch";
import { config } from "../config/index.js";
import { redact } from "../utils/redact.js";

const router = express.Router();
const API_KEY = config.FIREBASE_API_KEY; // do Firebase Console > Project settings > Web API Key

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }

  try {
    // Autentica via Firebase Auth REST API
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(401).json({ error: data.error.message });
    }

    // Retorna apenas o token
    return res.json({ token: data.idToken });
  } catch (err) {
    console.error(redact(err));
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
