/* ==== Bé Vui Học Toán — phần lõi: tiện ích, giọng nói, âm thanh, linh vật ==== */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---- Lưu trữ ---- */
const store = {
  get(k, d) { try { const v = localStorage.getItem('bvht_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('bvht_' + k, JSON.stringify(v)); } catch (e) {} }
};
const settings = Object.assign({ max: 10, rate: 0.9, voice: true, sfx: true, autoListen: false, childName: '' }, store.get('settings', {}));
const progress = Object.assign({ stars: 0, stickers: [], stats: {}, videos: [] }, store.get('progress', {}));
function save() { store.set('settings', settings); store.set('progress', progress); }
function addStar(n = 1) {
  progress.stars += n; save();
  const el = $('#starCount'); el.textContent = progress.stars;
  const box = el.parentElement; box.classList.remove('bump'); void box.offsetWidth; box.classList.add('bump');
}
function stat(mod, ok) { const s = progress.stats[mod] || (progress.stats[mod] = { ok: 0, total: 0 }); s.total++; if (ok) s.ok++; save(); }

/* ---- Màn hình hiện tại (để huỷ việc cũ khi chuyển màn) ---- */
let screenTok = 0;
const alive = tok => tok === screenTok;

/* ---- Số thành chữ tiếng Việt ---- */
const UNITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
function numWord(n) {
  if (n < 10) return UNITS[n];
  if (n === 10) return 'mười';
  if (n < 20) { const u = n % 10; return 'mười ' + (u === 5 ? 'lăm' : UNITS[u]); }
  const t = Math.floor(n / 10), u = n % 10;
  return UNITS[t] + ' mươi' + (u ? ' ' + (u === 5 ? 'lăm' : u === 1 ? 'mốt' : UNITS[u]) : '');
}

/* ---- Nhận dạng số từ lời nói ---- */
const WORDNUM = { 'không': 0, 'một': 1, 'mốt': 1, 'hai': 2, 'ba': 3, 'bốn': 4, 'tư': 4, 'năm': 5, 'lăm': 5, 'nhăm': 5, 'sáu': 6, 'bảy': 7, 'bẩy': 7, 'tám': 8, 'chín': 9 };
function parseNumber(text) {
  text = (text || '').toLowerCase().normalize('NFC');
  const d = text.match(/\d+/); if (d) return parseInt(d[0], 10);
  const tk = text.split(/[\s,.!?]+/).filter(Boolean);
  for (let i = 0; i < tk.length; i++) {
    const w = tk[i];
    if (w === 'mười') { const nx = WORDNUM[tk[i + 1]]; return 10 + (nx > 0 ? nx : 0); }
    if (!(w in WORDNUM)) continue;
    const v = WORDNUM[w];
    if (tk[i + 1] === 'mươi') { const nx = WORDNUM[tk[i + 2]]; return v * 10 + (nx > 0 ? nx : 0); }
    return v;
  }
  return null;
}

/* ---- Giọng đọc (Text-to-Speech) ---- */
const TTS = {
  voice: null, ok: 'speechSynthesis' in window,
  init() {
    if (!this.ok) return;
    const choose = () => {
      const vs = speechSynthesis.getVoices();
      this.voice = vs.find(v => /^vi[-_]VN/i.test(v.lang) && /google/i.test(v.name)) || vs.find(v => /^vi/i.test(v.lang)) || null;
    };
    choose(); speechSynthesis.onvoiceschanged = choose;
  },
  say(text, opt = {}) {
    if (!settings.voice || !this.ok || !text) return Promise.resolve();
    speechSynthesis.cancel();
    return new Promise(res => {
      let done = false; const fin = () => { if (done) return; done = true; Owl.talk(false); res(); };
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'vi-VN'; if (this.voice) u.voice = this.voice;
      u.rate = opt.rate || settings.rate; u.pitch = opt.pitch || 1.15;
      u.onstart = () => Owl.talk(true); u.onend = fin; u.onerror = fin;
      speechSynthesis.speak(u);
      setTimeout(fin, 1500 + text.length * 110 / (settings.rate || 1));
    });
  },
  stop() { if (this.ok) speechSynthesis.cancel(); Owl.talk(false); }
};

/* ---- Nhận giọng nói (Speech Recognition) ---- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
let currentRec = null;
function listen() {
  return new Promise((res, rej) => {
    if (!SR) return rej('unsupported');
    TTS.stop();
    const r = new SR(); currentRec = r;
    r.lang = 'vi-VN'; r.interimResults = false; r.maxAlternatives = 5; r.continuous = false;
    let got = false;
    r.onresult = e => { got = true; res([...e.results[0]].map(a => a.transcript)); };
    r.onerror = e => { got = true; rej(e.error); };
    r.onend = () => { currentRec = null; if (!got) res([]); };
    try { r.start(); } catch (e) { rej('busy'); }
  });
}
function stopRec() { if (currentRec) { try { currentRec.abort(); } catch (e) {} currentRec = null; } }

/* ---- Hiệu ứng âm thanh (tạo bằng WebAudio, không cần tệp) ---- */
let actx;
function tone(freqs, dur = .12, type = 'sine', vol = .2) {
  if (!settings.sfx) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = actx.currentTime;
    freqs.forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(vol, t0 + i * dur); g.gain.exponentialRampToValueAtTime(.001, t0 + (i + 1) * dur);
      o.connect(g).connect(actx.destination); o.start(t0 + i * dur); o.stop(t0 + (i + 1) * dur + .02);
    });
  } catch (e) {}
}
const sfx = {
  ok: () => tone([523, 659, 784], .1, 'triangle'),
  bad: () => tone([260, 200], .15, 'square', .06),
  pop: () => tone([880, 1320], .05, 'sine', .15),
  flip: () => tone([660], .06, 'triangle', .12),
  boing: () => tone([300, 450, 600], .07, 'sine', .15),
  whoosh: () => tone([900, 700, 500, 300], .05, 'sawtooth', .04),
  win: () => tone([523, 659, 784, 1047, 784, 1047], .13, 'triangle')
};

/* ---- Pháo giấy ---- */
const Confetti = (() => {
  let cv, cx, parts = [], running = false;
  const COLS = ['#e63946', '#ffb703', '#2a9d8f', '#219ebc', '#8e44ad', '#fb8500', '#ff006e'];
  function loop() {
    cx.clearRect(0, 0, cv.width, cv.height);
    parts.forEach(p => { p.vy += .25; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life--;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); cx.restore(); });
    parts = parts.filter(p => p.life > 0 && p.y < cv.height + 20);
    if (parts.length) requestAnimationFrame(loop); else { running = false; cx.clearRect(0, 0, cv.width, cv.height); }
  }
  return {
    burst(x, y, n = 60) {
      cv = cv || $('#confetti'); cx = cx || cv.getContext('2d');
      cv.width = innerWidth; cv.height = innerHeight;
      if (x == null) { x = innerWidth / 2; y = innerHeight / 3; }
      for (let i = 0; i < n; i++) parts.push({ x, y, vx: (Math.random() - .5) * 14, vy: -Math.random() * 12 - 4, r: 0, vr: (Math.random() - .5) * .4, s: rnd(8, 16), c: pick(COLS), life: 120 });
      if (!running) { running = true; loop(); }
    },
    at(el, n) { const b = el.getBoundingClientRect(); this.burst(b.left + b.width / 2, b.top + b.height / 2, n); }
  };
})();

/* ---- Linh vật: Cú Tí Hon ---- */
const OWL_SVG = `<svg viewBox="0 0 100 110"><g class="body">
<ellipse cx="50" cy="104" rx="26" ry="5" fill="rgba(0,0,0,.12)"/>
<path class="wingL" d="M22 52 Q6 70 18 92 Q28 80 30 62Z" fill="#6f4518"/>
<path class="wingR" d="M78 52 Q94 70 82 92 Q72 80 70 62Z" fill="#6f4518"/>
<path d="M20 30 L26 8 L38 22 Q50 18 62 22 L74 8 L80 30 Q88 60 76 90 Q64 104 50 104 Q36 104 24 90 Q12 60 20 30Z" fill="#8d5524"/>
<ellipse cx="50" cy="76" rx="20" ry="22" fill="#f4d6a0"/>
<path d="M40 70 q3 3 6 0 M54 70 q3 3 6 0 M44 82 q3 3 6 0 M50 82 q3 3 6 0" stroke="#c9a66b" stroke-width="2" fill="none"/>
<circle cx="36" cy="40" r="14" fill="#fff"/><circle cx="64" cy="40" r="14" fill="#fff"/>
<circle cx="38" cy="42" r="7" fill="#222"/><circle cx="62" cy="42" r="7" fill="#222"/>
<circle cx="40" cy="39" r="2.5" fill="#fff"/><circle cx="64" cy="39" r="2.5" fill="#fff"/>
<g class="eyelid" style="transform-box:fill-box"><rect x="22" y="26" width="28" height="28" rx="14" fill="#8d5524"/><rect x="50" y="26" width="28" height="28" rx="14" fill="#8d5524"/></g>
<path class="beak" style="transform-box:fill-box;transform-origin:50% 0" d="M45 52 L55 52 L50 61Z" fill="#fb8500"/>
<circle cx="28" cy="55" r="4" fill="#ff8fab" opacity=".7"/><circle cx="72" cy="55" r="4" fill="#ff8fab" opacity=".7"/>
<path d="M40 100 l-4 6 M44 101 l0 6 M56 101 l0 6 M60 100 l4 6" stroke="#fb8500" stroke-width="3" stroke-linecap="round"/>
</g></svg>`;
const Owl = {
  html(cls = '') { return `<div class="owl ${cls}" onclick="Owl.poke(this)">${OWL_SVG}</div>`; },
  each(f) { $$('.owl').forEach(f); },
  talk(on) { this.each(o => o.classList.toggle('talk', on)); },
  mood(m) { this.each(o => { o.classList.remove('happy', 'sad'); void o.offsetWidth; o.classList.add(m); setTimeout(() => o.classList.remove(m), 1600); }); },
  poke(el) { sfx.boing(); this.mood('happy'); TTS.say(pick(['Chào bạn nhỏ! Mình là Cú Tí Hon.', 'Hôm nay mình cùng học toán nhé!', 'Hu hu! Bạn giỏi lắm đó!', 'Cùng chơi với mình nào!'])); }
};

const PRAISE = ['Giỏi quá!', 'Đúng rồi!', 'Tuyệt vời!', 'Con làm tốt lắm!', 'Hoan hô!', 'Xuất sắc!', 'Đúng rồi, giỏi ghê!'];
const RETRY = ['Chưa đúng rồi, con thử lại nhé!', 'Gần đúng rồi, thử lần nữa nào!', 'Không sao, con nghĩ thêm chút nữa nhé!'];
const STICKERS = ['🦁', '🐯', '🐼', '🐨', '🐸', '🐵', '🦊', '🐰', '🐻', '🐷', '🐮', '🦄', '🐙', '🦕', '🐳', '🦋', '🐢', '🦜', '🐧', '🦒', '🐘', '🦓', '🐬', '🐝', '🌈', '🚀', '🚂', '🎠', '🍦', '🍩'];

function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2500); }
function setTitle(t) { $('#title').textContent = t; document.title = t + ' – Bé Vui Học Toán'; }
function go(h) { location.hash = h; }

/* ---- Đồ vật để đếm ---- */
const THINGS = [['🍎', 'quả táo'], ['🍌', 'quả chuối'], ['🐟', 'con cá'], ['🐥', 'chú gà con'], ['⭐', 'ngôi sao'], ['🚗', 'chiếc ô tô'], ['🎈', 'quả bóng bay'], ['🐞', 'con bọ rùa'], ['🍓', 'quả dâu'], ['🐶', 'chú cún'], ['🌸', 'bông hoa'], ['🦋', 'con bướm'], ['🐢', 'chú rùa'], ['🍊', 'quả cam']];
const COLORS = ['#e63946', '#fb8500', '#ffb703', '#2a9d8f', '#219ebc', '#8e44ad', '#ff006e', '#52b788'];
function objs(n, emoji, cls = '') {
  return `<div class="objs ${typeof cls === 'string' ? cls : ''}">${Array.from({ length: n }, (_, k) =>
    `<span class="ob ${typeof cls === 'function' ? cls(k) : ''}" style="animation-delay:${k * 60}ms">${emoji}</span>`).join('')}</div>`;
}

/* ---- Hình học ---- */
const SHAPES = { tron: 'hình tròn', vuong: 'hình vuông', tamgiac: 'hình tam giác', chunhat: 'hình chữ nhật' };
function shapeSVG(t, c, size = 90, outline = false) {
  let inner;
  if (t === 'tron') inner = '<circle cx="50" cy="50" r="42"/>';
  else if (t === 'vuong') inner = '<rect x="10" y="10" width="80" height="80" rx="4"/>';
  else if (t === 'tamgiac') inner = '<polygon points="50,8 94,88 6,88"/>';
  else inner = '<rect x="3" y="24" width="94" height="52" rx="4"/>';
  const style = outline ? 'fill="none" stroke="#999" stroke-width="4" stroke-dasharray="8 6"' : `fill="${c}" stroke="rgba(0,0,0,.25)" stroke-width="3"`;
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" style="overflow:visible"><g ${style}>${inner}</g></svg>`;
}
function parseShape(t) {
  t = (t || '').toLowerCase();
  if (/tròn/.test(t)) return 'tron';
  if (/chữ nhật|nhật/.test(t)) return 'chunhat';
  if (/vuông/.test(t)) return 'vuong';
  if (/tam giác|giác/.test(t)) return 'tamgiac';
  return null;
}
