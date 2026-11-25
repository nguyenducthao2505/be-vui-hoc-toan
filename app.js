/* ==== Điều hướng, trang chủ, góc bố mẹ ==== */
'use strict';
const app = document.getElementById('app');

const GAMES = [
  { h: 'phim', ic: '🎬', name: 'Xem hoạt hình', sub: '12 phim học toán', color: '#ff006e' },
  { h: 'ngoc', ic: '🧜‍♀️', name: 'Tiên cá bắt ngọc', sub: 'Bơi theo đáp án', color: '#0096c7' },
  { h: 'tomau', ic: '🎨', name: 'Tô màu theo số', sub: 'Lâu đài, hoa, kỳ lân', color: '#e056fd' },
  { h: 'tiec', ic: '🫖', name: 'Tiệc trà công chúa', sub: 'Đếm đủ món', color: '#ff8fab' },
  { h: 'noisao', ic: '✨', name: 'Nối sao thần kỳ', sub: 'Đếm 1, 2, 3…', color: '#5a189a' },
  { h: 'kylan', ic: '🦄', name: 'Kỳ lân nhảy số', sub: 'Cộng trừ trên tia số', color: '#9d4edd' },
  { h: 'bong', ic: '🎈', name: 'Bắt bóng bay', sub: 'Nghe và chạm', color: '#f77f00' },
  { h: 'the', ic: '🃏', name: 'Lật thẻ', sub: 'Ghép số với hình', color: '#7209b7' },
  { h: 'xep', ic: '🧩', name: 'Xếp hình', sub: 'Kéo hình vào ô', color: '#06d6a0' },
  { h: 'thuthach', ic: '🎤', name: 'Thử thách giọng nói', sub: 'Nói to đáp án', color: '#ef476f' }
];

function home() {
  setTitle('Bé Vui Học Toán');
  const name = settings.childName ? ' ' + escapeHtml(settings.childName) : '';
  const tile = (h, ic, nm, sub, color, badge = '') => `<button class="tile" style="background:${color}" data-h="${h}"><span class="ic">${ic}</span>${nm}<small>${sub}</small>${badge}</button>`;
  const warn = [];
  if (Native.on ? TTS.nativeVi === false : (TTS.ok && !TTS.voice && speechSynthesis.getVoices().length)) warn.push('Máy chưa có giọng đọc tiếng Việt – xem hướng dẫn trong “Góc bố mẹ”.');
  if (!TTS.ok) warn.push('Trình duyệt không hỗ trợ giọng đọc. Hãy mở bằng Google Chrome.');
  app.innerHTML = `<div class="hero">${Owl.html()}<div class="bubble">Chào ${settings.theme === 'princess' ? 'công chúa nhỏ' : 'bé'}${name}! Hôm nay mình học gì nào? ${settings.theme === 'princess' ? '👑' : '🌈'}</div></div>
    ${warn.map(w => `<div class="warn">⚠️ ${w}</div>`).join('')}
    <h2 class="section-title">🎬 Xem & chơi</h2>
    <div class="home-grid">${GAMES.map(g => tile(g.h, g.ic, g.name, g.sub, g.color)).join('')}</div>
    <h2 class="section-title">📚 Học toán</h2>
    <div class="home-grid">${tile('hoc', '🔟', 'Học số', `Từ 0 đến ${settings.max}`, '#ffb703')}
      ${Object.entries(MODULES).map(([k, m]) => { const s = progress.stats[k]; return tile('bai/' + k, m.ic, m.name, m.sub, m.color, s ? `<span class="badge">✔ ${s.ok}</span>` : ''); }).join('')}</div>
    <h2 class="section-title">🎁 Khác</h2>
    <div class="home-grid">${tile('suutap', '🎁', 'Bộ sưu tập', `${progress.stickers.length} hình dán`, '#52b788')}${tile('bome', '👨‍👩‍👧', 'Góc bố mẹ', 'Cài đặt & tiến độ', '#577590')}</div>`;
  $$('.tile', app).forEach(t => t.onclick = () => { sfx.pop(); go(t.dataset.h); });
}

function stickerBook() {
  setTitle('Bộ sưu tập');
  const list = progress.stickers;
  app.innerHTML = `<div class="panel"><div class="row">${Owl.html('small')}<h2>Hình dán của bé: ${list.length}</h2></div>
    ${list.length ? `<div class="sbook">${list.map((s, k) => `<span style="animation-delay:${Math.min(k, 40) * 40}ms">${s}</span>`).join('')}</div>` : '<p style="font-size:22px">Con hãy làm xong một bài học hoặc trò chơi để nhận hình dán nhé!</p>'}</div>`;
  TTS.say(list.length ? `Con đã có ${numWord(Math.min(list.length, 99))} hình dán. Giỏi quá!` : 'Con chưa có hình dán nào. Mình cùng học để nhận hình dán nhé!');
}

function parentGate() {
  setTitle('Góc bố mẹ'); const a = rnd(6, 9), b = rnd(6, 9);
  app.innerHTML = `<div class="panel gate"><div>🔒 Dành cho bố mẹ</div><div>${a} × ${b} = ?</div>
    <input type="number" inputmode="numeric" id="gateIn"><button class="btn primary" id="gateOk">Vào</button></div>`;
  const ok = () => { if (+$('#gateIn').value === a * b) parentScreen(); else { $('#gateIn').value = ''; toast('Chưa đúng'); } };
  $('#gateOk').onclick = ok; $('#gateIn').onkeydown = e => { if (e.key === 'Enter') ok(); };
}

function parentScreen() {
  const voices = TTS.ok ? speechSynthesis.getVoices().filter(v => /^vi/i.test(v.lang)) : [];
  const rows = Object.entries(MODULES).map(([k, m]) => { const s = progress.stats[k] || { ok: 0, total: 0 }; return `<tr><td>${m.ic} ${m.name}</td><td>${s.ok}/${s.total}</td><td>${s.total ? Math.round(s.ok / s.total * 100) + '%' : '–'}</td></tr>`; }).join('');
  app.innerHTML = `<div class="panel">
    <h2>⚙️ Cài đặt</h2>
    <label>Tên của bé <input type="text" id="sName" value="${escapeHtml(settings.childName)}" placeholder="VD: Bống"></label>
    <label>Chủ đề <select id="sTheme"><option value="princess">👑 Công chúa – Nàng tiên – Tiên cá</option><option value="animal">🐶 Thú cưng – Hoa quả</option></select></label>
    <label>Nhân vật dẫn dắt <select id="sMascot"><option value="tien">🧚 Tiên Nhỏ</option><option value="cu">🦉 Cú Tí Hon</option></select></label>
    <label>Phạm vi số <select id="sMax"><option value="10">0 – 10 (mẫu giáo)</option><option value="20">0 – 20 (chuẩn bị lớp 1)</option></select></label>
    <label>Tốc độ đọc <input type="range" id="sRate" min="0.6" max="1.3" step="0.05" value="${settings.rate}"></label>
    <label>Giọng đọc <input type="checkbox" id="sVoice" ${settings.voice ? 'checked' : ''}></label>
    <label>Âm thanh hiệu ứng <input type="checkbox" id="sSfx" ${settings.sfx ? 'checked' : ''}></label>
    <label>Tự bật micro sau mỗi câu hỏi <input type="checkbox" id="sAuto" ${settings.autoListen ? 'checked' : ''}></label>
    <div class="row" style="margin-top:12px"><button class="btn" id="testV">🔊 Thử giọng đọc</button>${SR ? '<button class="btn" id="testM">🎤 Thử micro</button>' : ''}</div>
    <p class="muted" id="diag">Chế độ: ${Native.on ? 'Ứng dụng APK' : 'Trình duyệt'} · Giọng tiếng Việt: ${Native.on ? (TTS.nativeVi ? 'có' : TTS.nativeVi === false ? 'CHƯA CÓ' : 'đang kiểm tra') : voices.length ? voices.map(v => v.name).join(', ') : 'CHƯA CÓ'} · Nhận giọng nói: ${SR ? 'có hỗ trợ' : 'không hỗ trợ (hãy dùng Chrome)'}</p>
    <details><summary style="font-size:18px;font-weight:800">❓ Cách cài giọng đọc tiếng Việt trên Android</summary>
      <ol style="font-size:16px;line-height:1.6"><li>Cài đặt → Hệ thống (hoặc Quản lý chung) → Ngôn ngữ và nhập liệu → Đầu ra chuyển văn bản thành giọng nói.</li>
      <li>Chọn công cụ ưu tiên: <b>Dịch vụ lời nói của Google</b>.</li><li>Bấm ⚙️ → Cài đặt dữ liệu giọng nói → <b>Tiếng Việt</b> → tải về.</li>
      <li>Micro: khi được hỏi quyền dùng micro, chọn <b>Cho phép</b>.</li>
      <li>Muốn bé nói đáp án khi <b>không có mạng</b> (bản APK): mở ứng dụng Google → ảnh đại diện → Cài đặt → Giọng nói → Nhận dạng lời nói ngoại tuyến → tải <b>Tiếng Việt</b> (nếu máy hỗ trợ).</li></ol></details>
    <h2>📺 Video YouTube của bố mẹ</h2>
    <p class="muted">Dán link video hoạt hình toán học bố mẹ đã xem và chọn. Video sẽ hiện trong mục “Xem hoạt hình” (cần Internet).</p>
    <div class="row"><input type="text" id="ytUrl" placeholder="https://youtu.be/..." style="flex:1;min-width:220px"><input type="text" id="ytTitle" placeholder="Tên video" style="flex:1;min-width:160px"><button class="btn primary" id="ytAdd">➕ Thêm</button></div>
    <table style="margin-top:10px">${(progress.videos || []).map((v, k) => `<tr><td>${escapeHtml(v.title || v.id)}</td><td><button class="btn" data-del="${k}" style="font-size:16px;padding:6px 12px">🗑️</button></td></tr>`).join('')}</table>
    <h2>📊 Tiến độ</h2>
    <p style="font-size:18px">⭐ Tổng sao: <b>${progress.stars}</b> · 🎁 Hình dán: <b>${progress.stickers.length}</b></p>
    <table><tr><th>Bài</th><th>Đúng ngay lần đầu</th><th>Tỉ lệ</th></tr>${rows}</table>
    <div class="row" style="margin-top:16px"><button class="btn warn" id="reset">🗑️ Xoá tiến độ</button><button class="btn primary" id="done">✅ Xong</button></div>
  </div>`;
  $('#sMax').value = String(settings.max); $('#sTheme').value = settings.theme; $('#sMascot').value = settings.mascot;
  const upd = () => { settings.childName = $('#sName').value.trim().slice(0, 20); settings.max = +$('#sMax').value; settings.rate = +$('#sRate').value; settings.voice = $('#sVoice').checked; settings.sfx = $('#sSfx').checked; settings.autoListen = $('#sAuto').checked; settings.theme = $('#sTheme').value; settings.mascot = $('#sMascot').value; save(); applyTheme(); };
  $$('input,select', app).forEach(el => { if (!['ytUrl', 'ytTitle'].includes(el.id)) el.onchange = upd; });
  $('#testV').onclick = () => { upd(); TTS.say('Xin chào! Mình là Cú Tí Hon. Ba cộng hai bằng năm.'); };
  const tm = $('#testM'); if (tm) tm.onclick = async () => { try { const a = await listen(); toast(a.length ? 'Nghe được: ' + a[0] : 'Không nghe thấy gì'); } catch (e) { toast('Lỗi micro: ' + e); } };
  $('#ytAdd').onclick = () => { const id = ytId($('#ytUrl').value.trim()); if (!id) return toast('Link YouTube không hợp lệ'); progress.videos = progress.videos || []; progress.videos.push({ id, title: $('#ytTitle').value.trim() || 'Video ' + (progress.videos.length + 1) }); save(); toast('Đã thêm video'); parentScreen(); };
  $$('[data-del]', app).forEach(b => b.onclick = () => { progress.videos.splice(+b.dataset.del, 1); save(); parentScreen(); });
  let armed = false;
  $('#reset').onclick = e => { if (!armed) { armed = true; e.target.textContent = 'Bấm lần nữa để xác nhận'; return; } progress.stars = 0; progress.stickers = []; progress.stats = {}; save(); $('#starCount').textContent = 0; toast('Đã xoá tiến độ'); parentScreen(); };
  $('#done').onclick = () => { upd(); go(''); };
}

function route() {
  screenTok++; TTS.stop(); stopRec(); app.scrollTop = 0;
  const [a, b] = location.hash.replace(/^#\/?/, '').split('/');
  switch (a) {
    case '': case undefined: return home();
    case 'hoc': return learnNumbers();
    case 'bai': return MODULES[b] ? runQuiz(b) : home();
    case 'thuthach': return runQuiz(null, { mixed: true, listenAuto: !!SR });
    case 'bong': return gameBalloons();
    case 'ngoc': return gamePearls();
    case 'tomau': return gameColor();
    case 'tiec': return gameTea();
    case 'noisao': return gameDots();
    case 'kylan': return gameNumberLine();
    case 'the': return gameMemory();
    case 'xep': return gameShapes();
    case 'phim': return b ? playCartoon(b) : cartoonsHome();
    case 'yt': return playYoutube(b);
    case 'suutap': return stickerBook();
    case 'bome': return parentGate();
    default: return home();
  }
}

/* ---- Khởi động ---- */
(function init() {
  TTS.init(); applyTheme();
  $('#starCount').textContent = progress.stars;
  const sky = $('#sky-bg');
  for (let i = 0; i < 6; i++) { const s = document.createElement('div'); s.className = 'sparkle'; s.textContent = pick(['✨', '💖', '⭐', '🌸']); s.style.left = rnd(3, 95) + '%'; s.style.top = rnd(10, 90) + '%'; s.style.animationDelay = (-i * .6) + 's'; sky.appendChild(s); }
  if (Native.on) $('#btnFull').style.display = 'none';
  for (let i = 0; i < 4; i++) { const c = document.createElement('div'); c.className = 'cloud'; c.textContent = '☁️'; c.style.top = (5 + i * 22) + '%'; c.style.animationDuration = (40 + i * 15) + 's'; c.style.animationDelay = (-i * 12) + 's'; c.style.fontSize = (60 + i * 15) + 'px'; sky.appendChild(c); }
  $('#btnHome').onclick = () => { sfx.pop(); if (location.hash && location.hash !== '#') go(''); else route(); };
  $('#btnFull').onclick = () => { try { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); } catch (e) {} };
  window.addEventListener('hashchange', route);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { TTS.stop(); stopRec(); } });
  route();
  if (!Native.on && 'serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
