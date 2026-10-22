// rag/retriever.js
// Memuat index ke memori lalu mencari chunk yang paling mirip dengan pertanyaan.

import fs from 'node:fs';
import { embedTexts } from './embed.js';

let store = [];

export function loadIndex(path = 'data/index.json') {
  if (!fs.existsSync(path)) {
    console.warn(`[RAG] ${path} tidak ditemukan. Jalankan: npm run ingest`);
    store = [];
    return 0;
  }
  store = JSON.parse(fs.readFileSync(path, 'utf8')).chunks;
  console.log(`[RAG] ${store.length} chunk dimuat dari ${path}`);
  return store.length;
}

// Vektor sudah dinormalisasi, jadi dot product = cosine similarity.
const dot = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0);

export async function retrieve(ai, query, { topK = 4, minScore = 0.5 } = {}) {
  if (store.length === 0) return [];

  const [qVec] = await embedTexts(ai, [query], 'RETRIEVAL_QUERY');

  const ranked = store
    .map((c) => ({ source: c.source, heading: c.heading, text: c.text, score: dot(qVec, c.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  // log untuk kalibrasi ambang skor (lihat Bab 9)
  console.log('[RAG]', query.slice(0, 60), '=>', ranked.map((r) => r.score.toFixed(2)).join(', '));

  return ranked.filter((r) => r.score >= minScore);
}
