/* ==== Trò chơi chủ đề Công chúa – Nàng tiên – Tiên cá ==== */
'use strict';

/* ---- 1. Tiên cá bắt ngọc trai ---- */
function gamePearls() {
  setTitle('Tiên cá bắt ngọc trai'); const tok = screenTok; const M = settings.max;
  let score = 0, time = 60, target, pearls = [], last = performance.now(), spawnT = 0, mx = 50;
  app.innerHTML = `<div class="bgame"><div class="bhud"><div class="btarget">Bắt ngọc: <b id="tg"></b> <button class="icon-btn" id="rep" style="width:46px;height:46px;font-size:22px">🔊</button></div><div>⏱ <b id="tm">60</b></div><div>🦪 <b id="sc">0</b></div></div>
    <div class="arena sea" id="ar"><div class="mermaid" id="mm" style="left:50%">🧜‍♀️</div></div>
    <div class="muted" style="text-align:center">Kéo ngón tay qua lại để nàng tiên cá bơi theo</div></div>`;
  const ar = $('#ar'), mm = $('#mm');
  for (let i = 0; i < 8; i++) { const b = document.createElement('div'); b.className = 'sparkle'; b.textContent = pick(['🫧', '✨', '🐠']); b.style.left = rnd(2, 95) + '%'; b.style.top = rnd(5, 70) + '%'; b.style.animationDelay = (-i * .4) + 's'; ar.appendChild(b); }
  const move = e => { const r = ar.getBoundingClientRect(); mx = Math.max(6, Math.min(94, (e.clientX - r.left) / r.width * 100)); mm.style.left = mx + '%'; };
  ar.onpointerdown = e => { ar.setPointerCapture(e.pointerId); move(e); }; ar.onpointermove = e => { if (e.buttons || e.pointerType === 'touch') move(e); };
  const newTarget = () => {
    if (Math.random() < .5) { const v = rnd(0, M); target = { v, label: v, say: `Bắt viên ngọc số ${numWord(v)}` }; }
    else if (Math.random() < .5) { const [a, b] = noCarryAdd(M); target = { v: a + b, label: `${a}+${b}`, say: `Bắt viên ngọc bằng ${numWord(a)} cộng ${numWord(b)}` }; }
    else { const [a, b] = noBorrowSub(M); target = { v: a - b, label: `${a}−${b}`, say: `Bắt viên ngọc bằng ${numWord(a)} trừ ${numWord(b)}` }; }
    $('#tg').textContent = target.label; TTS.say(target.say);
  };
  $('#rep').onclick = () => TTS.say(target.say);
  const spawn = () => {
    const has = pearls.some(p => p.v === target.v && p.y < 50);
    const v = (!has || Math.random() < .35) ? target.v : nearNum(target.v, M);
    const el = document.createElement('div'); el.className = 'pearl'; el.textContent = v;
    const p = { el, v, x: rnd(8, 92), y: -12, sp: rnd(9, 15) }; el.style.left = p.x + '%'; ar.appendChild(el); pearls.push(p);
  };
  const loop = now => {
    if (!alive(tok)) return; const dt = Math.min(.05, (now - last) / 1000); last = now;
    time -= dt; spawnT -= dt; if (spawnT <= 0) { spawn(); spawnT = 1.3; }
    $('#tm').textContent = Math.ceil(time);
    pearls.forEach(p => { p.y += p.sp * dt; p.el.style.top = p.y + '%'; });
    pearls = pearls.filter(p => {
      if (p.y > 74 && p.y < 90 && Math.abs(p.x - mx) < 9) {
        p.el.classList.add('got'); setTimeout(() => p.el.remove(), 350);
        if (p.v === target.v) { score++; $('#sc').textContent = score; sfx.ok(); mm.classList.remove('yum'); void mm.offsetWidth; mm.classList.add('yum'); Confetti.at(mm, 25); TTS.say(pick(PRAISE)).then(() => alive(tok) && newTarget()); }
        else { sfx.bad(); TTS.say(`Đây là số ${numWord(p.v)}, chưa đúng rồi`); }
        return false;
      }
      if (p.y > 105) { p.el.remove(); return false; } return true;
    });
    if (time <= 0) { addStar(score); return finishScreen({ score, count: 0, title: `Con bắt được ${score} viên ngọc!`, again: gamePearls }); }
    requestAnimationFrame(loop);
  };
  TTS.say('Nàng tiên cá đi nhặt ngọc trai! Con kéo nàng tiên cá đến đúng viên ngọc nhé.').then(() => { if (alive(tok)) { newTarget(); last = performance.now(); requestAnimationFrame(loop); } });
}

/* ---- 2. Nối sao thần kỳ (đếm theo thứ tự) ---- */
const DOT_PICS = [
  { name: 'vương miện', em: '👑', pts: [[15, 80], [12, 30], [32, 55], [50, 18], [68, 55], [88, 30], [85, 80]] },
  { name: 'ngôi sao', em: '⭐', pts: [[50, 8], [61, 38], [93, 38], [67, 58], [77, 90], [50, 70], [23, 90], [33, 58], [7, 38], [39, 38]] },
  { name: 'trái tim', em: '💖', pts: [[50, 88], [20, 60], [10, 36], [18, 16], [36, 12], [50, 28], [64, 12], [82, 16], [90, 36], [80, 60]] },
  { name: 'viên kim cương', em: '💎', pts: [[30, 20], [70, 20], [88, 40], [50, 88], [12, 40]] },
  { name: 'lâu đài', em: '🏰', pts: [[10, 88], [10, 30], [24, 30], [24, 44], [38, 44], [38, 22], [50, 8], [62, 22], [62, 44], [76, 44], [76, 30], [90, 30], [90, 88]] }
];
function gameDots() {
  setTitle('Nối sao thần kỳ'); const tok = screenTok; let round = 0; const ROUNDS = 3; const order = shuffle(DOT_PICS);
  const play = () => {
    if (!alive(tok)) return;
    if (round >= ROUNDS) { addStar(ROUNDS * 2); return finishScreen({ score: ROUNDS * 2, count: 0, title: 'Con nối sao giỏi quá!', again: gameDots }); }
    const pic = order[round % order.length]; const n = pic.pts.length; let next = 1;
    app.innerHTML = `<div class="bgame"><div class="prompt">${Owl.html('small')} Chạm các ngôi sao theo thứ tự 1, 2, 3… (${round + 1}/${ROUNDS})</div>
      <div class="arena night" id="ar"><svg class="lines" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline id="pl" fill="none" stroke="#ffd166" stroke-width="0.8" stroke-linejoin="round" points=""/></svg>
      ${pic.pts.map((p, k) => `<button class="dot ${k === 0 ? 'next' : ''}" data-k="${k}" style="left:${p[0]}%;top:${p[1]}%">${k + 1}</button>`).join('')}</div></div>`;
    const ar = $('#ar'); for (let i = 0; i < 10; i++) { const s = document.createElement('div'); s.className = 'sparkle'; s.textContent = '✨'; s.style.left = rnd(2, 96) + '%'; s.style.top = rnd(2, 96) + '%'; s.style.animationDelay = (-i * .3) + 's'; s.style.pointerEvents = 'none'; ar.appendChild(s); }
    const pts = [];
    $$('.dot', app).forEach(d => d.onclick = () => {
      const k = +d.dataset.k;
      if (k + 1 !== next) { sfx.bad(); TTS.say(`Đây là số ${numWord(k + 1)}. Con tìm số ${numWord(next)} nhé.`); return; }
      d.classList.remove('next'); d.classList.add('done'); sfx.pop(); TTS.say(numWord(next)); pts.push(pic.pts[k].join(',')); $('#pl').setAttribute('points', pts.join(' ')); next++;
      const nd = $(`.dot[data-k="${next - 1}"]`, app); if (nd) nd.classList.add('next');
      if (next > n) {
        pts.push(pic.pts[0].join(',')); $('#pl').setAttribute('points', pts.join(' ')); $('#pl').setAttribute('fill', 'rgba(255,209,102,.35)');
        const r = document.createElement('div'); r.className = 'reveal'; r.textContent = pic.em; ar.appendChild(r);
        sfx.win(); Confetti.at(ar, 80); Owl.mood('happy');
        TTS.say(`Oa! Đó là ${pic.name}! Có ${numWord(n)} ngôi sao.`).then(() => setTimeout(() => { if (alive(tok)) { round++; play(); } }, 600));
      }
    });
  };
  TTS.say('Con hãy nối các ngôi sao theo thứ tự để tìm ra bức tranh bí mật nhé.'); play();
}

/* ---- 3. Tiệc trà của công chúa (đếm và đặt đúng số lượng) ---- */
function gameTea() {
  setTitle('Tiệc trà công chúa'); const tok = screenTok; let round = 0, score = 0; const ROUNDS = 6;
  const FOODS = [['🧁', 'chiếc bánh'], ['🍓', 'quả dâu'], ['🍪', 'chiếc bánh quy'], ['🍰', 'miếng bánh kem'], ['🍬', 'viên kẹo'], ['🍩', 'chiếc bánh vòng']];
  const GUESTS = [['👸', 'Công chúa'], ['🧚', 'Nàng tiên'], ['🧜‍♀️', 'Nàng tiên cá'], ['🦄', 'Kỳ lân']];
  const play = () => {
    if (!alive(tok)) return;
    if (round >= ROUNDS) { addStar(score); return finishScreen({ score, count: ROUNDS, title: 'Bữa tiệc thật tuyệt!', again: gameTea }); }
    const [f, fn] = pick(FOODS), [g, gn] = pick(GUESTS); const want = rnd(1, Math.min(10, settings.max));
    const pre = round >= 3 && want > 2 ? rnd(1, want - 1) : 0; let onPlate = pre, tries = 0;
    const ask = pre ? `${gn} muốn có ${numWord(want)} ${fn}. Trên đĩa đã có ${numWord(pre)}. Con thêm cho đủ nhé!` : `${gn} muốn có ${numWord(want)} ${fn}. Con đặt lên đĩa nhé!`;
    app.innerHTML = `<div class="tea"><div class="prompt"><span style="font-size:70px">${g}</span><button class="icon-btn" id="rep">🔊</button> Cần <b style="font-size:1.4em;color:#c77dff">${want}</b> ${f}</div>
      <div class="plate" id="pl"></div><div class="row" style="font-size:24px;font-weight:900">Trên đĩa: <span id="cnt">0</span></div>
      <div class="tray">${Array.from({ length: 6 }, () => `<button class="add">${f}</button>`).join('')}</div>
      <div class="row"><button class="btn primary" id="ok">✅ Xong rồi!</button></div><div class="muted">Chạm vào món trên đĩa để cất bớt</div></div>`;
    const pl = $('#pl');
    const draw = () => { pl.innerHTML = Array.from({ length: onPlate }, (_, k) => `<span data-k="${k}">${f}</span>`).join(''); $('#cnt').textContent = onPlate; $$('span', pl).forEach(s => s.onclick = () => { if (+s.dataset.k < pre) return; onPlate--; sfx.flip(); draw(); }); };
    draw();
    $$('.add', app).forEach(b => b.onclick = () => { if (onPlate >= 15) return; onPlate++; sfx.pop(); draw(); TTS.say(numWord(onPlate)); });
    $('#rep').onclick = () => TTS.say(ask);
    $('#ok').onclick = () => {
      if (onPlate === want) { if (tries === 0) score++; stat('dem', tries === 0); sfx.ok(); Confetti.at(pl, 60); Owl.mood('happy'); TTS.say(`${pick(PRAISE)} ${gn} cảm ơn con. Đủ ${numWord(want)} ${fn} rồi!`).then(() => setTimeout(() => { if (alive(tok)) { round++; play(); } }, 400)); }
      else { tries++; sfx.bad(); TTS.say(onPlate < want ? `Mới có ${numWord(onPlate)} thôi, con thêm nữa nhé.` : `Có ${numWord(onPlate)}, nhiều quá rồi, con cất bớt nhé.`); }
    };
    TTS.say(ask);
  };
  play();
}

/* ---- 4. Tô màu theo số ---- */
const PAINT = [null, ['#ff8fab', 'hồng'], ['#c77dff', 'tím'], ['#ffd166', 'vàng'], ['#80ed99', 'xanh lá'], ['#74c0fc', 'xanh dương']];
const CBN_PICS = [
  { name: 'Lâu đài công chúa', vb: '0 0 300 260', r: [
    ['rect', { x: 30, y: 100, width: 60, height: 140 }, 2, 60, 170], ['rect', { x: 210, y: 100, width: 60, height: 140 }, 2, 240, 170],
    ['rect', { x: 80, y: 140, width: 140, height: 100 }, 1, 110, 200], ['polygon', { points: '25,100 60,35 95,100' }, 3, 60, 80],
    ['polygon', { points: '205,100 240,35 275,100' }, 3, 240, 80], ['polygon', { points: '80,140 150,65 220,140' }, 2, 186, 128],
    ['rect', { x: 130, y: 185, width: 40, height: 55, rx: 18 }, 3, 150, 215], ['circle', { cx: 150, cy: 98, r: 11 }, 5, 150, 98],
    ['polygon', { points: '60,35 60,12 80,20 60,26' }, 1, 66, 20], ['polygon', { points: '240,35 240,12 260,20 240,26' }, 1, 246, 20]] },
  { name: 'Bông hoa thần tiên', vb: '0 0 300 300', r: [
    ['circle', { cx: 150, cy: 70, r: 34 }, 1, 150, 70], ['circle', { cx: 210, cy: 112, r: 34 }, 2, 210, 112], ['circle', { cx: 188, cy: 180, r: 34 }, 1, 188, 180],
    ['circle', { cx: 112, cy: 180, r: 34 }, 2, 112, 180], ['circle', { cx: 90, cy: 112, r: 34 }, 1, 90, 112], ['circle', { cx: 150, cy: 128, r: 30 }, 3, 150, 128],
    ['rect', { x: 143, y: 214, width: 14, height: 80 }, 4, 150, 262], ['ellipse', { cx: 112, cy: 258, rx: 30, ry: 13 }, 4, 112, 258], ['ellipse', { cx: 190, cy: 248, rx: 30, ry: 13 }, 4, 190, 248]] },
  { name: 'Chú cá của tiên cá', vb: '0 0 320 220', r: [
    ['ellipse', { cx: 140, cy: 110, rx: 95, ry: 62 }, 3, 120, 120], ['polygon', { points: '225,110 300,50 300,170' }, 2, 275, 110],
    ['polygon', { points: '110,52 150,10 180,58' }, 1, 148, 40], ['polygon', { points: '120,166 150,205 172,164' }, 1, 148, 180],
    ['circle', { cx: 85, cy: 95, r: 15 }, 5, 85, 95], ['circle', { cx: 40, cy: 40, r: 12 }, 5, 40, 40], ['circle', { cx: 20, cy: 75, r: 8 }, 5, 20, 75],
    ['ellipse', { cx: 160, cy: 110, rx: 18, ry: 40 }, 4, 160, 110]] },
  { name: 'Kỳ lân cầu vồng', vb: '0 0 300 240', r: [
    ['path', { d: 'M20 200 A130 130 0 0 1 280 200 L250 200 A100 100 0 0 0 50 200Z' }, 1, 40, 170], ['path', { d: 'M50 200 A100 100 0 0 1 250 200 L222 200 A72 72 0 0 0 78 200Z' }, 3, 150, 112],
    ['path', { d: 'M78 200 A72 72 0 0 1 222 200 L196 200 A46 46 0 0 0 104 200Z' }, 4, 210, 170], ['path', { d: 'M104 200 A46 46 0 0 1 196 200Z' }, 5, 150, 180],
    ['ellipse', { cx: 50, cy: 210, rx: 45, ry: 20 }, 2, 50, 210], ['ellipse', { cx: 250, cy: 210, rx: 45, ry: 20 }, 2, 250, 210]] }
];
function gameColor() {
  setTitle('Tô màu theo số'); const tok = screenTok; let idx = 0, mistakes = 0;
  const play = () => {
    if (!alive(tok)) return;
    if (idx >= CBN_PICS.length) { const st = Math.max(3, 8 - mistakes); addStar(st); return finishScreen({ score: st, count: 0, title: 'Họa sĩ nhí tuyệt vời!', again: gameColor }); }
    const pic = CBN_PICS[idx]; const math = idx >= 1; let sel = 1, left = pic.r.length;
    const label = n => { if (!math || n < 2) return String(n); const a = rnd(0, n - 1); return Math.random() < .7 ? `${a}+${n - a}` : `${n + 1}-1`; };
    app.innerHTML = `<div class="prompt">${Owl.html('small')} ${pic.name} <span class="muted">(${idx + 1}/${CBN_PICS.length})</span></div>
      <div class="cbn"><div class="pic"><svg viewBox="${pic.vb}">${pic.r.map(([t, a, n, lx, ly], k) => `<${t} class="rg" data-k="${k}" data-n="${n}" fill="#fff" ${Object.entries(a).map(([kk, v]) => `${kk}="${v}"`).join(' ')}/>`).join('')}
        ${pic.r.map(([t, a, n, lx, ly], k) => `<text id="lb${k}" x="${lx}" y="${ly}">${label(n)}</text>`).join('')}</svg></div>
        <div class="palette">${PAINT.slice(1).map(([c, nm], k) => `<button data-n="${k + 1}" style="background:${c}" class="${k === 0 ? 'on' : ''}">${k + 1}</button>`).join('')}</div></div>
      <p class="muted" style="text-align:center">${math ? 'Tính phép tính trong mỗi ô để biết tô màu số mấy nhé!' : 'Chọn màu, rồi chạm vào ô có cùng số.'}</p>`;
    $$('.palette button', app).forEach(b => b.onclick = () => { $$('.palette button', app).forEach(x => x.classList.remove('on')); b.classList.add('on'); sel = +b.dataset.n; sfx.flip(); TTS.say(`Màu số ${numWord(sel)}, màu ${PAINT[sel][1]}`); });
    $$('.rg', app).forEach(r => r.onclick = () => {
      if (r.dataset.done) return; const n = +r.dataset.n;
      if (n === sel) { r.setAttribute('fill', PAINT[n][0]); r.dataset.done = 1; $('#lb' + r.dataset.k, app).style.opacity = .25; sfx.pop(); left--;
        if (!left) { sfx.win(); Confetti.burst(null, null, 120); Owl.mood('happy'); TTS.say(`Đẹp quá! Con đã tô xong ${pic.name}.`).then(() => setTimeout(() => { if (alive(tok)) { idx++; play(); } }, 900)); } }
      else { mistakes++; r.classList.remove('bad'); void r.getBBox(); r.classList.add('bad'); sfx.bad(); TTS.say(math ? 'Con tính lại phép tính trong ô nhé.' : `Ô này là số ${numWord(n)} cơ.`); }
    });
    TTS.say(math ? 'Bức tranh này có phép tính. Con tính xong rồi tô màu đúng số nhé!' : 'Con chọn màu rồi tô vào ô có cùng số nhé!');
  };
  play();
}

/* ---- 5. Kỳ lân nhảy số (tia số) ---- */
function gameNumberLine() {
  setTitle('Kỳ lân nhảy số'); const tok = screenTok; let round = 0, score = 0; const ROUNDS = 8;
  const play = () => {
    if (!alive(tok)) return;
    if (round >= ROUNDS) { addStar(score); return finishScreen({ score, count: ROUNDS, title: 'Kỳ lân về đích rồi!', again: gameNumberLine }); }
    const U = settings.max > 20 && round % 2 === 1 ? 10 : settings.max > 20 && round >= 4 && Math.random() < .5 ? 10 : 1; // U = 10: tia số theo chục
    const add = round < 4 || Math.random() < .5; const si = add ? rnd(0, 7) : rnd(3, 10); const sk = add ? rnd(1, Math.min(3, 10 - si)) : rnd(1, Math.min(3, si));
    const start = si * U, step = sk * U, ans = add ? start + step : start - step, ai = add ? si + sk : si - sk; let tries = 0, done = false;
    const stepWord = U === 10 ? `${numWord(sk)} chục` : `${numWord(sk)} bước`;
    const q = add ? `Kỳ lân đang ở số ${numWord(start)}. Kỳ lân nhảy thêm ${stepWord}${U === 10 ? ', mỗi bước là mười' : ''}. Kỳ lân đến số mấy?` : `Kỳ lân đang ở số ${numWord(start)}. Kỳ lân lùi lại ${stepWord}${U === 10 ? ', mỗi bước là mười' : ''}. Kỳ lân đến số mấy?`;
    app.innerHTML = `<div class="quiz"><div class="prompt"><button class="icon-btn" id="rep">🔊</button> ${start} ${add ? '+' : '−'} ${step} = <span class="ans">?</span></div>
      <div class="nline" id="nl"><div class="uni" id="uni">🦄</div><div class="tiles">${Array.from({ length: 11 }, (_, k) => `<button data-n="${k}">${k * U}</button>`).join('')}</div></div>
      <div class="muted">${U === 10 ? 'Mỗi ô cách nhau 10 (một chục). ' : ''}${add ? '➡️ Nhảy về phía trước là cộng thêm' : '⬅️ Lùi lại là trừ đi'}</div></div>`;
    const tiles = $$('.tiles button', app), uni = $('#uni');
    const place = n => { const t = tiles[n], nl = $('#nl'); uni.style.left = (t.offsetLeft + t.offsetWidth / 2) + 'px'; };
    requestAnimationFrame(() => place(si));
    $('#rep').onclick = () => TTS.say(q);
    tiles.forEach(t => t.onclick = async () => {
      if (done) return; const n = +t.dataset.n;
      if (n !== ai) { tries++; sfx.bad(); Owl.mood('sad'); TTS.say(pick(RETRY)); if (tries >= 2) tiles[ai].classList.add('hint'); return; }
      done = true; if (tries === 0) score++; stat(add ? 'cong' : 'tru', tries === 0);
      for (let k = 1; k <= sk; k++) { if (!alive(tok)) return; const p = add ? si + k : si - k; uni.classList.remove('jumping'); void uni.offsetWidth; uni.classList.add('jumping'); place(p); sfx.boing(); await TTS.say(U === 10 ? numWord(p * 10) : numWord(k)); }
      t.classList.add('ok'); $('.ans', app).textContent = ans; sfx.ok(); Confetti.at(t, 40);
      TTS.say(`${pick(PRAISE)} ${numWord(start)} ${add ? 'cộng' : 'trừ'} ${numWord(step)} bằng ${numWord(ans)}.`).then(() => setTimeout(() => { if (alive(tok)) { round++; play(); } }, 400));
    });
    TTS.say(q);
  };
  play();
}

/* ---- 6. Bảng số 100 ---- */
function gameHundred() {
  setTitle('Bảng số 100'); const tok = screenTok; let round = 0, score = 0; const ROUNDS = 10;
  const play = () => {
    if (!alive(tok)) return;
    if (round >= ROUNDS) { addStar(score); return finishScreen({ score, count: ROUNDS, title: 'Con thuộc bảng số 100 rồi!', again: gameHundred }); }
    const v = rnd(0, 4); let n, ans, q, show;
    if (v <= 1) { ans = rnd(1, 100); q = `Chạm vào số ${numWord(ans)}`; show = `Tìm số <b style="color:#c77dff;font-size:1.3em">${ans}</b>`; }
    else if (v === 2) { n = rnd(1, 99); ans = n + 1; q = `Số liền sau của ${numWord(n)} là số nào?`; show = `Số liền sau của <b>${n}</b> là?`; }
    else if (v === 3) { n = rnd(2, 100); ans = n - 1; q = `Số liền trước của ${numWord(n)} là số nào?`; show = `Số liền trước của <b>${n}</b> là?`; }
    else { n = rnd(1, 89); ans = n + 10; q = `Số ${numWord(n)} thêm một chục là số nào? Gợi ý: ở ngay ô bên dưới.`; show = `<b>${n}</b> + 10 = ?`; }
    let tries = 0, done = false;
    app.innerHTML = `<div class="quiz"><div class="prompt">${Owl.html('small')}<button class="icon-btn" id="rep">🔊</button> ${show} <span class="muted">(${round + 1}/${ROUNDS})</span></div>
      <div class="h100">${Array.from({ length: 100 }, (_, k) => `<button data-n="${k + 1}" class="${n === k + 1 && v >= 2 ? 'on' : ''}">${k + 1}</button>`).join('')}</div></div>`;
    const bs = $$('.h100 button', app);
    $('#rep').onclick = () => TTS.say(q);
    bs.forEach(b => b.onclick = () => {
      if (done) return; const k = +b.dataset.n;
      if (k === ans) { done = true; b.classList.add('ok'); if (!tries) score++; stat('chuc', !tries); sfx.ok(); Confetti.at(b, 40); Owl.mood('happy');
        TTS.say(`${pick(PRAISE)} Đó là số ${numWord(ans)}.`).then(() => setTimeout(() => { if (alive(tok)) { round++; play(); } }, 400)); }
      else { tries++; b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); sfx.bad(); TTS.say(`Đây là số ${numWord(k)}. ${pick(RETRY)}`); if (tries >= 2) bs[ans - 1].classList.add('hint'); }
    });
    TTS.say(q);
  };
  play();
}
