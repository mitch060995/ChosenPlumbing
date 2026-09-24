/* Chosen Plumbing — interactions */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Year */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* Nav background on scroll + floating call button */
  const nav = document.getElementById('nav');
  const fab = document.querySelector('.call-fab');
  const onScroll = () => {
    const s = window.scrollY;
    nav.classList.toggle('scrolled', s > 40);
    if (fab) fab.classList.toggle('show', s > window.innerHeight * 0.3);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  const burger = document.getElementById('burger');
  const menu = document.getElementById('mobile-menu');
  const setMenu = (open) => {
    burger.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* Reveal on scroll */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ---------------------------------------------------------------
     Rain hero: rain + splashes on a canvas, lightning, and a
     scroll-pinned camera pan up to the logo filling with water.
     --------------------------------------------------------------- */
  const hero = document.getElementById('rain-hero');
  if (hero) {
    const stage = hero.querySelector('.rh-stage');
    const canvas = document.getElementById('rh-rain');
    const ctx = canvas.getContext('2d');
    const flash = document.getElementById('rh-flash');
    const reveal = document.getElementById('rh-reveal');
    const wordmark = document.getElementById('rh-wordmark');
    const outline = document.getElementById('rh-outline');
    const wave = document.getElementById('rh-wave');
    const letters = [...wordmark.children];
    letters.forEach((s, i) => { s.style.transitionDelay = i * 0.06 + 's'; });

    // clouds
    const clouds = document.getElementById('rh-clouds');
    for (let i = 0; i < 9; i++) {
      const c = document.createElement('div');
      c.className = 'rh-cloud';
      const w = 300 + Math.random() * 500;
      c.style.width = w + 'px'; c.style.height = w * 0.45 + 'px';
      c.style.left = (Math.random() * 100 - 20) + '%';
      c.style.top = (Math.random() * 70) + '%';
      c.style.animationDuration = (40 + Math.random() * 40) + 's';
      c.style.animationDirection = i % 2 ? 'alternate-reverse' : 'alternate';
      clouds.appendChild(c);
    }

    // logo outline draw
    const len = outline.getTotalLength();
    outline.style.strokeDasharray = len;
    outline.style.strokeDashoffset = len;

    // stage height = real visible height (fixes phones / in-app browsers)
    const setStageH = () => document.documentElement.style.setProperty('--stage-h', window.innerHeight + 'px');

    // scroll progress 0 → 1
    let p = 0, pSmooth = 0, lastPan = 0;
    const readScroll = () => {
      if (reduceMotion) return;
      const total = hero.offsetHeight - window.innerHeight;
      p = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / total));
    };

    // rain particles
    let W = 0, H = 0, drops = [], splashes = [];
    const WIND = 0.18;
    const newDrop = (anyY) => {
      const z = Math.random();
      return { x: Math.random() * (W + 200) - 100, y: anyY ? Math.random() * H : -20 - Math.random() * 100,
        z, len: 10 + z * 22, v: 9 + z * 14, a: 0.15 + z * 0.45, w: 0.6 + z * 1.2 };
    };
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = stage.clientWidth; H = stage.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((W * H) / (W < 700 ? 5000 : 3500));
      if (Math.abs(n - drops.length) > n * 0.25) drops = Array.from({ length: n }, () => newDrop(true));
    };

    const clamp = (v) => Math.min(1, Math.max(0, v));
    const easeOut = (v) => 1 - Math.pow(1 - v, 3);
    let heroVisible = true;

    const frame = () => {
      pSmooth += (p - pSmooth) * 0.12;
      const pe = pSmooth;
      stage.style.setProperty('--p', pe.toFixed(4));
      const panV = (pe - lastPan) * H;
      lastPan = pe;

      if (heroVisible) {
        const groundY = H * 0.93 + pe * H;
        ctx.clearRect(0, 0, W, H);
        ctx.lineCap = 'round';
        for (const d of drops) {
          d.y += d.v + panV * (0.6 + d.z);
          d.x += d.v * WIND;
          const stretch = d.len + Math.abs(panV) * 2;
          ctx.strokeStyle = `rgba(175, 225, 240, ${d.a})`;
          ctx.lineWidth = d.w;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - WIND * stretch, d.y - stretch);
          ctx.stroke();
          const hitY = groundY - (1 - d.z) * H * 0.05;
          if (d.y > hitY && hitY < H) {
            if (d.z > 0.45) for (let k = 0; k < 3; k++) splashes.push({ x: d.x, y: hitY, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 3 - 1, life: 1 });
            Object.assign(d, newDrop(false));
          } else if (d.y > H + 40 || d.x > W + 120) {
            Object.assign(d, newDrop(false));
          }
        }
        ctx.fillStyle = 'rgba(190, 240, 245, .7)';
        splashes = splashes.filter((s) => (s.life -= 0.05) > 0);
        for (const s of splashes) {
          s.vy += 0.25; s.x += s.vx; s.y += s.vy;
          ctx.globalAlpha = s.life;
          ctx.beginPath(); ctx.arc(s.x, s.y, 1.3, 0, 6.283); ctx.fill();
        }
        ctx.globalAlpha = 1;

        // logo: outline draws 30%→60%, water fills 40%→85%, text from 80%
        outline.style.strokeDashoffset = len * (1 - clamp((pe - 0.30) / 0.30));
        const fill = easeOut(clamp((pe - 0.40) / 0.45));
        const level = 118 - fill * 118;
        const t = performance.now() / 600;
        let d = `M -10 ${level}`;
        for (let x = -10; x <= 110; x += 5) d += ` L ${x} ${level + Math.sin(x / 9 + t) * (fill < 1 ? 2.2 : 1.1)}`;
        wave.setAttribute('d', d + ' L 110 130 L -10 130 Z');
        const on = pe > 0.8;
        reveal.classList.toggle('on', on);
        wordmark.classList.toggle('on', on);
      }
      if (!reduceMotion) requestAnimationFrame(frame);
    };

    // pause drawing while the hero is off-screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => { heroVisible = en.isIntersecting; }).observe(hero);
    }

    const lightning = () => {
      if (heroVisible && flash.animate) {
        flash.animate(
          [{ opacity: 0 }, { opacity: 0.9, offset: 0.05 }, { opacity: 0.1, offset: 0.15 }, { opacity: 0.7, offset: 0.22 }, { opacity: 0 }],
          { duration: 900, easing: 'ease-out' }
        );
      }
      setTimeout(lightning, 6000 + Math.random() * 9000);
    };

    setStageH(); size(); readScroll();
    window.addEventListener('scroll', readScroll, { passive: true });
    window.addEventListener('resize', () => { setStageH(); size(); readScroll(); });
    requestAnimationFrame(frame);
    if (!reduceMotion) setTimeout(lightning, 2500);
  }

  /* Card tilt + cursor glow */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.tilt').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const yy = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', x * 100 + '%');
        card.style.setProperty('--my', yy * 100 + '%');
        card.style.transform = `perspective(900px) rotateX(${(0.5 - yy) * 8}deg) rotateY(${(x - 0.5) * 10}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* Water ripple on buttons */
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => {
      if (reduceMotion) return;
      const r = btn.getBoundingClientRect();
      const s = Math.max(r.width, r.height);
      const rip = document.createElement('span');
      rip.className = 'ripple';
      rip.style.width = rip.style.height = s + 'px';
      rip.style.left = e.clientX - r.left - s / 2 + 'px';
      rip.style.top = e.clientY - r.top - s / 2 + 'px';
      btn.appendChild(rip);
      setTimeout(() => rip.remove(), 700);
    });
  });

  /* ---------------------------------------------------------------
     Quote form
     - With a Web3Forms access key: sends the enquiry straight to the
       business inbox (free, no server needed). Get a key at
       https://web3forms.com using the email that should receive quotes.
     - Without a key: falls back to opening the visitor's email app.
     --------------------------------------------------------------- */
  const WEB3FORMS_KEY = ''; // paste access key here, e.g. 'a1b2c3d4-...'
  const BUSINESS_EMAIL = 'info@chosenplumbing.com';

  const form = document.getElementById('quote-form');
  const note = document.getElementById('form-note');
  if (form) {
    if (WEB3FORMS_KEY) note.textContent = 'We usually reply the same day.';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = form.elements.name;
      const phone = form.elements.phone;
      let ok = true;
      [name, phone].forEach((f) => {
        const bad = !f.value.trim();
        f.classList.toggle('invalid', bad);
        if (bad) ok = false;
      });
      if (!ok) {
        note.textContent = 'Please add your name and phone number.';
        note.classList.remove('ok');
        return;
      }

      const data = {
        name: name.value.trim(),
        phone: phone.value.trim(),
        suburb: form.elements.suburb.value.trim() || '-',
        service: [...form.querySelectorAll('input[name=service]:checked')].map((c) => c.value).join(', ') || 'Not specified',
        message: form.elements.message.value.trim() || '-'
      };
      const subject = `Quote request – ${data.name}`;

      if (WEB3FORMS_KEY) {
        const btn = form.querySelector('button[type=submit]');
        btn.disabled = true;
        note.classList.remove('ok');
        note.textContent = 'Sending…';
        try {
          const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ access_key: WEB3FORMS_KEY, subject, from_name: 'Chosen Plumbing website', ...data })
          });
          const out = await res.json();
          if (!out.success) throw new Error(out.message);
          form.reset();
          note.textContent = 'Thanks! Your request is in — we’ll be in touch shortly.';
          note.classList.add('ok');
        } catch (err) {
          note.textContent = 'Sorry, that didn’t send. Please call 0433 953 915.';
        } finally {
          btn.disabled = false;
        }
        return;
      }

      const body = [
        `Name: ${data.name}`, `Phone: ${data.phone}`, `Suburb: ${data.suburb}`, `Service: ${data.service}`, '', data.message
      ].join('\n');
      window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      note.textContent = 'Your email app should open — just hit send. Nothing happened? Call 0433 953 915.';
      note.classList.add('ok');
    });
  }
})();
