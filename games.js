/* ==== Trò chơi ==== */
'use strict';

/* ---- 1. Bắt bóng bay ---- */
/* Số gây nhiễu gần đáp án (dễ nhầm hàng chục / đơn vị) */
function nearNum(v, M) {
  if (M <= 20) return rnd(0, M);
  const c = [v + 1, v - 1, v + 10, v - 10, (v % 10) * 10 + Math.floor(v / 10), v + 2, v - 2, rnd(0, M)].filter(x => x >= 0 && x <= M && x !== v);
  return c.length ? pick(c) : rnd(0, M);
}
function gameBalloons() {
  setTitle('Bắt bóng bay'); const tok = screenTok; const M = settings.max;
  let score = 0, time = 60, target, balloons = [], last = performance.now(), spawnT = 0;
  app.innerHTML = `<div class="bgame"><div class="bhud"><div class="btarget">Tìm: <b id="tg"></b> <button class="icon-btn" id="rep" style="width:46px;height:46px;font-size:22px">🔊</button></div><div>⏱ <b id="tm">60</b></div><div>🎯 <b id="sc">0</b></div></div><div class="sky" id="sky"><div class="sun" style="position:absolute;right:20px;top:10px;font-size:70px">☀️</div></div></div>`;
  const sky = $('#sky');
  const newTarget = () => {
    if (Math.random() < .5 || M < 2) { const v = rnd(0, M); target = { v, label: v, say: `Chạm vào bóng số ${numWord(v)}` }; }
    else { const [a, b] = noCarryAdd(M); target = { v: a + b, label: `${a}+${b}`, say: `${numWord(a)} cộng ${numWord(b)} bằng mấy? Chạm vào quả bóng đúng nhé` }; }
    $('#tg').textContent = target.label; TTS.say(target.say);
  };
  $('#rep').onclick = () => TTS.say(target.say);
  const spawn = () => {
    const hasT = balloons.some(b => b.v === target.v && b.y < sky.clientHeight * .7);
    const v = (!hasT || Math.random() < .3) ? target.v : nearNum(target.v, M);
    const el = document.createElement('button'); el.className = 'balloon'; el.textContent = v; if (v > 9) el.style.fontSize = '34px';
    el.style.left = rnd(2, 88) + '%'; el.style.background = pick(COLORS);
    const b = { el, v, y: 0, speed: rnd(55, 95), sway: Math.random() * 6 };
    el.onpointerdown = ev => {
      ev.preventDefault(); if (b.popped) return;
      if (b.v === target.v) { b.popped = true; el.classList.add('pop'); sfx.pop(); score++; $('#sc').textContent = score; Confetti.at(el, 25); setTimeout(() => el.remove(), 300); balloons = balloons.filter(x => x !== b); TTS.say(pick(PRAISE)).then(() => alive(tok) && newTarget()); }
      else { el.classList.remove('no'); void el.offsetWidth; el.classList.add('no'); sfx.bad(); TTS.say(`Đây là số ${numWord(b.v)}`); }
    };
    sky.appendChild(el); balloons.push(b);
  };
  const loop = now => {
    if (!alive(tok)) return; const dt = Math.min(.05, (now - last) / 1000); last = now;
    time -= dt; spawnT -= dt; if (spawnT <= 0) { spawn(); spawnT = 1.1; }
    $('#tm').textContent = Math.ceil(time);
    balloons.forEach(b => { b.y += b.speed * dt; b.el.style.transform = `translate(${Math.sin(now / 600 + b.sway) * 12}px,${-b.y}px)`; });
    balloons = balloons.filter(b => { if (b.y > sky.clientHeight + 260) { b.el.remove(); return false; } return true; });
    if (time <= 0) { addStar(score); return finishScreen({ score, count: 0, title: `Con bắt được ${score} quả bóng!`, again: gameBalloons }); }
    requestAnimationFrame(loop);
  };
  TTS.say('Bắt bóng bay nào! Nghe kỹ và chạm vào quả bóng đúng nhé.').then(() => { if (alive(tok)) { newTarget(); last = performance.now(); requestAnimationFrame(loop); } });
}

/* ---- 2. Lật thẻ ghép đôi ---- */
function gameMemory() {
  setTitle('Lật thẻ ghép đôi'); const tok = screenTok;
  const big = settings.max > 20 && Math.random() < .6;
  const nums = big ? shuffle(Array.from({ length: 89 }, (_, k) => k + 11)).slice(0, 6) : shuffle(Array.from({ length: Math.min(settings.max, 10) }, (_, k) => k + 1)).slice(0, 6);
  let [e, name] = pick(THINGS); if (big) name = 'khối chục';
  const cards = shuffle(nums.flatMap(n => [{ n, t: 'num' }, { n, t: 'obj' }]));
  app.innerHTML = `<div class="row" style="margin-bottom:12px;font-size:22px;font-weight:800">${Owl.html('small')} Tìm cặp: số và ${big ? 'thanh chục' : 'nhóm ' + name} giống nhau · Lượt: <b id="mv">0</b></div>
    <div class="mgrid">${cards.map((c, k) => `<button class="card" data-k="${k}"><div class="inner"><div class="face back">❓</div><div class="face front">${c.t === 'num' ? c.n : big ? placeValue(c.n) : objs(c.n, e)}</div></div></button>`).join('')}</div>`;
  let open = [], moves = 0, matched = 0, lock = false;
  $$('.card', app).forEach(el => el.onclick = () => {
    if (lock || el.classList.contains('open') || el.classList.contains('done')) return;
    const c = cards[+el.dataset.k]; el.classList.add('open'); sfx.flip(); open.push({ el, c });
    TTS.say(c.t === 'num' ? `Số ${numWord(c.n)}` : big ? pvWords(c.n) : `${numWord(c.n)} ${name}`);
    if (open.length === 2) {
      moves++; $('#mv').textContent = moves; const [a, b] = open; open = [];
      if (a.c.n === b.c.n && a.c.t !== b.c.t) {
        setTimeout(() => { a.el.classList.add('done'); b.el.classList.add('done'); sfx.ok(); Owl.mood('happy'); Confetti.at(b.el, 30); }, 400);
        matched++;
        if (matched === nums.length) setTimeout(() => { if (!alive(tok)) return; const st = moves <= 9 ? 5 : moves <= 13 ? 3 : 2; addStar(st); finishScreen({ score: st, count: 0, title: `Xong rồi! ${moves} lượt`, again: gameMemory }); }, 1500);
      } else { lock = true; setTimeout(() => { a.el.classList.remove('open'); b.el.classList.remove('open'); lock = false; }, 1100); }
    }
  });
  TTS.say(big ? 'Lật hai thẻ để tìm số và các thanh chục giống nhau nhé.' : `Lật hai thẻ để tìm số và nhóm ${name} giống nhau nhé.`);
}

/* ---- 3. Xếp hình vào ô ---- */
function gameShapes() {
  setTitle('Xếp hình vào ô'); const tok = screenTok; let round = 0, score = 0; const ROUNDS = 3;
  const play = () => {
    if (!alive(tok)) return;
    if (round >= ROUNDS) { addStar(score); return finishScreen({ score, count: 0, title: 'Con xếp hình giỏi quá!', again: gameShapes }); }
    const keys = Object.keys(SHAPES); let placed = 0;
    app.innerHTML = `<div class="dgame"><div class="prompt">${Owl.html('small')} Kéo hình vào đúng ô nhé! (${round + 1}/${ROUNDS})</div>
      <div class="slots">${shuffle(keys).map(k => `<div class="slot" data-t="${k}">${shapeSVG(k, '', 120, true)}</div>`).join('')}</div>
      <div class="pieces">${shuffle(keys).map(k => `<div class="piece" data-t="${k}">${shapeSVG(k, pick(COLORS), 120)}</div>`).join('')}</div></div>`;
    $$('.piece', app).forEach(p => {
      let sx, sy, drag = false;
      p.onpointerdown = ev => { drag = true; sx = ev.clientX; sy = ev.clientY; p.setPointerCapture(ev.pointerId); p.classList.add('dragging'); p.classList.remove('back'); TTS.say(SHAPES[p.dataset.t]); };
      p.onpointermove = ev => { if (drag) p.style.transform = `translate(${ev.clientX - sx}px,${ev.clientY - sy}px) scale(1.1)`; };
      p.onpointerup = p.onpointercancel = ev => {
        if (!drag) return; drag = false; p.classList.remove('dragging');
        p.style.visibility = 'hidden'; const under = document.elementFromPoint(ev.clientX, ev.clientY); p.style.visibility = '';
        const slot = under && under.closest('.slot');
        if (slot && slot.dataset.t === p.dataset.t && !slot.classList.contains('filled')) {
          slot.innerHTML = p.innerHTML; slot.classList.add('filled'); p.remove(); sfx.ok(); Confetti.at(slot, 30); Owl.mood('happy'); placed++; score++;
          TTS.say(`Đúng rồi, ${SHAPES[slot.dataset.t]}!`).then(() => { if (placed === keys.length && alive(tok)) { round++; play(); } });
        } else { p.classList.add('back'); p.style.transform = ''; if (slot) { sfx.bad(); Owl.mood('sad'); TTS.say(`Đây là ${SHAPES[p.dataset.t]}, chưa đúng ô rồi.`); } }
      };
    });
  };
  TTS.say('Con hãy kéo mỗi hình vào đúng cái bóng của nó nhé.'); play();
}
