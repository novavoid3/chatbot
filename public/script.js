/* SMK Muhammadiyah 1 Kota Sukabumi — interaksi halaman */

/* Isi data di bawah ini jika sudah ada; asisten akan memakainya otomatis. */
const SCHOOL_INFO = {
  address: "Jl. Syamsudin, S.H. No. 59, Kota Sukabumi, Jawa Barat",
  phone: "",       // contoh: "(0266) 000000"
  email: "",       // contoh: "info@smkmuh1sukabumi.sch.id"
  hours: "",       // contoh: "Senin–Jumat, 07.00–15.00 WIB"
  admission: "",   // contoh: "Pendaftaran dibuka Januari–Juni di kantor sekolah."
  extracurricular: "" // contoh: "Pramuka, Hizbul Wathan, Tapak Suci, ..."
};

(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ----- header & menu ----- */
  const header = $(".site-header");
  const toggle = $(".menu-toggle");
  const nav = $("#site-nav");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Tutup menu navigasi" : "Buka menu navigasi");
  });
  $$(".site-nav a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }));

  /* ----- reveal on scroll ----- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + "ms"; io.observe(el); });
  } else {
    reveals.forEach(el => el.classList.add("is-visible"));
  }

  /* ----- active nav link ----- */
  const links = $$(".nav-link");
  const sections = links.map(l => $(l.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.toggle("is-current", l.getAttribute("href") === "#" + e.target.id));
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(s => spy.observe(s));
  }

  /* ----- chatbot ----- */
  const launcher = $("#chatLauncher");
  const widget = $("#chatbot-widget");
  const closeBtn = $("#cbClose");
  const messages = $("#cbMessages");
  const form = $("#cbForm");
  const input = $("#cbInput");

  const timeNow = () => new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":");
  $$(".cb-time").forEach(t => (t.textContent = timeNow()));

  function setOpen(open) {
    widget.classList.toggle("is-open", open);
    widget.setAttribute("aria-hidden", String(!open));
    launcher.classList.toggle("is-open", open);
    launcher.setAttribute("aria-expanded", String(open));
    launcher.setAttribute("aria-label", open ? "Tutup asisten sekolah" : "Buka asisten sekolah");
    if (open) setTimeout(() => input.focus(), 250);
  }
  launcher.addEventListener("click", () => setOpen(!widget.classList.contains("is-open")));
  closeBtn.addEventListener("click", () => { setOpen(false); launcher.focus(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && widget.classList.contains("is-open")) setOpen(false); });

  function addMessage(text, who) {
    const wrap = document.createElement("div");
    wrap.className = "cb-msg " + who;
    const span = document.createElement("span");
    span.className = "cb-message-text";
    span.textContent = text;
    const time = document.createElement("time");
    time.className = "cb-time";
    time.textContent = timeNow();
    wrap.append(span, time);
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
  }

  const visit = " Untuk info paling akurat, kamu bisa datang langsung ke sekolah ya.";

  function answer(raw) {
    const q = raw.toLowerCase();
    const has = (...k) => k.some(w => q.includes(w));
    if (has("jam belajar", "jam masuk", "jadwal", "jam sekolah"))
      return SCHOOL_INFO.hours ? "Jam sekolah: " + SCHOOL_INFO.hours + "." : "Jam belajar bisa berbeda tiap kelas dan semester." + visit;
    if (has("daftar", "pendaftaran", "ppdb", "spmb", "masuk"))
      return SCHOOL_INFO.admission ? SCHOOL_INFO.admission : "Untuk info pendaftaran, syarat, dan biaya, silakan datang langsung ke sekolah di " + SCHOOL_INFO.address + ".";
    if (has("ekstra", "ekskul", "klub", "kegiatan"))
      return SCHOOL_INFO.extracurricular ? "Kegiatan yang tersedia: " + SCHOOL_INFO.extracurricular + "." : "Sekolah memiliki kegiatan pengembangan minat dan bakat." + visit;
    if (has("kontak", "telepon", "telpon", "hubungi", "email", "alamat", "lokasi", "dimana", "di mana")) {
      let t = "Alamat kami: " + SCHOOL_INFO.address + ".";
      if (SCHOOL_INFO.phone) t += " Telepon: " + SCHOOL_INFO.phone + ".";
      if (SCHOOL_INFO.email) t += " Email: " + SCHOOL_INFO.email + ".";
      return t;
    }
    if (has("akreditasi", "fasilitas", "lab", "perpustakaan", "kelas"))
      return "Sekolah kami berakreditasi A dengan 13 ruang kelas, 4 laboratorium komputer, 1 laboratorium bahasa, dan 1 perpustakaan.";
    if (has("halo", "hai", "hi", "assalam", "selamat"))
      return "Halo juga! Mau tanya soal pendaftaran, fasilitas, atau alamat sekolah?";
    if (has("terima kasih", "makasih", "thanks"))
      return "Sama-sama! Semoga harimu menyenangkan.";
    return "Maaf, aku belum punya jawaban untuk itu." + visit;
  }

  function ask(text) {
    const t = text.trim();
    if (!t) return;
    addMessage(t, "user");
    setTimeout(() => addMessage(answer(t), "bot"), 450);
  }

  form.addEventListener("submit", e => { e.preventDefault(); ask(input.value); input.value = ""; });
  $$(".quick-reply").forEach(b => b.addEventListener("click", () => ask(b.textContent)));
})();