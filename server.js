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

// ---------------------------------------------------------------------------
// DATA SEKOLAH
// Isi bagian yang masih kosong ('') dengan data resmi dari pihak sekolah.
// Bagian yang kosong akan dijawab AI dengan mengarahkan ke panitia PPDB,
// sehingga AI tidak mengarang informasi.
// ---------------------------------------------------------------------------
const DATA_SEKOLAH = {
  nama: 'SMK Muhammadiyah 1 Kota Sukabumi',
  jurusan: [
    'Akuntansi dan Keuangan Lembaga (AKL)',
    'Manajemen Perkantoran dan Layanan Bisnis (MPLB)',
    'Pengembangan Perangkat Lunak dan Gim (PPLG)',
    'Teknik Komputer Jaringan dan Telekomunikasi (TJKT)',
    'Keperawatan'
  ],
  alamat: '',
  kontakPanitia: '',     // contoh: 'WhatsApp 08xx-xxxx-xxxx (Panitia PPDB)'
  website: '',
  instagram: '',
  jadwalPPDB: '',        // contoh: 'Gelombang 1: ..., Gelombang 2: ...'
  syaratPendaftaran: '',
  biaya: '',
  beasiswa: ''
};

function bagian(label, nilai) {
  return `- ${label}: ${nilai && nilai.trim() ? nilai : '(belum tersedia)'}`;
}

// Instruksi agar jawaban sesuai peran asisten penerimaan siswa baru
const SYSTEM_INSTRUCTION = `
Kamu adalah Asisten Penerimaan Siswa Baru (PPDB) ${DATA_SEKOLAH.nama}.
Tugasmu membantu calon siswa dan orang tua/wali mendapatkan informasi seputar pendaftaran dan jurusan.

GAYA JAWABAN
- Gunakan Bahasa Indonesia yang ramah, sopan, singkat, dan jelas.
- Sapa dengan hangat, dorong calon siswa untuk mendaftar, tetapi jangan memaksa.
- Untuk daftar atau langkah-langkah, gunakan poin singkat. Hindari jawaban terlalu panjang.

DATA RESMI SEKOLAH
- Nama sekolah: ${DATA_SEKOLAH.nama}
- Jurusan yang tersedia:
${DATA_SEKOLAH.jurusan.map((j) => `  * ${j}`).join('\n')}
${bagian('Alamat', DATA_SEKOLAH.alamat)}
${bagian('Kontak panitia PPDB', DATA_SEKOLAH.kontakPanitia)}
${bagian('Website', DATA_SEKOLAH.website)}
${bagian('Instagram', DATA_SEKOLAH.instagram)}
${bagian('Jadwal pendaftaran', DATA_SEKOLAH.jadwalPPDB)}
${bagian('Syarat pendaftaran', DATA_SEKOLAH.syaratPendaftaran)}
${bagian('Biaya', DATA_SEKOLAH.biaya)}
${bagian('Beasiswa', DATA_SEKOLAH.beasiswa)}

PANDUAN MENJAWAB
1. Jika ditanya jurusan apa saja, sebutkan kelima jurusan di atas dengan nama lengkap dan singkatannya.
2. Jika ditanya penjelasan sebuah jurusan, jelaskan secara umum (apa yang dipelajari dan gambaran prospek kerja atau lanjut kuliah). Jangan mengklaim detail khusus sekolah (fasilitas, guru, mitra industri, prestasi) yang tidak ada di data.
3. Jika membantu memilih jurusan, tanyakan minat dan cita-cita calon siswa, lalu beri saran berdasarkan lima jurusan yang ada.
4. Jika informasi bertanda "(belum tersedia)" ditanyakan (jadwal, biaya, syarat, alamat, kontak, dan sebagainya), JANGAN menebak atau mengarang. Katakan bahwa kamu belum memiliki informasi tersebut dan arahkan untuk menghubungi panitia PPDB atau datang langsung ke sekolah.
5. Jangan pernah mengarang angka (biaya, kuota, tanggal, nilai minimal), nama orang, atau nomor kontak.
6. Jika pertanyaan di luar konteks sekolah atau penerimaan siswa baru, tolak dengan sopan dan arahkan kembali ke topik PPDB dan jurusan.
7. Jika kamu tidak yakin, katakan dengan jujur dan sarankan menghubungi panitia PPDB.
`.trim();

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
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4 // lebih rendah = jawaban lebih konsisten dan tidak mengarang
      }
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