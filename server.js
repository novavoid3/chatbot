import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Sajikan frontend (index.html, script.js, style.css) dari folder /public
app.use(express.static(path.join(__dirname, 'public')));

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const PORT = process.env.PORT || 3000;

// Instruksi agar jawaban sesuai peran asisten sekolah
const SYSTEM_INSTRUCTION =
  'Kamu adalah Asisten Sekolah yang ramah. Jawab dalam Bahasa Indonesia ' +
  'dengan singkat, jelas, dan sopan. Jika pertanyaan di luar konteks sekolah ' +
  'atau kamu tidak yakin, katakan dengan jujur.';

// Endpoint Tanya AI
app.post('/tanya-ai', async (req, res) => {
  const { pertanyaan } = req.body;

  if (!pertanyaan || typeof pertanyaan !== 'string' || !pertanyaan.trim()) {
    return res.status(400).json({ error: 'Pertanyaan wajib diisi!' });
  }

  try {
    const hasil = await gemini.models.generateContent({
      model: MODEL_NAME,
      contents: pertanyaan.trim(),
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });

    res.status(200).json({ jawaban: hasil.text });
  } catch (error) {
    console.error('Error Gemini:', error);
    res.status(500).json({
      error: 'Gagal memproses API Gemini',
      detail: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
