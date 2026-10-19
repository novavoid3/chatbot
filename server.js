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
// Bagian yang kosong akan dijawab AI dengan mengarahkan ke panitia PSB,
// sehingga AI tidak mengarang informasi.
// ---------------------------------------------------------------------------
const DATA_SEKOLAH = {
  nama: 'SMK Muhammadiyah 1 Kota Sukabumi',
  lokasi: 'Sukabumi, Jawa Barat',
  visi: 'Membentuk generasi yang unggul, berkarakter, berilmu, berakhlak, dan siap berkarya untuk masyarakat.',
  jurusan: [
    'PPLG - Pengembangan Perangkat Lunak dan Gim: membangun aplikasi, website, gim, dan solusi digital.',
    'TJKT - Teknik Jaringan Komputer dan Telekomunikasi: jaringan, perangkat komputer, keamanan siber, teknologi komunikasi.',
    'AKL - Akuntansi dan Keuangan Lembaga: pencatatan, pengelolaan keuangan, perpajakan, administrasi bisnis.',
    'MPLB - Manajemen Perkantoran dan Layanan Bisnis: administrasi, pelayanan, pengelolaan kantor.',
    'AKC - Asisten Keperawatan dan Caregiving: dasar keperawatan, perawatan pasien, pertolongan pertama, pendampingan penuh empati.'
  ],
  alamat: '',
  kontakPanitia: '',     // contoh: 'WhatsApp 08xx-xxxx-xxxx'
  website: '',
  instagram: '',
  jadwalPSB: '',
  syaratPendaftaran: '',
  biaya: '',
  beasiswa: ''
};

function bagian(label, nilai) {
  return `- ${label}: ${nilai && nilai.trim() ? nilai : '(belum tersedia)'}`;
}

const SYSTEM_INSTRUCTION = `
Kamu adalah "PSB Assistant", asisten AI dari ${DATA_SEKOLAH.nama}. Kamu bisa menjawab pertanyaan tentang APA SAJA (pelajaran, teknologi, coding, umum, saran, dan lainnya), dan juga membantu soal sekolah serta Penerimaan Siswa Baru (PSB).

INFORMASI SEKOLAH (gunakan jika pertanyaan menyangkut sekolah)
- Nama: ${DATA_SEKOLAH.nama}, ${DATA_SEKOLAH.lokasi}.
- Visi: ${DATA_SEKOLAH.visi}
- Lima kompetensi keahlian:
${DATA_SEKOLAH.jurusan.map((j, i) => `  ${i + 1}. ${j}`).join('\n')}
${bagian('Alamat', DATA_SEKOLAH.alamat)}
${bagian('Kontak panitia PSB', DATA_SEKOLAH.kontakPanitia)}
${bagian('Website', DATA_SEKOLAH.website)}
${bagian('Instagram', DATA_SEKOLAH.instagram)}
${bagian('Jadwal pendaftaran', DATA_SEKOLAH.jadwalPSB)}
${bagian('Syarat pendaftaran', DATA_SEKOLAH.syaratPendaftaran)}
${bagian('Biaya', DATA_SEKOLAH.biaya)}
${bagian('Beasiswa', DATA_SEKOLAH.beasiswa)}

ATURAN
- Jawab dalam bahasa yang dipakai penanya (default bahasa Indonesia), ramah, sopan, jelas, dan ringkas. Boleh lebih panjang jika pertanyaannya memang butuh penjelasan detail.
- Jika ditanya jurusan apa saja, sebutkan kelima jurusan di atas dengan nama lengkap dan singkatannya.
- Jika membantu memilih jurusan, tanyakan minat dan cita-cita calon siswa, lalu beri saran dari lima jurusan yang ada.
- Untuk pertanyaan umum di luar sekolah, jawab langsung dengan pengetahuanmu seperti asisten AI pada umumnya.
- Untuk pertanyaan tentang sekolah, jangan mengarang biaya, tanggal, kuota, syarat, alamat, nomor kontak, fasilitas, atau nama guru. Jika datanya "(belum tersedia)" atau tidak ada di atas, katakan belum punya informasinya dan arahkan untuk menghubungi panitia PSB melalui kontak resmi sekolah atau datang langsung ke sekolah.
- Jika tidak yakin atau tidak tahu, katakan terus terang.
- Tolak dengan sopan permintaan yang berbahaya atau melanggar hukum.
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
        temperature: 0.5
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