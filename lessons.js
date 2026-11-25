/* ==== Các bài học dạng câu hỏi ==== */
'use strict';

function numOptions(ans, lo = 0, hi = settings.max, n = 3) {
  const s = new Set([ans]); let g = 0;
  while (s.size < n && g++ < 200) { const v = ans + rnd(-3, 3); if (v >= lo && v <= hi) s.add(v); }
  let k = 1; while (s.size < n) { s.add(ans + k); k++; }
  return shuffle([...s]).map(v => ({ html: v, value: v }));
}
const numQ = o => Object.assign({ parse: parseNumber }, o);

/* 1. Đếm số */
function genCount() {
  const n = rnd(1, settings.max); const [e, name] = pick(THINGS);
  return numQ({ prompt: `Có bao nhiêu ${name}?`, speech: `Con hãy đếm xem, có bao nhiêu ${name}?`, visual: objs(n, e), options: numOptions(n, 1), answer: n, explain: `Có ${numWord(n)} ${name}.` });
}

/* 2. So sánh */
function genCompare() {
  const M = settings.max; const a = rnd(0, M); const b = Math.random() < .25 ? a : rnd(0, M);
  const ans = a > b ? '>' : a < b ? '<' : '='; const [e] = pick(THINGS);
  const side = n => `<div class="cmp-side"><div class="big-num">${n}</div>${M <= 10 ? objs(n, e, 'sm') : ''}</div>`;
  const word = { '>': 'lớn hơn', '<': 'bé hơn', '=': 'bằng' };
  return {
    prompt: `Chọn dấu: ${a} ☐ ${b}`,
    speech: `${numWord(a)} và ${numWord(b)}. Con chọn dấu lớn hơn, bé hơn, hay dấu bằng?`,
    visual: `<div class="cmp">${side(a)}<div class="cmp-box">?</div>${side(b)}</div>`,
    options: [{ html: '&gt;', value: '>' }, { html: '&lt;', value: '<' }, { html: '=', value: '=' }],
    answer: ans,
    parse: t => { t = t.toLowerCase(); if (/lớn|to hơn|nhiều hơn/.test(t)) return '>'; if (/bé|nhỏ|ít hơn/.test(t)) return '<'; if (/bằng/.test(t)) return '='; return null; },
    explain: `${numWord(a)} ${word[ans]} ${numWord(b)}.`,
    onCorrect: () => { $('.cmp-box', app).textContent = ans; }
  };
}

/* 3. Phép cộng */
function genAdd() {
  const M = settings.max; const s = rnd(1, M); const a = rnd(0, s), b = s - a; const [e] = pick(THINGS);
  const vis = s <= 10 ? `<div class="eq">${objs(a, e)}<span class="opsym">+</span>${objs(b, e)}</div>` : '';
  return numQ({
    prompt: `${a} + ${b} = ?`, speech: `${numWord(a)} cộng ${numWord(b)} bằng mấy?`,
    visual: vis + `<div class="eq-text">${a} + ${b} = <span class="ans">?</span></div>`,
    options: numOptions(s, 0), answer: s, explain: `${numWord(a)} cộng ${numWord(b)} bằng ${numWord(s)}.`,
    onCorrect: () => { $('.ans', app).textContent = s; }
  });
}

/* 4. Phép trừ */
function genSub() {
  const M = settings.max; const a = rnd(1, M), b = rnd(0, a), r = a - b; const [e] = pick(THINGS);
  const vis = a <= 10 ? objs(a, e, k => k >= a - b ? 'gone' : '') : '';
  return numQ({
    prompt: `${a} − ${b} = ?`, speech: `${numWord(a)} trừ ${numWord(b)} còn mấy?`,
    visual: vis + `<div class="eq-text">${a} − ${b} = <span class="ans">?</span></div>`,
    options: numOptions(r, 0), answer: r, explain: `${numWord(a)} trừ ${numWord(b)} còn ${numWord(r)}.`,
    onCorrect: () => { $('.ans', app).textContent = r; }
  });
}

/* 5. Hình học */
function genShape() {
  const keys = Object.keys(SHAPES); const t = pick(keys); const v = rnd(0, 4);
  if (v <= 1) { // Chạm vào hình ...
    const opts = shuffle([t, ...shuffle(keys.filter(k => k !== t)).slice(0, 2)]);
    return { prompt: `Chạm vào ${SHAPES[t]}`, speech: `Con hãy chạm vào ${SHAPES[t]}.`, visual: `<div style="font-size:70px">🔍</div>`,
      options: opts.map(k => ({ html: shapeSVG(k, pick(COLORS), 100), value: k, name: SHAPES[k] })), answer: t, parse: parseShape, explain: `Đây là ${SHAPES[t]}.` };
  }
  if (v <= 3) { // Đếm hình
    const cnt = rnd(1, 4); const others = keys.filter(k => k !== t);
    const list = shuffle([...Array(cnt).fill(t), ...Array.from({ length: rnd(2, 4) }, () => pick(others))]);
    return numQ({ prompt: `Có bao nhiêu ${SHAPES[t]}?`, speech: `Con đếm xem có bao nhiêu ${SHAPES[t]}?`,
      visual: `<div class="shape-row">${list.map(k => shapeSVG(k, pick(COLORS), 80)).join('')}</div>`,
      options: numOptions(cnt, 1, 6), answer: cnt, explain: `Có ${numWord(cnt)} ${SHAPES[t]}.` });
  }
  // Đây là hình gì?
  const opts = shuffle([t, ...shuffle(keys.filter(k => k !== t)).slice(0, 2)]);
  return { prompt: 'Đây là hình gì?', speech: 'Đây là hình gì? Con nói to tên hình hoặc chọn nhé.', visual: shapeSVG(t, pick(COLORS), 180),
    options: opts.map(k => ({ html: SHAPES[k].replace('hình ', 'Hình '), value: k, name: SHAPES[k] })), optClass: 'text', answer: t, parse: parseShape, explain: `Đây là ${SHAPES[t]}.` };
}

/* 6. Quy luật */
const PAT_ITEMS = [['🔴', 'đỏ'], ['🔵', 'xanh dương'], ['🟡', 'vàng'], ['🟢', 'xanh lá'], ['🟣', 'tím'], ['⭐', 'ngôi sao'], ['👑', 'vương miện'], ['💎', 'kim cương'], ['🎀', 'nơ'], ['🌸', 'hoa'], ['🦄', 'kỳ lân'], ['🐚', 'vỏ sò']];
function genPattern() {
  if (Math.random() < .6) {
    const pool = shuffle(PAT_ITEMS).slice(0, 4); const p = pick([[0, 1], [0, 0, 1], [0, 1, 1], [0, 1, 2]]);
    const len = p.length === 2 ? 5 : p.length * 2;
    const seq = Array.from({ length: len + 1 }, (_, k) => pool[p[k % p.length]]); const ans = seq[len];
    const used = [...new Set(p)].map(i => pool[i]); while (used.length < 3) used.push(pool[3]);
    return { prompt: 'Tiếp theo là gì?', speech: 'Con nhìn kỹ nhé. Tiếp theo sẽ là hình nào?',
      visual: `<div class="seq">${seq.slice(0, len).map(x => `<span class="it">${x[0]}</span>`).join('')}<span class="qbox">?</span></div>`,
      options: shuffle(used).map(x => ({ html: x[0], value: x[0], name: x[1] })), answer: ans[0],
      parse: t => { t = t.toLowerCase(); const f = used.find(x => t.includes(x[1])); return f ? f[0] : null; },
      onCorrect: () => { $('.qbox', app).textContent = ans[0]; } };
  }
  const M = settings.max; const step = pick([1, 1, -1]); const L = 5;
  const start = step > 0 ? rnd(0, M - L + 1) : rnd(L - 1, M);
  const seq = Array.from({ length: L }, (_, k) => start + step * k); const idx = rnd(1, L - 1); const ans = seq[idx];
  return numQ({ prompt: 'Số nào còn thiếu?', speech: step > 0 ? 'Đếm thêm nào! Số nào còn thiếu?' : 'Đếm lùi nào! Số nào còn thiếu?',
    visual: `<div class="seq">${seq.map((v, k) => k === idx ? '<span class="qbox">?</span>' : `<span class="it">${v}</span>`).join('')}</div>`,
    options: numOptions(ans, 0, M), answer: ans, explain: `Số còn thiếu là ${numWord(ans)}.`, onCorrect: () => { $('.qbox', app).textContent = ans; } });
}

/* 7. Vị trí */
function genPosition() {
  const [o, on] = pick(settings.theme === 'princess' ? [['🏰', 'tòa lâu đài'], ['🌳', 'cái cây'], ['🎁', 'hộp quà'], ['🍄', 'cây nấm']] : [['🌳', 'cái cây'], ['🏠', 'ngôi nhà'], ['📦', 'cái hộp'], ['⛺', 'cái lều']]);
  const [a, an] = pick(settings.theme === 'princess' ? [['👸', 'cô công chúa'], ['🧚', 'nàng tiên'], ['🦄', 'chú kỳ lân'], ['🧜‍♀️', 'nàng tiên cá'], ['🐱', 'mèo con']] : [['🐱', 'chú mèo'], ['🐶', 'chú cún'], ['🐰', 'bạn thỏ'], ['🐥', 'chú gà con'], ['🐻', 'bạn gấu']]);
  const h = Math.random() < .5; const pos = h ? pick(['trai', 'phai']) : pick(['tren', 'duoi']);
  const L = { trai: ['⬅️ Bên trái', 'bên trái'], phai: ['Bên phải ➡️', 'bên phải'], tren: ['⬆️ Ở trên', 'ở trên'], duoi: ['⬇️ Ở dưới', 'ở dưới'] };
  const cell = { trai: 3, phai: 5, tren: 1, duoi: 7 }[pos];
  const cells = Array.from({ length: 9 }, (_, k) => k === 4 ? o : k === cell ? a : '');
  return { prompt: `${an[0].toUpperCase() + an.slice(1)} ở đâu so với ${on}?`, speech: `${an} ở đâu so với ${on}?`,
    visual: `<div class="scene">${cells.map(c => `<div>${c}</div>`).join('')}</div>`,
    options: (h ? ['trai', 'phai'] : ['tren', 'duoi']).map(k => ({ html: L[k][0], value: k, name: L[k][1] })), optClass: 'text', answer: pos,
    parse: t => { t = t.toLowerCase(); if (/trái/.test(t)) return 'trai'; if (/phải/.test(t)) return 'phai'; if (/trên/.test(t)) return 'tren'; if (/dưới/.test(t)) return 'duoi'; return null; },
    explain: `${an} ở ${L[pos][1].replace('ở ', '')} ${on}.` };
}

const MODULES = {
  dem: { name: 'Đếm số', ic: '🔢', color: '#fb8500', sub: 'Đếm đồ vật', gen: genCount },
  sosanh: { name: 'So sánh', ic: '🐊', color: '#219ebc', sub: 'Lớn hơn, bé hơn', gen: genCompare },
  cong: { name: 'Phép cộng', ic: '➕', color: '#2a9d8f', sub: 'Gộp lại', gen: genAdd },
  tru: { name: 'Phép trừ', ic: '➖', color: '#e76f51', sub: 'Bớt đi', gen: genSub },
  hinh: { name: 'Hình học', ic: '🔺', color: '#8e44ad', sub: 'Tròn, vuông, tam giác', gen: genShape },
  quyluat: { name: 'Quy luật', ic: '🧩', color: '#d62828', sub: 'Tìm hình tiếp theo', gen: genPattern },
  vitri: { name: 'Vị trí', ic: '🧭', color: '#3a86ff', sub: 'Trên, dưới, trái, phải', gen: genPosition }
};

/* ---- Bộ máy chạy bài học ---- */
function runQuiz(key, { count = 10, mixed = false, listenAuto = settings.autoListen } = {}) {
  const tok = screenTok; let i = 0, score = 0;
  setTitle(mixed ? 'Thử thách giọng nói' : MODULES[key].name);
  const next = () => {
    if (!alive(tok)) return;
    if (i >= count) return finishScreen({ score, count, again: () => runQuiz(key, { count, mixed, listenAuto }) });
    const mk = mixed ? pick(['dem', 'cong', 'tru', 'sosanh', 'hinh']) : key;
    const q = MODULES[mk].gen(); let tries = 0, done = false;
    app.innerHTML = `<div class="quiz">
      <div class="quiz-top">${Owl.html('small')}<div class="progress"><div style="width:${i / count * 100}%"></div></div><b>${i + 1}/${count}</b></div>
      <div class="prompt"><button class="icon-btn speak" aria-label="Nghe lại">🔊</button><span>${q.prompt}</span></div>
      <div class="visual">${q.visual}</div>
      <div class="options ${q.optClass || ''}">${q.options.map((o, k) => `<button class="opt" data-k="${k}">${o.html}</button>`).join('')}</div>
      ${SR ? '<button class="mic"><b>🎤</b>Bấm rồi nói đáp án</button>' : ''}
      <div class="heard"></div></div>`;
    const btns = $$('.opt', app), heard = $('.heard', app), mic = $('.mic', app);
    const choose = k => {
      if (done || !alive(tok)) return; const o = q.options[k], b = btns[k];
      if (o.value === q.answer) {
        done = true; stopRec(); b.classList.add('correct'); const first = tries === 0;
        if (first) { score++; addStar(); } stat(mk, first); sfx.ok(); Confetti.at(b, 40); Owl.mood('happy');
        if (q.onCorrect) q.onCorrect();
        TTS.say(pick(PRAISE) + ' ' + (q.explain || '')).then(() => setTimeout(() => { if (alive(tok)) { i++; next(); } }, 350));
      } else {
        tries++; b.classList.add('wrong'); b.disabled = true; sfx.bad(); Owl.mood('sad');
        TTS.say((o.name ? `Đó là ${o.name}. ` : '') + pick(RETRY));
        if (tries >= 2) btns[q.options.findIndex(x => x.value === q.answer)].classList.add('hint');
      }
    };
    btns.forEach(b => b.onclick = () => choose(+b.dataset.k));
    $('.speak', app).onclick = () => TTS.say(q.speech);
    const doListen = async () => {
      if (done || !mic) return; mic.classList.add('listening'); heard.textContent = '👂 Con nói đi...';
      try {
        const alts = await listen(); mic.classList.remove('listening'); if (!alive(tok) || done) return;
        if (!alts.length) { heard.textContent = 'Chưa nghe rõ, con bấm micro và nói lại nhé.'; return; }
        let val = null; for (const a of alts) { val = q.parse ? q.parse(a) : null; if (val !== null) break; }
        heard.textContent = `Con nói: “${alts[0]}”`;
        const k = q.options.findIndex(o => o.value === val);
        if (k >= 0 && !btns[k].disabled) choose(k);
        else if (val !== null && val !== q.answer) { tries++; sfx.bad(); Owl.mood('sad'); TTS.say(pick(RETRY)); if (tries >= 2) btns[q.options.findIndex(x => x.value === q.answer)].classList.add('hint'); }
        else TTS.say(Owl.name() + ' chưa nghe rõ, con nói lại nhé.');
      } catch (e) {
        mic.classList.remove('listening');
        heard.textContent = e === 'not-allowed' ? 'Cần cho phép dùng micro (xem Góc bố mẹ).' : e === 'network' ? 'Nhận giọng nói cần kết nối mạng.' : 'Không nghe được, con thử lại nhé.';
      }
    };
    if (mic) mic.onclick = doListen;
    TTS.say(q.speech).then(() => { if (listenAuto && mic && !done && alive(tok)) doListen(); });
  };
  next();
}

/* ---- Màn hình hoàn thành ---- */
function finishScreen({ score, count, again, title = 'Hoàn thành!' }) {
  screenTok++; // dừng mọi việc đang chạy của màn trước
  const sticker = pick(STICKERS); progress.stickers.push(sticker); save();
  sfx.win(); Confetti.burst(null, null, 160); setTimeout(() => Confetti.burst(innerWidth * .2, innerHeight * .4, 80), 400); setTimeout(() => Confetti.burst(innerWidth * .8, innerHeight * .4, 80), 800);
  const stars = count ? '⭐'.repeat(Math.min(score, 10)) + '☆'.repeat(Math.max(0, Math.min(count, 10) - Math.min(score, 10))) : '';
  app.innerHTML = `<div class="finish">${Owl.html()}<div class="trophy">🏆</div><h2>${title}</h2>
    ${count ? `<div class="score">${stars}</div><p style="font-size:22px;font-weight:800">Đúng ngay lần đầu: ${score}/${count} câu</p>` : `<p style="font-size:22px;font-weight:800">Con được ${score} ⭐</p>`}
    <div style="font-size:22px;font-weight:800">Hình dán mới: <span class="sticker">${sticker}</span></div>
    <div class="row"><button class="btn primary again">🔁 Chơi lại</button><button class="btn home">🏠 Trang chủ</button></div></div>`;
  Owl.mood('happy');
  $('.again', app).onclick = () => { screenTok++; again(); };
  $('.home', app).onclick = () => go('');
  TTS.say(`Hoan hô! Con đã hoàn thành. Con được ${numWord(Math.min(score, 99))} ngôi sao và một hình dán mới.`);
}

/* ---- Học số ---- */
function learnNumbers() {
  setTitle('Học số'); let n = 1;
  const render = () => {
    const [e, name] = THINGS[n % THINGS.length];
    app.innerHTML = `<div class="learn">
      <div class="learn-card">
        <div class="row">${Owl.html('small')}<div class="learn-num" style="color:${COLORS[n % COLORS.length]}">${n}</div></div>
        <div class="learn-word">${numWord(n)}</div>${n ? objs(n, e) : '<div style="font-size:50px">🫙 (không có gì)</div>'}</div>
      <div class="row"><button class="btn prev">⬅️ Trước</button><button class="btn primary say">🔊 Nghe</button>${SR ? '<button class="btn mic2">🎤 Con đọc</button>' : ''}<button class="btn next">Sau ➡️</button></div>
      <div class="heard" style="font-size:20px"></div>
      <div class="num-strip">${Array.from({ length: settings.max + 1 }, (_, k) => `<button class="chip ${k === n ? 'on' : ''}" data-n="${k}">${k}</button>`).join('')}</div></div>`;
    const speak = () => TTS.say(n === 0 ? 'Số không. Không có gì cả.' : `Số ${numWord(n)}. Có ${numWord(n)} ${name}.`);
    $('.prev', app).onclick = () => { n = Math.max(0, n - 1); sfx.flip(); render(); };
    $('.next', app).onclick = () => { n = Math.min(settings.max, n + 1); sfx.flip(); render(); };
    $('.say', app).onclick = speak;
    $$('.chip', app).forEach(c => c.onclick = () => { n = +c.dataset.n; sfx.flip(); render(); });
    const m = $('.mic2', app);
    if (m) m.onclick = async () => {
      const h = $('.heard', app); h.textContent = '👂 Con đọc số đi...';
      try { const alts = await listen(); const v = alts.map(parseNumber).find(x => x !== null);
        if (v === n) { h.textContent = `“${alts[0]}” – Đúng rồi!`; sfx.ok(); addStar(); Owl.mood('happy'); Confetti.at(m, 40); TTS.say(pick(PRAISE)); }
        else { h.textContent = alts.length ? `Con đọc: “${alts[0]}”` : 'Chưa nghe rõ'; TTS.say(`Mình cùng đọc nhé: ${numWord(n)}`); }
      } catch (e) { h.textContent = 'Không dùng được micro.'; }
    };
    speak();
  };
  render();
}
