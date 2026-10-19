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

  /* Cadangan offline: dipakai HANYA jika server/AI tidak bisa dihubungi. */
  const MAPS = 'https://www.google.com/maps/search/?api=1&query=SMK+Muhammadiyah+1+Kota+Sukabumi';
  const KB = [
    { k: ['alamat', 'lokasi', 'dimana', 'di mana', 'maps', 'peta', 'kontak', 'telepon', 'hubungi'],
      a: 'SMK Muhammadiyah 1 Kota Sukabumi berada di Jl. Syamsudin, S.H. No. 59, Kota Sukabumi, Jawa Barat. Lokasi di peta: ' + MAPS },
    { k: ['daftar', 'pendaftaran', 'ppdb', 'psb', 'syarat', 'biaya'],
      a: 'Untuk info pendaftaran, syarat, dan biaya, silakan datang langsung ke sekolah pada jam kerja agar mendapat informasi yang paling akurat.' },
    { k: ['jurusan', 'program', 'keahlian', 'kompetensi'],
      a: 'Ada 5 kompetensi keahlian: PPLG (Pengembangan Perangkat Lunak dan Gim), TJKT (Teknik Jaringan Komputer dan Telekomunikasi), AKL (Akuntansi dan Keuangan Lembaga), MPLB (Manajemen Perkantoran dan Layanan Bisnis), dan AKC (Asisten Keperawatan dan Caregiving).' },
    { k: ['akreditasi', 'status', 'swasta'],
      a: 'SMK Muhammadiyah 1 Kota Sukabumi adalah sekolah swasta dengan akreditasi A.' },
    { k: ['fasilitas', 'lab', 'laboratorium', 'komputer', 'perpustakaan', 'kelas', 'bahasa'],
      a: 'Fasilitas kami: 13 ruang kelas, 4 laboratorium komputer, serta perpustakaan dan laboratorium bahasa.' },
    { k: ['halo', 'hai', 'hi', 'assalam', 'selamat'],
      a: 'Halo! Senang kamu mampir. Mau tahu tentang jurusan, pendaftaran, fasilitas, atau lokasi sekolah?' }
  ];
  const FALLBACK = 'Maaf, aku belum bisa menjawab saat ini. Coba lagi sebentar, atau tanyakan langsung ke sekolah di Jl. Syamsudin, S.H. No. 59, Sukabumi pada jam kerja ya.';

  function offlineAnswer(q) {
    const s = q.toLowerCase();
    const hit = KB.find(item => item.k.some(w => s.includes(w)));
    return hit ? hit.a : FALLBACK;
  }

  /* Kirim pertanyaan ke server (Gemini) */
  async function tanyaAI(pertanyaan) {
    const res = await fetch('/tanya-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pertanyaan })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!data.jawaban) throw new Error('Jawaban kosong');
    return data.jawaban;
  }

  let sending = false;

  async function ask(text) {
    text = text.trim();
    if (!text || sending) return;
    sending = true;
    addMsg(text, 'user');
    const quick = $('.quick-replies', messages);
    if (quick) quick.remove();
    const typing = addMsg('…', 'bot');

    let jawaban;
    try {
      jawaban = await tanyaAI(text);
    } catch (err) {
      console.error('Gagal memanggil /tanya-ai:', err);
      jawaban = offlineAnswer(text);
    }

    typing.remove();
    addMsg(jawaban, 'bot');
    sending = false;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    ask(input.value);
    input.value = '';
  });
  $$('.quick-reply', messages).forEach(b => b.addEventListener('click', () => ask(b.textContent)));
})();