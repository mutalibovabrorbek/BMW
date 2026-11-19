/* ==== IMAGE SLOTS ====
   Put your own / openly licensed image URLs here (e.g. from Wikimedia Commons, or files in ./img/).
   desktop = default, mobile = used under 834px. Empty or broken URL -> built-in SVG fallback is shown. */
const IMAGES = {};
for (let i = 1; i <= 18; i++) IMAGES[i] = { desktop: '', mobile: '' };
const KINDS = {1:'gift',2:'foldable',3:'phone',4:'display',5:'tablet',6:'watch',7:'audio',8:'tradein',9:'card'};
for (let i = 10; i <= 18; i++) KINDS[i] = 'media';

function fallbackSVG(kind, dark) {
  const f = dark ? '#2b2b30' : '#ffffff', s = dark ? '#5a5a60' : '#c7c7cc', k = dark ? '#0b0b0d' : '#e8e8ed';
  const r = (x,y,w,h,rx,fill=f) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${s}" stroke-width="2"/>`;
  const phone = (x,y) => r(x,y,100,210,22) + r(x+6,y+6,88,198,17,k) + r(x+38,y+12,24,7,4,f);
  const shapes = {
    laptop: r(60,30,280,180,12) + r(70,40,260,160,6,k) + r(20,210,360,14,7),
    phone: phone(150,40),
    tablet: r(70,40,260,200,18) + r(80,50,240,180,10,k),
    watch: r(165,10,70,70,12) + r(165,200,70,70,12) + r(150,70,100,130,30) + r(158,78,84,114,24,k),
    audio: `<path d="M110 150a90 90 0 0 1 180 0" fill="none" stroke="${s}" stroke-width="8"/>` + r(90,140,36,80,16) + r(274,140,36,80,16),
    display: r(60,30,280,170,10) + r(70,40,260,150,4,k) + r(185,200,30,50,2) + r(150,250,100,8,4),
    tradein: phone(95,50) + phone(205,70),
    gift: r(110,110,180,130,8) + `<rect x="192" y="110" width="16" height="130" fill="${s}"/>` + r(110,90,180,30,6),
    foldable: r(70,50,260,190,16) + r(80,60,118,170,8,k) + r(202,60,118,170,8,k),
    media: r(40,40,320,220,14,k) + `<path d="M180 110l60 40-60 40z" fill="${s}"/>`,
    card: r(70,70,260,160,20) + `<rect x="70" y="110" width="260" height="30" fill="${s}" opacity=".5"/>` + r(95,185,70,14,4,k)
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">${shapes[kind]}</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

(function initImages() {
  const mq = matchMedia('(max-width:833px)');
  document.querySelectorAll('img[data-slot]').forEach(img => {
    const n = img.dataset.slot, cfg = IMAGES[n] || {};
    const dark = !!img.closest('.hero--dark, .tile--dark, .ent-card');
    const fb = fallbackSVG(KINDS[n], dark);
    const apply = () => { const u = (mq.matches && cfg.mobile) || cfg.desktop; img.src = u || fb; };
    img.addEventListener('error', () => { if (img.src !== fb) img.src = fb; });
    img.src = fb;            // never empty
    apply();
    mq.addEventListener('change', apply);
  });
})();

(() => {
  const nav = document.getElementById('nav');
  const dd = document.getElementById('dropdown');
  const inner = document.getElementById('dropdownInner');
  const scrim = document.getElementById('scrim');
  const burger = document.getElementById('burger');
  const buttons = document.querySelectorAll('.nav-links button');

  const menus = {
    store: [['Shop', ['Shop the Latest', 'Accessories', 'Gift Cards']], ['Quick Links', ['Find a Store', 'Order Status', 'Trade In']]],
    mac: [['Explore', ['Laptops', 'Desktops', 'Displays']], ['Shop', ['Shop Mac', 'Accessories']]],
    ipad: [['Explore', ['Pro', 'Air', 'Mini']], ['Shop', ['Shop Tablets', 'Accessories']]],
    phone: [['Explore', ['Pro', 'Standard', 'Compare']], ['Shop', ['Shop Phones', 'Accessories']]],
    watch: [['Explore', ['Ultra', 'Series', 'SE']], ['Shop', ['Shop Watch', 'Bands']]],
    support: [['Get Help', ['Support Home', 'Repair', 'Contact Us']], ['Resources', ['Manuals', 'Community']]]
  };

  let current = null, closeTimer;

  function render(key) {
    inner.innerHTML = '';
    (menus[key] || menus.store).forEach(([title, items], ci) => {
      const col = document.createElement('div');
      col.className = 'dd-col';
      col.innerHTML = `<h3>${title}</h3>`;
      items.forEach((t, i) => {
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = t;
        if (ci > 0) a.className = 'sm';
        a.style.transitionDelay = `${i * 40}ms`;
        col.appendChild(a);
      });
      inner.appendChild(col);
    });
  }

  function open(key) {
    clearTimeout(closeTimer);
    if (current !== key) render(key);
    current = key;
    nav.classList.add('open');
    dd.classList.remove('show');
    void dd.offsetWidth; // restart stagger
    dd.classList.add('show');
    dd.setAttribute('aria-hidden', 'false');
    scrim.classList.add('show');
    buttons.forEach(b => b.classList.toggle('on', b.dataset.menu === key));
  }

  function close() {
    current = null;
    dd.classList.remove('show');
    dd.setAttribute('aria-hidden', 'true');
    scrim.classList.remove('show');
    buttons.forEach(b => b.classList.remove('on'));
    if (!nav.classList.contains('mobile-open')) nav.classList.remove('open');
  }

  const desktop = () => window.matchMedia('(min-width:834px)').matches;

  buttons.forEach(b => {
    b.addEventListener('mouseenter', () => desktop() && open(b.dataset.menu));
    b.addEventListener('click', () => desktop() && (current === b.dataset.menu ? close() : open(b.dataset.menu)));
  });
  nav.addEventListener('mouseleave', () => desktop() && (closeTimer = setTimeout(close, 120)));
  nav.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  scrim.addEventListener('click', close);
  document.addEventListener('keydown', e => e.key === 'Escape' && close());

  burger.addEventListener('click', () => {
    const on = nav.classList.toggle('mobile-open');
    nav.classList.toggle('open', on);
    burger.setAttribute('aria-expanded', on);
    document.body.style.overflow = on ? 'hidden' : '';
  });
  window.addEventListener('resize', () => {
    if (desktop()) { nav.classList.remove('mobile-open'); document.body.style.overflow = ''; }
    close();
  });

  // Footer accordions (mobile)
  document.querySelectorAll('.fh').forEach(h => h.addEventListener('click', () => {
    if (!desktop()) h.parentElement.classList.toggle('open');
  }));

  // Subtle parallax on artwork
  const arts = document.querySelectorAll('.art');
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (!reduce) {
    let ticking = false;
    addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        arts.forEach(a => {
          const r = a.parentElement.getBoundingClientRect();
          if (r.bottom < 0 || r.top > innerHeight) return;
          a.style.translate = `0 ${(r.top / innerHeight) * -14}px`;
        });
        ticking = false;
      });
    }, { passive: true });
  }

  // Entertainment carousel
  const track = document.getElementById('entTrack');
  if (track) {
    const step = () => (track.querySelector('.ent-card').offsetWidth + 16);
    document.getElementById('entPrev').addEventListener('click', () => track.scrollBy({ left: -step() }));
    document.getElementById('entNext').addEventListener('click', () => track.scrollBy({ left: step() }));
  }
})();
