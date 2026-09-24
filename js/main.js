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
    if (fab) fab.classList.toggle('show', s > window.innerHeight * 0.6);
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

  /* Rising bubbles in the hero */
  const bubbles = document.querySelector('.bubbles');
  if (bubbles && !reduceMotion) {
    const count = window.innerWidth < 600 ? 10 : 20;
    for (let i = 0; i < count; i++) {
      const b = document.createElement('span');
      b.className = 'bubble';
      const size = 4 + Math.random() * 14;
      b.style.width = b.style.height = size + 'px';
      b.style.left = (40 + Math.random() * 58) + '%';
      b.style.setProperty('--sway', (Math.random() * 60 - 30) + 'px');
      b.style.animationDuration = (9 + Math.random() * 10) + 's';
      b.style.animationDelay = (-Math.random() * 15) + 's';
      bubbles.appendChild(b);
    }
  }

  /* Hero video: fall back gracefully if it can't load */
  const vid = document.querySelector('.hero-video');
  if (vid) {
    vid.addEventListener('error', () => vid.remove());
    if (reduceMotion) vid.pause();
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
