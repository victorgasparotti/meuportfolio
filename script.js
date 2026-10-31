const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ---------- menu mobile ---------- */
const burger = $('#burger'), links = $('#links');
burger.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
$$('a', links).forEach(a => a.addEventListener('click', () => {
  links.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
}));

/* ---------- carrossel de projetos arrastável ---------- */
const rail = $('#rail');
let down = false, startX = 0, startScroll = 0, moved = false;
rail.addEventListener('pointerdown', e => {
  if (e.pointerType === 'touch') return;
  down = true; moved = false; startX = e.clientX; startScroll = rail.scrollLeft;
});
window.addEventListener('pointermove', e => {
  if (!down) return;
  const dx = e.clientX - startX;
  if (Math.abs(dx) > 4) { moved = true; rail.classList.add('drag'); }
  rail.scrollLeft = startScroll - dx;
});
window.addEventListener('pointerup', () => { down = false; rail.classList.remove('drag'); });
rail.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; } }, true);

/* ---------- barra de progresso, menu e linha do tempo (rolagem) ---------- */
const progress = $('.progress'), nav = $('.nav'), timeline = $('.timeline');
let ticking = false;
function onScroll() {
  ticking = false;
  const y = scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  nav.classList.toggle('scrolled', y > 40);
  if (!reduce) document.documentElement.style.setProperty('--sy', y);
  if (timeline) {
    const r = timeline.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.72 - r.top) / r.height));
    timeline.style.setProperty('--p', p.toFixed(3));
  }
}
addEventListener('scroll', () => {
  if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
}, { passive: true });
addEventListener('resize', onScroll);
onScroll();

/* ---------- link ativo no menu ---------- */
const spy = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    $$('.links a:not(.cv)').forEach(a =>
      a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id]').forEach(sec => spy.observe(sec));

if (!reduce) {

  /* ---------- nome: letra por letra ---------- */
  let n = 0;
  $$('h1 span').forEach(line => {
    const text = line.textContent;
    line.setAttribute('aria-label', text);
    line.textContent = '';
    [...text].forEach(ch => {
      const i = document.createElement('i');
      i.className = 'ch';
      i.setAttribute('aria-hidden', 'true');
      i.style.setProperty('--i', n++);
      i.textContent = ch;
      line.appendChild(i);
    });
  });

  /* ---------- texto que digita ---------- */
  const typed = $('#typed');
  const words = ['back-end com Python', 'APIs e integrações', 'bancos de dados SQL', 'o primeiro estágio'];
  let w = 0, c = 0, deleting = false;
  typed.textContent = '';
  (function type() {
    const word = words[w];
    c += deleting ? -1 : 1;
    typed.textContent = word.slice(0, c);
    let delay = deleting ? 38 : 85;
    if (!deleting && c === word.length) { deleting = true; delay = 1700; }
    else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 380; }
    setTimeout(type, delay);
  })();

  /* ---------- barras de nível na stack ---------- */
  $$('.tech').forEach(card => {
    const lvl = $('.lvl', card);
    const width = lvl.classList.contains('pr') ? 85 : lvl.classList.contains('ia') ? 62 : 48;
    const bar = document.createElement('span');
    bar.className = 'bar';
    bar.setAttribute('aria-hidden', 'true');
    const fill = document.createElement('b');
    fill.style.setProperty('--w', width + '%');
    bar.appendChild(fill);
    card.insertBefore(bar, lvl);
  });

  /* ---------- revelar ao rolar, com atraso escalonado ---------- */
  const targets = $$('main section:not(.hero) h2, .sec-sub, .about .text, .fact, .tech, .step, .proj, .contact, .hint');
  targets.forEach(el => {
    el.classList.add('reveal');
    const sibs = [...el.parentElement.children].filter(x => x.classList.contains('reveal') || targets.includes(x));
    el.style.setProperty('--d', (Math.min(sibs.indexOf(el), 7) * 0.08).toFixed(2) + 's');
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add('in');
      setTimeout(() => el.classList.add('done'), 1500);
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  targets.forEach(el => io.observe(el));

  if (fine) {

    /* ---------- cards: inclinação 3D + brilho que segue o cursor ---------- */
    $$('.tech, .proj, .fact, .about .text, .contact').forEach(card => {
      card.classList.add('tilt');
      const strong = card.matches('.about .text, .contact') ? 2.2 : 7;
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        card.style.transform =
          `perspective(900px) rotateX(${((0.5 - y) * strong).toFixed(2)}deg) rotateY(${((x - 0.5) * strong * 1.3).toFixed(2)}deg)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });

    /* ---------- botões magnéticos ---------- */
    $$('.btn, .links a.cv').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
        btn.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });

    /* ---------- luz do cursor e parallax da foto ---------- */
    const glow = $('.cursor-glow'), wrap = $('.portrait-wrap');
    let tx = 0, ty = 0, cx = 0, cy = 0, gx = innerWidth / 2, gy = innerHeight / 2, mx = gx, my = gy;
    addEventListener('pointermove', e => {
      mx = e.clientX; my = e.clientY;
      tx = e.clientX / innerWidth - 0.5;
      ty = e.clientY / innerHeight - 0.5;
      glow.classList.add('on');
    });
    document.addEventListener('pointerleave', () => glow.classList.remove('on'));
    (function loop() {
      cx += (tx - cx) * 0.07; cy += (ty - cy) * 0.07;
      gx += (mx - gx) * 0.12; gy += (my - gy) * 0.12;
      wrap.style.setProperty('--px', cx.toFixed(3));
      wrap.style.setProperty('--py', cy.toFixed(3));
      glow.style.transform = `translate(${gx.toFixed(1)}px, ${gy.toFixed(1)}px)`;
      requestAnimationFrame(loop);
    })();
  }
}
