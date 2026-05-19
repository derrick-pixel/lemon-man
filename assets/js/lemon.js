/* ============================================================
   LEMON MAN — interaction layer. Vanilla, no deps.
   ============================================================ */
(function () {
  'use strict';

  /* ---- Nav: stuck state + mobile menu ------------------------ */
  var nav = document.getElementById('nav');
  var burger = document.querySelector('.nav__burger');
  var menu = document.querySelector('.mobile-menu');

  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-stuck', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (burger && menu && nav) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      nav.classList.toggle('menu-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        nav.classList.remove('menu-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- Scroll reveal ----------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Lemon Score band → arc colour ------------------------- */
  // High score = sour = bad. Low score = peach = clean.
  function bandColour(score) {
    if (score < 250) return getCSS('--peach');
    if (score < 550) return getCSS('--lemon-br');
    if (score < 760) return getCSS('--lemon');
    return getCSS('--sour');
  }
  function getCSS(v) {
    return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#e3a400';
  }

  /* ---- Lemon Score gauge: arc draw + count-up ---------------- */
  document.querySelectorAll('[data-gauge]').forEach(function (g) {
    var target = parseInt(g.getAttribute('data-gauge'), 10) || 0;
    var max = 1000;
    var arc = g.querySelector('.gauge__arc');
    var num = g.querySelector('[data-gauge-num]');
    var len = arc ? arc.getTotalLength() : 0;
    if (arc) {
      arc.style.strokeDasharray = len;
      arc.style.strokeDashoffset = len;
      arc.style.stroke = bandColour(target);
    }

    var fired = false;
    var run = function () {
      if (fired) return; fired = true;
      if (arc) {
        requestAnimationFrame(function () {
          arc.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.2,.7,.2,1)';
          arc.style.strokeDashoffset = len - (len * (target / max));
        });
      }
      if (num) {
        var start = performance.now(), dur = 1500;
        var tick = function (now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          num.textContent = Math.round(target * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    };

    if ('IntersectionObserver' in window) {
      var go = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { run(); go.disconnect(); } });
      }, { threshold: 0.4 });
      go.observe(g);
    } else { run(); }
  });

  /* ---- Score-band meter pin ---------------------------------- */
  document.querySelectorAll('[data-meter]').forEach(function (m) {
    var score = parseInt(m.getAttribute('data-meter'), 10) || 0;
    var pin = m.querySelector('.meter__pin');
    if (!pin) return;
    var place = function () { pin.style.left = Math.min(score / 1000 * 100, 100) + '%'; };
    if ('IntersectionObserver' in window) {
      var ob = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            pin.style.transition = 'left 1.5s cubic-bezier(.2,.7,.2,1)';
            place(); ob.disconnect();
          }
        });
      }, { threshold: 0.4 });
      pin.style.left = '0%';
      ob.observe(m);
    } else { place(); }
  });

  /* ---- Early-access form (front-end stub) -------------------- */
  document.querySelectorAll('.access-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.parentElement.querySelector('.form-msg');
      var input = form.querySelector('input');
      var val = (input && input.value || '').trim();
      var ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val);
      if (!msg) return;
      if (ok) {
        msg.style.color = 'var(--peach-deep, #c45f3a)';
        msg.textContent = '🍋 Squeezed in. We will be in touch about the pilot.';
        form.reset();
      } else {
        msg.style.color = 'var(--flag)';
        msg.textContent = 'That email looks a little sour. Try again.';
      }
    });
  });

  /* ---- Lemon Score calculator -------------------------------- */
  (function () {
    var host = document.getElementById('calc-incidents');
    if (!host) return;

    // base points — identical to the incident table on this page
    var INCIDENTS = [
      { id: 'late',    name: 'Chronically late',                  base: 45  },
      { id: 'q4mc',    name: 'Q4 medical-leave clearing',         base: 90  },
      { id: 'bail',    name: 'Last-minute bail (under 24h)',       base: 130 },
      { id: 'insub',   name: 'Insubordination + disciplinary',    base: 150 },
      { id: 'mc',      name: 'Suspected malingering MC',           base: 160 },
      { id: 'noshow',  name: 'No-show (full shift)',               base: 200 },
      { id: 'abandon', name: 'Contract abandonment',               base: 260 },
      { id: 'cred',    name: 'Credential falsification',           base: 380 },
      { id: 'data',    name: 'Data-secrecy breach (with finding)', base: 420 },
      { id: 'theft',   name: 'Theft (with police report)',         base: 500 }
    ];
    var RIPEN = [
      { id: 'testi', name: 'Verified good testimonial',  per: 70,  max: 2 },
      { id: 'wsq',   name: 'WSQ course completed',       per: 90,  max: 2 },
      { id: 'clean', name: '12+ clean months on record', per: 200, max: 1 }
    ];
    var MAX_N = 3;

    // corroboration multiplier: 0.25n^2 + 0.75n  ->  m1=1, m2=2.5, m3=4.5
    function corr(n) { return n <= 0 ? 0 : 0.25 * n * n + 0.75 * n; }
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    function band(s) {
      if (s <= 250) return ['Peach — safe hire', 'is-peach'];
      if (s <= 550) return ['A bit zesty', 'is-zest'];
      if (s <= 760) return ['Sour — handle with care', 'is-sour'];
      return ['Pucker up', 'is-sour'];
    }
    function mk(tag, cls, text) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text != null) e.textContent = text;
      return e;
    }

    var state = {};
    var syncers = [];
    INCIDENTS.concat(RIPEN).forEach(function (x) { state[x.id] = 0; });

    function makeRow(item, isRipen) {
      var max = isRipen ? item.max : MAX_N;
      var el = mk('div', 'cinc' + (isRipen ? ' cinc--ripen' : ''));
      var info = mk('div');
      info.appendChild(mk('div', 'cinc__name', item.name));
      info.appendChild(mk('div', 'cinc__base', isRipen ? ('−' + item.per + ' each') : ('base ' + item.base)));
      var ctl = mk('div', 'cinc__ctl');
      var dec = mk('button', 'cstep', '−');
      var nEl = mk('span', 'cinc__n', '0');
      var inc = mk('button', 'cstep', '+');
      dec.type = inc.type = 'button';
      dec.setAttribute('aria-label', 'Decrease ' + item.name);
      inc.setAttribute('aria-label', 'Increase ' + item.name);
      ctl.appendChild(dec); ctl.appendChild(nEl); ctl.appendChild(inc);
      var outEl = mk('span', 'cinc__out', '0');
      el.appendChild(info); el.appendChild(ctl); el.appendChild(outEl);

      function sync() {
        var n = state[item.id];
        nEl.textContent = n;
        el.classList.toggle('on', n > 0);
        dec.disabled = n <= 0;
        inc.disabled = n >= max;
        outEl.textContent = isRipen
          ? (n > 0 ? '−' + (item.per * n) : '0')
          : String(Math.round(item.base * corr(n)));
      }
      dec.addEventListener('click', function () { state[item.id] = clamp(state[item.id] - 1, 0, max); sync(); recompute(); });
      inc.addEventListener('click', function () { state[item.id] = clamp(state[item.id] + 1, 0, max); sync(); recompute(); });
      syncers.push(sync);
      sync();
      return el;
    }

    INCIDENTS.forEach(function (i) { host.appendChild(makeRow(i, false)); });
    var ripenHost = document.getElementById('calc-ripen');
    if (ripenHost) RIPEN.forEach(function (r) { ripenHost.appendChild(makeRow(r, true)); });

    var elScore   = document.getElementById('calc-score');
    var elVerdict = document.getElementById('calc-verdict');
    var elPin     = document.getElementById('calc-pin');
    var elRaw     = document.getElementById('calc-raw');
    var elRipTot  = document.getElementById('calc-ripen-total');
    var elFinal   = document.getElementById('calc-final');

    function recompute() {
      var raw = 0;
      INCIDENTS.forEach(function (i) { raw += i.base * corr(state[i.id]); });
      raw = Math.round(raw);
      var ripen = 0;
      RIPEN.forEach(function (r) { ripen += r.per * state[r.id]; });
      var score = clamp(raw - ripen, 0, 1000);
      var b = band(score);
      if (elScore)   elScore.textContent = score;
      if (elVerdict) { elVerdict.textContent = b[0]; elVerdict.className = 'calc__verdict ' + b[1]; }
      if (elPin)     elPin.style.left = (score / 1000 * 100) + '%';
      if (elRaw)     elRaw.textContent = raw;
      if (elRipTot)  elRipTot.textContent = '−' + ripen;
      if (elFinal)   elFinal.textContent = score;
    }

    var reset = document.getElementById('calc-reset');
    if (reset) reset.addEventListener('click', function () {
      Object.keys(state).forEach(function (k) { state[k] = 0; });
      syncers.forEach(function (fn) { fn(); });
      recompute();
    });

    recompute();
  })();

  /* ---- Year stamp -------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
