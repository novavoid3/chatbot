/* SMK Muhammadiyah 1 Kota Sukabumi — JavaScript murni, tanpa library */
(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Menu mobile ---------- */
  const toggle = $('.menu-toggle');
  const nav = $('#site-nav');
  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi');
    nav.classList.toggle('open', open);
  }
  if (toggle) {
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('click', e => {
      if (!e.target.closest('.navbar')) setMenu(false);
    });
  }

  /* ---------- Bayangan header saat scroll ---------- */
  const header = $('.site-header');
  function onScroll() {
    if (header) header.style.boxShadow = window.scrollY > 10 ? '0 8px 30px rgba(15,118,110,.12)' : 'none';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Penanda menu aktif ---------- */
  const links = $$('.nav-link');
  const sections = links
    .map(l => document.getElementById((l.getAttribute('href') || '').slice(1)))
    .filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          links.forEach(l => l.classList.toggle('is-current', l.getAttribute('href') === '#' + en.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => io.observe(s));
  }

  /* ---------- Hitung naik angka statistik ---------- */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduce) {
    const cio = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = parseInt(el.textContent, 10);
        if (isNaN(target)) { obs.unobserve(el); return; }
        const start = performance.now();
        const dur = 1100;
        (function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        })(start);
        obs.unobserve(el);
      });
    }, { threshold: 0.6 });
    $$('.stat-number').forEach(el => { if (/^\d+$/.test(el.textContent.trim())) cio.observe(el); });
  }

  /* ---------- Chatbot ---------- */
  const launcher = $('#chatLauncher');
  const widget = $('#chatbot-widget');
  const closeBtn = $('#cbClose');
  const messages = $('#cbMessages');
  const form = $('#cbForm');
  const input = $('#cbInput');
  if (!launcher || !widget || !messages || !form || !input) return;

  const fmtTime = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  function setChat(open) {
    widget.setAttribute('aria-hidden', String(!open));
    widget.classList.toggle('open', open);
    launcher.setAttribute('aria-expanded', String(open));
    launcher.classList.toggle('is-open', open);
    launcher.setAttribute('aria-label', open ? 'Tutup asisten sekolah' : 'Buka asisten sekolah');
    if (open) setTimeout(() => input.focus(), 250);
  }
  launcher.addEventListener('click', () => setChat(widget.getAttribute('aria-hidden') === 'true'));
  closeBtn && closeBtn.addEventListener('click', () => { setChat(false); launcher.focus(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { setChat(false); setMenu(false); } });

  const firstTime = $('.cb-time', messages);
  if (firstTime) firstTime.textContent = fmtTime();

  function scrollDown() { messages.scrollTop = messages.scrollHeight; }

  function addMsg(text, who) {
    const wrap = document.createElement('div');
    wrap.className = 'cb-msg ' + who;
    const t = document.createElement('span');
    t.className = 'cb-message-text';
    t.textContent = text;
    const time = document.createElement('time');
    time.className = 'cb-time';
    time.textContent = fmtTime();
    wrap.append(t, time);
    const quick = $('.quick-replies', messages);
    quick ? messages.insertBefore(wrap, quick) : messages.appendChild(wrap);
    scrollDown();
    return wrap;
  }

  /* Hanya berisi informasi yang ada di website. Untuk hal lain, arahkan ke sekolah. */
  const MAPS = 'https://www.google.com/maps/search/?api=1&query=SMK+Muhammadiyah+1+Kota+Sukabumi';
  const KB = [
    { k: ['alamat', 'lokasi', 'dimana', 'di mana', 'maps', 'peta', 'kontak', 'telepon', 'hubungi'],
      a: 'SMK Muhammadiyah 1 Kota Sukabumi berada di Jl. Syamsudin, S.H. No. 59, Kota Sukabumi, Jawa Barat. Lokasi di peta: ' + MAPS },
    { k: ['daftar', 'pendaftaran', 'ppdb', 'syarat', 'biaya'],
      a: 'Untuk info pendaftaran, syarat, dan biaya, silakan datang langsung ke sekolah pada jam kerja agar mendapat informasi yang paling akurat.' },
    { k: ['jam', 'belajar', 'masuk', 'pulang', 'jadwal'],
      a: 'Informasi jam belajar belum tercantum di website ini. Silakan tanyakan langsung ke sekolah pada jam kerja ya.' },
    { k: ['ekstra', 'ekskul', 'minat', 'bakat', 'kegiatan'],
      a: 'Sekolah menyediakan kegiatan Minat & Bakat untuk mencoba hal baru dan mengasah potensi siswa. Daftar lengkap kegiatannya bisa ditanyakan langsung ke sekolah.' },
    { k: ['akreditasi', 'status', 'swasta'],
      a: 'SMK Muhammadiyah 1 Kota Sukabumi adalah sekolah swasta dengan akreditasi A.' },
    { k: ['fasilitas', 'lab', 'laboratorium', 'komputer', 'perpustakaan', 'kelas', 'bahasa'],
      a: 'Fasilitas kami: 13 ruang kelas, 4 laboratorium komputer, serta perpustakaan dan laboratorium bahasa.' },
    { k: ['kurikulum'],
      a: 'Sekolah menggunakan Kurikulum 2013, dipadukan dengan pembinaan akhlak dan nilai Kemuhammadiyahan.' },
    { k: ['studi tour', 'tour', 'yogyakarta', 'jogja', 'silaturahim'],
      a: 'Ada kegiatan silaturahim dan studi tour rutin, termasuk kunjungan ke Pimpinan Pusat Muhammadiyah di Yogyakarta.' },
    { k: ['jurusan', 'program keahlian', 'kompetensi'],
      a: 'Informasi jurusan belum tercantum di website ini. Silakan tanyakan langsung ke sekolah untuk daftar program keahlian terbaru.' },
    { k: ['halo', 'hai', 'hi', 'assalam', 'selamat'],
      a: 'Halo! Senang kamu mampir. Mau tahu tentang pendaftaran, fasilitas, atau lokasi sekolah?' },
    { k: ['terima kasih', 'makasih', 'thanks'],
      a: 'Sama-sama! Kalau ada yang ingin ditanyakan lagi, aku di sini.' }
  ];
  const FALLBACK = 'Maaf, aku belum punya jawaban untuk itu. Coba tanyakan langsung ke sekolah di Jl. Syamsudin, S.H. No. 59, Sukabumi pada jam kerja ya.';

  function answer(q) {
    const s = q.toLowerCase();
    const hit = KB.find(item => item.k.some(w => s.includes(w)));
    return hit ? hit.a : FALLBACK;
  }

  function ask(text) {
    text = text.trim();
    if (!text) return;
    addMsg(text, 'user');
    const quick = $('.quick-replies', messages);
    if (quick) quick.remove();
    const typing = addMsg('…', 'bot');
    const delay = reduce ? 0 : 500 + Math.random() * 400;
    setTimeout(() => {
      typing.remove();
      addMsg(answer(text), 'bot');
    }, delay);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    ask(input.value);
    input.value = '';
  });
  $$('.quick-reply', messages).forEach(b => b.addEventListener('click', () => ask(b.textContent)));
})();