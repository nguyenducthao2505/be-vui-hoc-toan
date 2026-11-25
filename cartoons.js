/* ==== Phim hoạt hình (tự dựng bằng hoạt ảnh + lời kể) ====
   Mỗi phim chọn số ngẫu nhiên nên mỗi lần xem lại là một câu chuyện mới. */
'use strict';
const STOP = Symbol('stop');

function makeStage(st, tok) {
  const S = {
    el: st,
    check() { if (!alive(tok)) throw STOP; },
    add(html, x, y, cls = '') { const d = document.createElement('div'); d.className = 'actor ' + cls; d.innerHTML = html; d.style.left = x + '%'; d.style.top = y + '%'; st.appendChild(d); return d; },
    label(text, x, y) { const d = document.createElement('div'); d.className = 'label'; d.textContent = text; d.style.left = x + '%'; d.style.top = y + '%'; st.appendChild(d); return d; },
    board(html) { let b = $('.board', st); if (!b) { b = document.createElement('div'); b.className = 'board'; st.appendChild(b); } b.innerHTML = html; b.animate([{ transform: 'translateX(-50%) scale(1.25)' }, { transform: 'translateX(-50%) scale(1)' }], { duration: 400 }); return b; },
    sub(text) { let s = $('.sub', st); if (!s) { s = document.createElement('div'); s.className = 'sub'; st.appendChild(s); } s.textContent = text; },
    async say(text, rate) { this.check(); this.sub(text); await TTS.say(text, rate ? { rate } : {}); this.check(); await sleep(200); this.check(); },
    async wait(ms) { await sleep(ms); this.check(); },
    clear() { st.innerHTML = ''; },
    deco(html, x, y, size) { const d = this.add(html, x, y); d.style.fontSize = size; return d; },
    async titleCard(em, text) { const t = document.createElement('div'); t.className = 'title-card'; t.innerHTML = `<div class="em">${em}</div><div>${text}</div>`; st.appendChild(t); sfx.win(); await this.say(text); await this.wait(500); t.remove(); }
  };
  return S;
}
const spread = (n, from = 12, to = 88) => Array.from({ length: n }, (_, k) => n === 1 ? 50 : from + k * (to - from) / (n - 1));

const CARTOONS = [
  {
    id: 'kimcuong', title: 'Công chúa và kim cương', em: '👸💎👑', sub: 'Đếm đến 10', quiz: 'dem', bg: 'castle',
    async play(S) {
      const n = rnd(5, Math.min(10, Math.max(5, settings.max)));
      S.add('🏰', 85, 40).style.fontSize = '130px'; const pr = S.add('👸', 16, 62); pr.style.fontSize = '100px';
      await S.say(`Công chúa muốn làm một chiếc vương miện thật đẹp. Nàng tiên mang đến những viên kim cương. Mình cùng đếm nhé!`);
      const fy = S.add('🧚', 50, 15, 'wiggle');
      const xs = spread(n, 30, 72);
      for (let k = 0; k < n; k++) {
        fy.style.left = xs[k] + '%'; await S.wait(250);
        const d = S.add('💎', xs[k], 18); sfx.pop(); await S.wait(50); d.style.top = (k % 2 ? 70 : 60) + '%';
        S.label(k + 1, xs[k], k % 2 ? 84 : 46); await S.say(numWord(k + 1) + '!', 1);
      }
      S.board(`${n} 💎`); await S.say(`Có tất cả ${numWord(n)} viên kim cương!`);
      const cr = S.add('👑', 16, 30); cr.style.fontSize = '80px'; cr.classList.add('hop'); sfx.win();
      await S.say('Vương miện đã xong. Công chúa xinh đẹp cảm ơn con đã đếm giúp!');
    }
  },
  {
    id: 'tienca', title: 'Tiên cá nhặt vỏ sò', em: '🧜‍♀️🐚➕', sub: 'Phép cộng dưới biển', quiz: 'cong', bg: 'sea',
    async play(S) {
      const a = rnd(1, 5), b = rnd(1, Math.min(4, settings.max - a)), s = a + b;
      ['🫧', '🐠', '🪸', '🫧', '🐡'].forEach((e, k) => S.add(e, 8 + k * 21, k % 2 ? 22 : 12, 'wiggle').style.fontSize = '40px');
      const m = S.add('🧜‍♀️', 12, 55); m.style.fontSize = '110px'; m.classList.add('wiggle');
      const xs = spread(s, 30, 90);
      for (let k = 0; k < a; k++) { S.add('🐚', xs[k], 80, 'hop'); sfx.pop(); await S.wait(250); }
      S.board(`${a}`); await S.say(`Nàng tiên cá đã nhặt được ${numWord(a)} vỏ sò.`);
      await S.say(`Sóng biển đưa đến thêm ${numWord(b)} vỏ sò nữa!`);
      for (let k = a; k < s; k++) { const el = S.add('🐚', 110, 30); sfx.whoosh(); await S.wait(60); el.style.left = xs[k] + '%'; el.style.top = '80%'; await S.wait(450); }
      S.board(`${a} + ${b}`); await S.say('Mình cùng đếm tất cả nhé.');
      for (let k = 0; k < s; k++) { S.label(k + 1, xs[k], 64); sfx.pop(); await S.say(numWord(k + 1), 1); }
      S.board(`${a} + ${b} = ${s}`); sfx.ok(); await S.say(`${numWord(a)} cộng ${numWord(b)} bằng ${numWord(s)}. Nàng tiên cá có ${numWord(s)} vỏ sò!`);
    }
  },
  {
    id: 'rao', title: 'Nàng tiên rắc sao ước', em: '🧚✨⭐', sub: 'Phép trừ', quiz: 'tru', bg: 'night',
    async play(S) {
      const a = rnd(4, Math.min(9, Math.max(4, settings.max))), b = rnd(1, a - 1), r = a - b;
      S.add('🌙', 88, 14); const f = S.add('🧚', 12, 70); f.style.fontSize = '100px'; f.classList.add('wiggle');
      const xs = spread(a, 25, 92), st = [];
      for (let k = 0; k < a; k++) { const e = S.add('⭐', xs[k], k % 2 ? 30 : 45, 'hop'); st.push(e); sfx.pop(); await S.wait(200); }
      S.board(`${a}`); await S.say(`Trên bầu trời có ${numWord(a)} ngôi sao lấp lánh.`);
      await S.say(`Nàng tiên vẫy đũa thần, gửi ${numWord(b)} ngôi sao đi thực hiện điều ước. Bay đi nào!`);
      for (let k = 0; k < b; k++) { st[a - 1 - k].classList.add('flyaway'); sfx.whoosh(); await S.wait(300); }
      S.board(`${a} − ${b}`); await S.say('Còn lại mấy ngôi sao nhỉ?'); await S.wait(600);
      for (let k = 0; k < r; k++) { S.label(k + 1, xs[k], k % 2 ? 18 : 33); sfx.pop(); await S.say(numWord(k + 1), 1); }
      S.board(`${a} − ${b} = ${r}`); sfx.ok(); await S.say(`${numWord(a)} trừ ${numWord(b)} còn ${numWord(r)}.`);
    }
  },
  {
    id: 'laudai', title: 'Xây lâu đài hình học', em: '🏰🔺🟪', sub: 'Các hình cơ bản', quiz: 'hinh', bg: 'castle',
    async play(S) {
      const parts = [
        ['chunhat', '#c77dff', 'làm tháp bên trái', 24, 58, 9, 90, 3], ['chunhat', '#c77dff', 'làm tháp bên phải', 76, 58, 9, 90, 3],
        ['vuong', '#ffafcc', 'làm thân lâu đài', 50, 64, 26, 0, 2],
        ['tamgiac', '#ff006e', 'làm mái tháp', 24, 26, 12, 0, 4], ['tamgiac', '#ff006e', 'làm mái tháp', 76, 26, 12, 0, 4], ['tamgiac', '#7209b7', 'làm mái chính', 50, 30, 22, 0, 3],
        ['tron', '#ffd166', 'làm cửa sổ tròn', 50, 54, 5, 0, 5], ['chunhat', '#8d5524', 'làm cổng lâu đài', 50, 82, 6, 90, 5]
      ];
      await S.say('Các hình học rủ nhau xây lâu đài cho công chúa. Mình xem nhé!');
      const said = {};
      for (const [t, c, txt, x, y, w, rot, z] of parts) {
        const d = document.createElement('div'); d.className = 'big-shape'; d.innerHTML = shapeSVG(t, c, '100%');
        const sv = d.querySelector('svg'); sv.removeAttribute('height'); sv.style.display = 'block'; if (rot) sv.style.transform = `rotate(${rot}deg)`;
        d.style.cssText += `;left:50%;top:50%;width:22%;z-index:${z}`; S.el.appendChild(d);
        d.animate([{ transform: 'translate(-50%,-50%) scale(0)' }, { transform: 'translate(-50%,-50%) scale(1)' }], { duration: 450, easing: 'ease-out' }); sfx.boing();
        if (!said[t]) { S.board(SHAPES[t].replace('hình', 'Hình')); await S.say(`Đây là ${SHAPES[t]}.`); said[t] = 1; } else await S.wait(500);
        d.style.left = x + '%'; d.style.top = y + '%'; d.style.width = w + '%';
        await S.say(`${SHAPES[t]} ${txt}.`);
      }
      S.add('👸', 88, 80, 'hop').style.fontSize = '80px'; S.add('🚩', 24, 8); S.add('🚩', 76, 8);
      S.board('🏰 Lâu đài xong rồi!'); sfx.win();
      await S.say('Hình chữ nhật, hình vuông, hình tam giác và hình tròn đã xây thành tòa lâu đài thật đẹp!');
    }
  },
  {
    id: 'kylan', title: 'Kỳ lân và cầu vồng', em: '🦄🌈💖', sub: 'Tìm quy luật', quiz: 'quyluat', bg: 'dream',
    async play(S) {
      S.add('🌈', 50, 28).style.fontSize = '160px';
      const u = S.add('🦄', 8, 70); u.style.fontSize = '90px';
      await S.say('Kỳ lân đi dạo, mỗi bước lại để lại một món quà. Con để ý quy luật nhé!');
      for (const set of [['💖', '💜'], ['⭐', '⭐', '🌸']]) {
        S.clear(); S.add('🌈', 50, 28).style.fontSize = '160px'; const un = S.add('🦄', 8, 70); un.style.fontSize = '90px';
        const L = set.length === 2 ? 6 : 6; const xs = spread(L + 1, 14, 90);
        for (let k = 0; k < L; k++) { un.style.left = xs[k] + '%'; await S.wait(450); S.add(set[k % set.length], xs[k], 86, 'hop'); sfx.pop(); }
        un.style.left = '96%';
        const q = S.add('<span style="border:4px dashed #fff;border-radius:16px;padding:0 10px">?</span>', xs[L], 86); 
        S.board(set.join(' ') + ' …');
        await S.say(set.length === 2 ? 'Tim hồng, tim tím, tim hồng, tim tím. Tiếp theo là gì nhỉ?' : 'Sao, sao, hoa. Sao, sao, hoa. Tiếp theo là gì nhỉ?');
        await S.wait(1500);
        q.innerHTML = set[L % set.length]; sfx.ok(); Confetti.burst(null, null, 50);
        await S.say(set.length === 2 ? 'Đúng rồi, là tim hồng!' : 'Đúng rồi, là ngôi sao!');
      }
      await S.say('Con giỏi tìm quy luật lắm!');
    }
  },
  {
    id: 'dem', title: 'Các bạn thú đến chơi', em: '🐰🐥🐸', sub: 'Đếm từ 1 đến 10', quiz: 'dem', bg: '',
    async play(S) {
      const n = rnd(5, Math.min(10, Math.max(5, settings.max))); const [a, an] = pick([['🐰', 'bạn thỏ'], ['🐥', 'chú gà con'], ['🐸', 'chú ếch'], ['🐷', 'chú heo'], ['🐻', 'bạn gấu']]);
      S.add('☀️', 88, 14, 'wiggle'); S.add('🌷', 6, 88); S.add('🌼', 95, 90);
      await S.say(`Hôm nay trời đẹp quá! Các ${an} rủ nhau ra đồng cỏ chơi. Mình cùng đếm nhé!`);
      const xs = spread(n, 8, 92);
      for (let k = 0; k < n; k++) {
        const el = S.add(a, xs[k], 66, 'hop'); sfx.boing(); S.label(k + 1, xs[k], 42);
        await S.say(numWord(k + 1) + '!', 1); el.classList.add('wiggle');
      }
      S.board(`Có ${n} ${a}`);
      await S.say(`Tất cả có ${numWord(n)} ${an}. Con đếm giỏi lắm!`);
    }
  },
  {
    id: 'cong', title: 'Chim non về tổ', em: '🐦➕🐦', sub: 'Phép cộng', quiz: 'cong', bg: '',
    async play(S) {
      const a = rnd(1, 4), b = rnd(1, Math.min(4, settings.max - a)), s = a + b;
      const br = S.add('', 50, 58); br.style.cssText += ';width:86%;height:14px;background:#6f4518;border-radius:10px;font-size:0';
      S.add('☀️', 90, 12, 'wiggle'); S.add('🌳', 6, 50).style.fontSize = '120px';
      const xs = spread(s, 18, 86);
      for (let k = 0; k < a; k++) { S.add('🐦', xs[k], 50, 'hop'); sfx.pop(); await S.wait(300); }
      S.board(`${a}`);
      await S.say(`Trên cành cây có ${numWord(a)} chú chim.`);
      await S.say(`Ồ! Có thêm ${numWord(b)} chú chim nữa bay đến.`);
      for (let k = a; k < s; k++) { const el = S.add('🐦', 115, 10); sfx.whoosh(); await S.wait(60); el.style.left = xs[k] + '%'; el.style.top = '50%'; await S.wait(500); }
      S.board(`${a} + ${b}`);
      await S.say(`${numWord(a)} thêm ${numWord(b)}. Mình đếm tất cả nhé.`);
      for (let k = 0; k < s; k++) { S.label(k + 1, xs[k], 34); sfx.pop(); await S.say(numWord(k + 1), 1); }
      S.board(`${a} + ${b} = ${s}`); sfx.ok();
      await S.say(`${numWord(a)} cộng ${numWord(b)} bằng ${numWord(s)}.`);
    }
  },
  {
    id: 'tru', title: 'Bóng bay bay mất', em: '🎈🧒🎈', sub: 'Phép trừ', quiz: 'tru', bg: '',
    async play(S) {
      const a = rnd(4, Math.min(8, Math.max(4, settings.max))), b = rnd(1, a - 1), r = a - b;
      S.add('🧒', 50, 82).style.fontSize = '90px'; S.add('☁️', 15, 15); S.add('☁️', 80, 22);
      const xs = spread(a, 20, 80); const bs = [];
      for (let k = 0; k < a; k++) { const el = S.add('🎈', xs[k], 45, 'hop'); el.style.filter = `hue-rotate(${k * 45}deg)`; bs.push(el); sfx.pop(); await S.wait(200); }
      S.board(`${a}`);
      await S.say(`Bạn nhỏ cầm ${numWord(a)} quả bóng bay.`);
      await S.say(`Vù vù! Gió thổi mạnh quá!`);
      for (let k = 0; k < b; k++) { bs[a - 1 - k].classList.add('flyaway'); sfx.whoosh(); await S.wait(350); }
      S.board(`${a} − ${b}`);
      await S.say(`${numWord(b)} quả bóng bay mất rồi. Còn lại mấy quả nhỉ?`);
      await S.wait(800);
      for (let k = 0; k < r; k++) { S.label(k + 1, xs[k], 26); sfx.pop(); await S.say(numWord(k + 1), 1); }
      S.board(`${a} − ${b} = ${r}`); sfx.ok();
      await S.say(`${numWord(a)} trừ ${numWord(b)} còn ${numWord(r)}.`);
    }
  },
  {
    id: 'hinh', title: 'Ngôi nhà hình học', em: '🔺🟦🟡', sub: 'Tròn, vuông, tam giác, chữ nhật', quiz: 'hinh', bg: '',
    async play(S) {
      const parts = [
        ['tron', '#ffb703', 'giống như ông mặt trời', 86, 18, 13],
        ['vuong', '#e76f51', 'làm thân ngôi nhà', 45, 66, 28],
        ['tamgiac', '#d62828', 'làm mái nhà', 45, 24, 32],
        ['chunhat', '#6f4518', 'làm cánh cửa', 45, 77, 11],
      ];
      await S.say('Các hình học đang đi tìm việc làm. Mình xem các bạn ấy làm gì nhé!');
      for (const [t, c, txt, x, y, w] of parts) {
        const d = document.createElement('div'); d.className = 'big-shape'; d.innerHTML = shapeSVG(t, c, '100%');
        d.style.cssText += `;left:50%;top:50%;width:30%;z-index:${t === 'chunhat' ? 3 : 2}`; S.el.appendChild(d);
        const sv = d.querySelector('svg'); sv.removeAttribute('height'); sv.style.display = 'block';
        if (t === 'chunhat') sv.style.transform = 'rotate(90deg)';
        d.animate([{ transform: 'translate(-50%,-50%) scale(0)' }, { transform: 'translate(-50%,-50%) scale(1)' }], { duration: 500, easing: 'ease-out' });
        sfx.boing(); S.board(SHAPES[t].replace('hình', 'Hình'));
        await S.say(`Đây là ${SHAPES[t]}.`);
        d.style.left = x + '%'; d.style.top = y + '%'; d.style.width = w + '%';
        await S.say(`${SHAPES[t]} ${txt}.`);
      }
      S.add('🐱', 70, 80, 'hop'); S.add('🌷', 20, 85); S.add('🌷', 28, 87);
      S.board('🏠 Ngôi nhà xinh!'); sfx.win();
      await S.say('Các hình ghép lại thành một ngôi nhà thật xinh. Con hãy tìm các hình quanh nhà mình nhé!');
    }
  },
  {
    id: 'sosanh', title: 'Cá sấu tham ăn', em: '🐊🐟🐟', sub: 'Lớn hơn, bé hơn', quiz: 'sosanh', bg: 'sea',
    async play(S) {
      await S.say('Ở dưới biển có một chú cá sấu rất tham ăn. Chú luôn há miệng về phía có nhiều cá hơn!');
      for (let round = 0; round < 2; round++) {
        S.clear();
        let a = rnd(1, 6), b = rnd(1, 6); while (b === a) b = rnd(1, 6);
        const ya = spread(a, 25, 85), yb = spread(b, 25, 85);
        ya.forEach((y, k) => S.add('🐟', k % 2 ? 22 : 12, y, 'hop'));
        yb.forEach((y, k) => S.add('🐠', k % 2 ? 78 : 88, y, 'hop'));
        S.label(a, 17, 14); S.label(b, 83, 14);
        await S.say(`Bên trái có ${numWord(a)} con cá. Bên phải có ${numWord(b)} con cá.`);
        const m = S.add(`<div style="font-size:1.6em;color:#2d6a4f;font-weight:900;text-shadow:0 4px 0 #1b4332">${a > b ? '&gt;' : '&lt;'}</div><div style="font-size:.5em;margin-top:-1.6em">👀</div>`, 50, 50);
        m.style.textAlign = 'center'; m.style.fontSize = '120px';
        m.animate([{ transform: 'translate(-50%,-50%) scale(.6)' }, { transform: 'translate(-50%,-50%) scale(1.1)' }, { transform: 'translate(-50%,-50%) scale(1)' }], { duration: 600, iterations: 2 });
        sfx.boing();
        await S.say(`Cá sấu há miệng về phía ${a > b ? 'bên trái' : 'bên phải'}, vì bên đó nhiều cá hơn. Ngoạm!`);
        S.board(`${a} ${a > b ? '&gt;' : '&lt;'} ${b}`);
        await S.say(`${numWord(a)} ${a > b ? 'lớn hơn' : 'bé hơn'} ${numWord(b)}.`);
      }
      S.clear(); const n = rnd(2, 5);
      spread(n, 25, 80).forEach(y => { S.add('🐟', 15, y, 'hop'); S.add('🐠', 85, y, 'hop'); });
      S.add('<b style="font-size:1.5em">=</b>', 50, 50).style.fontSize = '120px';
      S.board(`${n} = ${n}`);
      await S.say(`Còn khi hai bên có số cá bằng nhau, ta dùng dấu bằng. ${numWord(n)} bằng ${numWord(n)}.`);
    }
  },
  {
    id: 'vitri', title: 'Mèo con trốn tìm', em: '🐱📦', sub: 'Trên, dưới, trái, phải', quiz: 'vitri', bg: '',
    async play(S) {
      S.add('📦', 50, 55).style.fontSize = '110px';
      const cat = S.add('🐱', 50, 20);
      await S.say('Mèo con thích chơi trốn tìm quanh chiếc hộp. Mèo con ở đâu nhỉ?');
      const steps = [[50, 22, 'Mèo con ở trên chiếc hộp.', '⬆️ Ở trên'], [20, 58, 'Mèo con ở bên trái chiếc hộp.', '⬅️ Bên trái'], [80, 58, 'Mèo con ở bên phải chiếc hộp.', 'Bên phải ➡️'], [50, 88, 'Mèo con ở dưới chiếc hộp.', '⬇️ Ở dưới']];
      for (const [x, y, t, bd] of shuffle(steps)) {
        cat.style.left = x + '%'; cat.style.top = y + '%'; sfx.whoosh(); await S.wait(1000);
        cat.classList.add('wiggle'); S.board(bd); await S.say(t); cat.classList.remove('wiggle');
      }
      S.add('🐭', 92, 85, 'hop');
      await S.say('Ơ kìa! Chú chuột ở bên phải, phía dưới. Mèo con ơi, mình chơi tiếp nhé!');
    }
  },
  {
    id: 'tenlua', title: 'Tên lửa đếm ngược', em: '🚀🌙⭐', sub: 'Đếm lùi từ 10 về 0', quiz: 'quyluat', bg: 'night',
    async play(S) {
      ['⭐', '✨', '⭐', '✨', '⭐'].forEach((s, k) => S.add(s, 10 + k * 20, 10 + (k % 2) * 12, 'wiggle').style.fontSize = '30px');
      S.add('🌙', 88, 14);
      const r = S.add('🚀', 50, 72); r.style.fontSize = '110px'; r.style.transform = 'translate(-50%,-50%) rotate(-45deg)';
      await S.say('Tên lửa chuẩn bị bay lên mặt trăng! Mình cùng đếm ngược nào!');
      for (let k = 10; k >= 0; k--) { S.board(k); tone([300 + k * 40], .1, 'square', .05); await S.say(numWord(k), 1.05); }
      await S.say('Phóng!', 1);
      r.style.transition = 'top 2.5s ease-in, transform 2.5s'; r.style.top = '-30%'; sfx.whoosh(); Confetti.burst(null, null, 100);
      await S.wait(2600);
      await S.say('Tên lửa bay lên trời rồi! Con đếm lùi giỏi quá!');
    }
  }
];

function cartoonsHome() {
  setTitle('Xem hoạt hình');
  const vids = progress.videos || [];
  app.innerHTML = `<div class="hero">${Owl.html()}<div class="bubble">Chọn một phim để xem nhé! 🎬</div></div>
    <div class="cgrid">${CARTOONS.map(c => `<button class="cthumb" data-id="${c.id}"><div class="pic" style="background:${pickBg(c.bg)}">${splitEmoji(c.em).map(e => `<span>${e}</span>`).join('')}</div><div class="cap">▶️ ${c.title}<small>${c.sub}</small></div></button>`).join('')}</div>
    ${vids.length ? `<h2 class="section-title">📺 Video bố mẹ chọn</h2><div class="cgrid">${vids.map((v, k) => `<button class="cthumb" data-yt="${k}"><div class="pic" style="background:#000"><img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" style="width:100%;height:100%;object-fit:cover" alt=""></div><div class="cap">▶️ ${escapeHtml(v.title || 'Video')}</div></button>`).join('')}</div>` : ''}`;
  $$('.cthumb[data-id]', app).forEach(b => b.onclick = () => go('phim/' + b.dataset.id));
  $$('.cthumb[data-yt]', app).forEach(b => b.onclick = () => go('yt/' + b.dataset.yt));
  TTS.say('Con muốn xem phim hoạt hình nào?');
}
function pickBg(bg) { return bg === 'night' ? 'linear-gradient(#1d3557,#457b9d)' : bg === 'sea' ? 'linear-gradient(#90e0ef,#0077b6)' : bg === 'castle' ? 'linear-gradient(#ffc8dd,#f3e8ff)' : bg === 'dream' ? 'linear-gradient(#cdb4db,#bde0fe)' : 'linear-gradient(#8ecae6,#95d5b2)'; }
function splitEmoji(s) { return typeof Intl !== 'undefined' && Intl.Segmenter ? [...new Intl.Segmenter().segment(s)].map(x => x.segment) : [...s]; }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function playCartoon(id) {
  const c = CARTOONS.find(x => x.id === id); if (!c) return go('phim');
  setTitle(c.title); const tok = screenTok;
  app.innerHTML = `<div class="cartoon-wrap"><div class="stage ${c.bg}" id="stage"></div>
    <div class="row"><button class="btn primary replay">🔁 Xem lại</button><button class="btn list">🎬 Phim khác</button><button class="btn quiz">✏️ Luyện tập</button></div></div>`;
  $('.replay', app).onclick = () => { screenTok++; TTS.stop(); playCartoon(id); };
  $('.list', app).onclick = () => go('phim');
  $('.quiz', app).onclick = () => go('bai/' + c.quiz);
  const S = makeStage($('#stage'), tok);
  (async () => {
    try {
      await S.titleCard(c.em, c.title);
      await c.play(S);
      S.check(); sfx.win(); Confetti.burst(null, null, 120); addStar(1);
      S.sub('Hết phim! Bấm “Luyện tập” để thử sức nhé 👇'); await TTS.say('Hết phim rồi! Con bấm nút luyện tập để thử sức nhé.');
    } catch (e) { if (e !== STOP) console.error(e); }
  })();
}

function playYoutube(k) {
  const v = (progress.videos || [])[+k]; if (!v) return go('phim');
  setTitle(v.title || 'Video');
  app.innerHTML = `<div class="cartoon-wrap"><iframe class="yt-frame" src="https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>
    <div class="row"><button class="btn list">🎬 Phim khác</button></div></div>`;
  $('.list', app).onclick = () => go('phim');
}
function ytId(url) {
  const m = String(url).match(/(?:youtu\.be\/|v=|shorts\/|embed\/|live\/)([\w-]{11})/) || String(url).match(/^([\w-]{11})$/);
  return m ? m[1] : null;
}
