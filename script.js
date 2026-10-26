/* Бизнесу выть! — приглашение. Правь данные события здесь. */
const EVENT = {
  start: '2026-10-31T19:00:00+03:00',   // начало
  end:   '2026-11-01T01:00:00+03:00',   // конец (для календаря)
  time: 'суббота · с 19:00',
  venue: 'в Точке',
  address: 'адрес и схема прохода — в календаре',
  mapUrl: 'https://yandex.ru/maps',      // ← ссылка на карту
  rsvpUrl: 'https://forms.yandex.ru',    // ← ссылка на форму RSVP
  title: 'Хэллоуин в Точке · Бизнесу выть!',
  description: 'Гасим свет в 21:00 на 10 секунд. Фонарик выдают на входе. «Утро после» не открывать до 1 ноября.'
};

// ---- подстановка данных ----
document.querySelectorAll('[data-field]').forEach(el => {
  const key = el.dataset.field;
  if (!(key in EVENT)) return;
  if (el.tagName === 'A') el.href = EVENT[key]; else el.textContent = EVENT[key];
});

// ---- календарь (.ics) ----
(function buildIcs() {
  const fmt = iso => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tochka//Halloween//RU', 'BEGIN:VEVENT',
    'UID:tochka-halloween-2026@tochka', 'DTSTAMP:' + fmt(new Date().toISOString()),
    'DTSTART:' + fmt(EVENT.start), 'DTEND:' + fmt(EVENT.end),
    'SUMMARY:' + EVENT.title, 'DESCRIPTION:' + EVENT.description.replace(/,/g, '\\,'),
    'LOCATION:' + (EVENT.venue + ', ' + EVENT.address).replace(/,/g, '\\,'),
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');
  const a = document.getElementById('ics');
  a.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
})();

// ---- обратный отсчёт ----
(function countdown() {
  const target = new Date(EVENT.start).getTime();
  const d = document.getElementById('cd-d'), h = document.getElementById('cd-h'),
        m = document.getElementById('cd-m'), s = document.getElementById('cd-s');
  const pad = n => String(Math.max(0, n)).padStart(2, '0');
  function tick() {
    let diff = Math.max(0, target - Date.now());
    const days = Math.floor(diff / 864e5); diff -= days * 864e5;
    const hrs = Math.floor(diff / 36e5); diff -= hrs * 36e5;
    const mins = Math.floor(diff / 6e4); diff -= mins * 6e4;
    const secs = Math.floor(diff / 1e3);
    d.textContent = pad(days); h.textContent = pad(hrs); m.textContent = pad(mins); s.textContent = pad(secs);
    if (target - Date.now() <= 0) document.getElementById('countdown').classList.add('now');
  }
  tick(); setInterval(tick, 1000);
})();

// ---- выключатель света ----
const body = document.body;
const sw = document.getElementById('switch');
const torch = document.getElementById('torch');
const secret = document.getElementById('secret');
let dark = false;

function setDark(on) {
  dark = on;
  body.classList.toggle('dark', on);
  sw.setAttribute('aria-pressed', String(on));
  if (on) { placeTorch(window.innerWidth * 0.5, window.innerHeight * 0.45); hintOnce(); }
}
sw.addEventListener('click', () => setDark(!dark));
document.addEventListener('keydown', e => { if (e.key.toLowerCase() === 'l' || e.key === 'Escape' && dark) setDark(e.key === 'Escape' ? false : !dark); });

let hinted = false;
function hintOnce() {
  if (hinted) return; hinted = true;
  const hint = document.createElement('div');
  hint.className = 'hint';
  hint.textContent = window.matchMedia('(pointer: coarse)').matches ? 'Води пальцем по экрану — это фонарик' : 'Води мышкой — это фонарик';
  body.appendChild(hint);
  setTimeout(() => hint.classList.add('show'), 50);
  setTimeout(() => { hint.classList.remove('show'); setTimeout(() => hint.remove(), 600); }, 4200);
}

// ---- фонарик ----
function placeTorch(x, y) {
  torch.style.setProperty('--tx', x + 'px');
  torch.style.setProperty('--ty', y + 'px');
  secret.style.setProperty('--tx', x + 'px');
  secret.style.setProperty('--ty', y + 'px');
}
window.addEventListener('pointermove', e => { if (dark) placeTorch(e.clientX, e.clientY); }, { passive: true });
window.addEventListener('touchmove', e => { if (dark && e.touches[0]) placeTorch(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
window.addEventListener('touchstart', e => { if (dark && e.touches[0]) placeTorch(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });

// ---- появление по скроллу ----
const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
}, { threshold: 0.18 });
document.querySelectorAll('.reveal-on-scroll').forEach(el => io.observe(el));

// ---- глаза утконоса следят за курсором ----
(function eyes() {
  const eyesG = document.querySelector('.eyes');
  if (!eyesG) return;
  window.addEventListener('pointermove', e => {
    const r = eyesG.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
    const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
    eyesG.style.transform = `translate(${dx * 10}px, ${dy * 8}px)`;
  }, { passive: true });
})();

// ---- RSVP: маленький праздник ----
document.getElementById('rsvp-yes').addEventListener('click', () => {
  const note = document.getElementById('rsvp-note');
  note.textContent = 'Утконос записал. Фонарик твой.';
  for (let i = 0; i < 14; i++) {
    const g = document.createElement('span');
    g.className = 'mini-ghost';
    g.style.left = (10 + Math.random() * 80) + '%';
    g.style.setProperty('--dur', (3 + Math.random() * 3) + 's');
    g.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
    g.textContent = '👻';
    body.appendChild(g);
    setTimeout(() => g.remove(), 6500);
  }
});
