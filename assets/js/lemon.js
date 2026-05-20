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
      var card = g.querySelector('.gauge__card');
      if (num) {
        var start = performance.now(), dur = 1500;
        var tick = function (now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          num.textContent = Math.round(target * eased);
          if (p < 1) { requestAnimationFrame(tick); }
          else if (card) { card.classList.add('is-popped'); }
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

  /* ---- Confetti burst ---------------------------------------- */
  function confettiBurst(origin) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var host = origin.closest('section') || document.body;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    var r = origin.getBoundingClientRect(), h = host.getBoundingClientRect();
    var cx = r.left - h.left + r.width / 2, cy = r.top - h.top + r.height / 2;
    var colours = ['#e3a400', '#ffd23c', '#e6855c', '#f4a983', '#fffdf2'];
    for (var i = 0; i < 22; i++) {
      (function (idx) {
        var p = document.createElement('span'), sz = 7 + Math.random() * 7;
        p.style.cssText = 'position:absolute;left:' + cx + 'px;top:' + cy + 'px;width:' + sz +
          'px;height:' + sz + 'px;background:' + colours[idx % 5] + ';border:1.5px solid #211d12;border-radius:' +
          (Math.random() < 0.5 ? '50%' : '2px') + ';pointer-events:none;z-index:60;';
        host.appendChild(p);
        var ang = Math.random() * 6.283, dist = 70 + Math.random() * 175;
        var a = p.animate(
          [{ transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
           { transform: 'translate(' + (Math.cos(ang) * dist).toFixed(1) + 'px,' +
             (Math.sin(ang) * dist + 220).toFixed(1) + 'px) rotate(' +
             (Math.random() * 800 - 400).toFixed(0) + 'deg)', opacity: 0 }],
          { duration: 1100 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.3,1)' });
        a.onfinish = function () { p.remove(); };
      })(i);
    }
  }

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
        confettiBurst(form);
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
      { id: 'testi',  name: 'Verified good testimonial',     per: 70,  max: 2 },
      { id: 'wsq',    name: 'WSQ course completed',          per: 90,  max: 2 },
      { id: 'volun',  name: 'Certified charity volunteering', per: 60,  max: 3, unit: '20h at an IPC charity' },
      { id: 'donate', name: 'Tax-deductible charity donation',per: 50,  max: 3, unit: 'S$500 to an IPC charity' },
      { id: 'clean',  name: '12+ clean months on record',    per: 200, max: 1 }
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
      info.appendChild(mk('div', 'cinc__base', isRipen
        ? ('−' + item.per + (item.unit ? ' per ' + item.unit : ' each'))
        : ('base ' + item.base)));
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

    var face    = document.getElementById('calc-face');
    var cfBody  = face && face.querySelector('.cf-body');
    var cfMouth = face && face.querySelector('.cf-mouth');
    var FACES = {
      peach:  { fill: '#e6855c', mouth: 'M12.5 20 Q16 23.6 19.5 20' },
      zest:   { fill: '#ffd23c', mouth: 'M13 20.9 Q16 22.5 19 20.9' },
      sour:   { fill: '#e3a400', mouth: 'M12.5 22.4 Q16 18.8 19.5 22.4' },
      pucker: { fill: '#a86a00', mouth: 'M12.6 21.2 Q14.3 19.3 16 21.2 Q17.7 23.1 19.4 21.2' }
    };
    function faceKey(s) { return s <= 250 ? 'peach' : s <= 550 ? 'zest' : s <= 760 ? 'sour' : 'pucker'; }

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
      if (cfBody && cfMouth) {
        var f = FACES[faceKey(score)];
        cfBody.setAttribute('fill', f.fill);
        cfMouth.setAttribute('d', f.mouth);
      }
    }

    var reset = document.getElementById('calc-reset');
    if (reset) reset.addEventListener('click', function () {
      Object.keys(state).forEach(function (k) { state[k] = 0; });
      syncers.forEach(function (fn) { fn(); });
      recompute();
    });

    recompute();
  })();

  /* ---- Comprehensive simulator (50 incidents) ---------------- */
  (function () {
    var host = document.getElementById('sim-incidents');
    if (!host) return;

    var SIM_INCIDENTS = [
      // Attendance & reliability
      { cat: 'Attendance & reliability', id: 'late',       name: 'Chronically late (per logged instance)',  base: 45 },
      { cat: 'Attendance & reliability', id: 'leaveear',   name: 'Leaving early without notice',             base: 60 },
      { cat: 'Attendance & reliability', id: 'tardpat',    name: 'Repeated tardiness (3+ in a month)',       base: 90 },
      { cat: 'Attendance & reliability', id: 'unschbreak', name: 'Excessive unscheduled breaks (pattern)',   base: 60 },
      { cat: 'Attendance & reliability', id: 'bail',       name: 'Last-minute bail (under 24h)',             base: 130 },
      { cat: 'Attendance & reliability', id: 'q4mc',       name: 'Q4 medical-leave clearing',                base: 90 },
      { cat: 'Attendance & reliability', id: 'mc',         name: 'Suspected malingering MC',                 base: 160 },
      { cat: 'Attendance & reliability', id: 'sleepsh',    name: 'Sleeping on shift (with finding)',         base: 180 },
      { cat: 'Attendance & reliability', id: 'noshow',     name: 'No-show (full shift)',                     base: 200 },
      { cat: 'Attendance & reliability', id: 'ncns',       name: 'No-call no-show',                          base: 220 },
      { cat: 'Attendance & reliability', id: 'walkoff',    name: 'Walked off post mid-shift',                base: 280 },
      { cat: 'Attendance & reliability', id: 'abandon',    name: 'Contract abandonment',                     base: 260 },

      // Conduct on-site
      { cat: 'Conduct on-site',  id: 'unprof',    name: 'Unprofessional appearance (repeated)',        base: 50 },
      { cat: 'Conduct on-site',  id: 'phone',     name: 'Excessive phone use on duty (disciplined)',   base: 60 },
      { cat: 'Conduct on-site',  id: 'insub',     name: 'Insubordination + disciplinary action',       base: 150 },
      { cat: 'Conduct on-site',  id: 'refuseord', name: 'Refusal of lawful instruction',               base: 180 },
      { cat: 'Conduct on-site',  id: 'clientcom', name: 'Client complaint upheld',                     base: 200 },
      { cat: 'Conduct on-site',  id: 'verbalab',  name: 'Verbal abuse incident (logged)',              base: 260 },
      { cat: 'Conduct on-site',  id: 'sleepduty', name: 'Sleeping on duty (security / medical role)',  base: 260 },
      { cat: 'Conduct on-site',  id: 'reftest',   name: 'Refused drug / alcohol test (where required)',base: 280 },
      { cat: 'Conduct on-site',  id: 'impaired',  name: 'Substance impairment on duty (with finding)', base: 320 },
      { cat: 'Conduct on-site',  id: 'harass',    name: 'Workplace harassment (verified finding)',     base: 350 },

      // Credentials & honesty
      { cat: 'Credentials & honesty', id: 'avail',    name: 'False availability (deliberate double-booking)',base: 120 },
      { cat: 'Credentials & honesty', id: 'misrep',   name: 'Misrepresented experience',                   base: 220 },
      { cat: 'Credentials & honesty', id: 'fakeref',  name: 'Fake or fabricated reference',                base: 260 },
      { cat: 'Credentials & honesty', id: 'falsemc',  name: 'False MC submission (verified)',              base: 280 },
      { cat: 'Credentials & honesty', id: 'cred',     name: 'Credential falsification',                    base: 380 },
      { cat: 'Credentials & honesty', id: 'identity', name: 'Identity misuse',                              base: 400 },

      // Data & security
      { cat: 'Data & security', id: 'confidv',    name: 'Verbal confidentiality breach (with witnesses)',  base: 160 },
      { cat: 'Data & security', id: 'photos',     name: 'Unauthorised photos / recordings of client site', base: 200 },
      { cat: 'Data & security', id: 'rosterleak', name: 'Shared roster / schedule with a competitor',       base: 220 },
      { cat: 'Data & security', id: 'clientlist', name: 'Took client / contact list to next employer',     base: 320 },
      { cat: 'Data & security', id: 'data',       name: 'Data-secrecy breach (with finding)',              base: 420 },

      // Theft & financial
      { cat: 'Theft & financial', id: 'subst',     name: 'Unauthorised substitution (sent another worker)', base: 240 },
      { cat: 'Theft & financial', id: 'expense',   name: 'Expense / claim fraud',                            base: 260 },
      { cat: 'Theft & financial', id: 'pilfer',    name: 'Pilferage (with finding, no police)',              base: 280 },
      { cat: 'Theft & financial', id: 'timefraud', name: 'Time-card fraud (clocked but not present)',        base: 300 },
      { cat: 'Theft & financial', id: 'theft',     name: 'Theft (with police report)',                       base: 500 },

      // Safety
      { cat: 'Safety', id: 'ppe',      name: 'PPE non-compliance (repeated, disciplined)',     base: 80 },
      { cat: 'Safety', id: 'reftrain', name: 'Refused mandatory safety training',              base: 140 },
      { cat: 'Safety', id: 'firebr',   name: 'Fire / safety procedure breach (with finding)',  base: 180 },
      { cat: 'Safety', id: 'unsafe',   name: 'Unsafe work practice causing incident',          base: 220 },
      { cat: 'Safety', id: 'injury',   name: 'Caused workplace injury (negligence finding)',   base: 260 },

      // Performance & process
      { cat: 'Performance & process', id: 'probfail',   name: 'Failed mandatory probation review',           base: 100 },
      { cat: 'Performance & process', id: 'compfail',   name: 'Failed mandatory competency test',            base: 120 },
      { cat: 'Performance & process', id: 'refpip',     name: 'Refused performance improvement plan',         base: 90 },
      { cat: 'Performance & process', id: 'quality',    name: 'Repeated quality failures (3+ documented)',    base: 120 },
      { cat: 'Performance & process', id: 'norehire',   name: 'Client refusal-to-rehire (formal note)',       base: 160 },
      { cat: 'Performance & process', id: 'negligence', name: 'Gross negligence with quantifiable damage',    base: 280 },
      { cat: 'Performance & process', id: 'momcomp',    name: 'MOM complaint substantiated against worker',   base: 320 }
    ];
    var SIM_RIPEN = [
      { id: 'testi',  name: 'Verified good testimonial',      per: 70,  max: 2 },
      { id: 'wsq',    name: 'WSQ course completed',           per: 90,  max: 2 },
      { id: 'volun',  name: 'Certified charity volunteering', per: 60,  max: 3, unit: '20h at an IPC charity' },
      { id: 'donate', name: 'Tax-deductible charity donation',per: 50,  max: 3, unit: 'S$500 to an IPC charity' },
      { id: 'clean',  name: '12+ clean months on record',     per: 200, max: 1 }
    ];
    var MAX_N = 3;
    function corr(n) { return n <= 0 ? 0 : 0.25 * n * n + 0.75 * n; }
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    function bandStr(s) {
      if (s <= 250) return ['Peach — safe hire', 'is-peach'];
      if (s <= 550) return ['A bit zesty', 'is-zest'];
      if (s <= 760) return ['Sour — handle with care', 'is-sour'];
      return ['Pucker up', 'is-sour'];
    }
    function faceKey(s) { return s <= 250 ? 'peach' : s <= 550 ? 'zest' : s <= 760 ? 'sour' : 'pucker'; }
    var FACES = {
      peach:  { fill: '#e6855c', mouth: 'M12.5 20 Q16 23.6 19.5 20' },
      zest:   { fill: '#ffd23c', mouth: 'M13 20.9 Q16 22.5 19 20.9' },
      sour:   { fill: '#e3a400', mouth: 'M12.5 22.4 Q16 18.8 19.5 22.4' },
      pucker: { fill: '#a86a00', mouth: 'M12.6 21.2 Q14.3 19.3 16 21.2 Q17.7 23.1 19.4 21.2' }
    };
    function mk(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }

    var state = {};
    var syncers = [];
    SIM_INCIDENTS.concat(SIM_RIPEN).forEach(function (x) { state[x.id] = 0; });

    function makeRow(item, isRipen) {
      var max = isRipen ? item.max : MAX_N;
      var el = mk('div', 'cinc' + (isRipen ? ' cinc--ripen' : ''));
      var info = mk('div');
      info.appendChild(mk('div', 'cinc__name', item.name));
      info.appendChild(mk('div', 'cinc__base', isRipen
        ? ('−' + item.per + (item.unit ? ' per ' + item.unit : ' each'))
        : ('base ' + item.base)));
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
      syncers.push(sync); sync();
      return el;
    }

    var seenCat = {};
    SIM_INCIDENTS.forEach(function (item) {
      if (!seenCat[item.cat]) {
        host.appendChild(mk('div', 'cat-head', item.cat));
        seenCat[item.cat] = true;
      }
      host.appendChild(makeRow(item, false));
    });
    var ripenHost = document.getElementById('sim-ripen');
    if (ripenHost) SIM_RIPEN.forEach(function (r) { ripenHost.appendChild(makeRow(r, true)); });

    var elScore   = document.getElementById('sim-score');
    var elVerdict = document.getElementById('sim-verdict');
    var elPin     = document.getElementById('sim-pin');
    var elRaw     = document.getElementById('sim-raw');
    var elRipTot  = document.getElementById('sim-ripen-total');
    var elFinal   = document.getElementById('sim-final');
    var face      = document.getElementById('sim-face');
    var cfBody    = face && face.querySelector('.cf-body');
    var cfMouth   = face && face.querySelector('.cf-mouth');

    function recompute() {
      var raw = 0;
      SIM_INCIDENTS.forEach(function (i) { raw += i.base * corr(state[i.id]); });
      raw = Math.round(raw);
      var ripen = 0;
      SIM_RIPEN.forEach(function (r) { ripen += r.per * state[r.id]; });
      var score = clamp(raw - ripen, 0, 1000);
      var b = bandStr(score);
      if (elScore)   elScore.textContent = score;
      if (elVerdict) { elVerdict.textContent = b[0]; elVerdict.className = 'calc__verdict ' + b[1]; }
      if (elPin)     elPin.style.left = (score / 1000 * 100) + '%';
      if (elRaw)     elRaw.textContent = raw;
      if (elRipTot)  elRipTot.textContent = '−' + ripen;
      if (elFinal)   elFinal.textContent = score;
      if (cfBody && cfMouth) {
        var f = FACES[faceKey(score)];
        cfBody.setAttribute('fill', f.fill);
        cfMouth.setAttribute('d', f.mouth);
      }
    }

    var reset = document.getElementById('sim-reset');
    if (reset) reset.addEventListener('click', function () {
      Object.keys(state).forEach(function (k) { state[k] = 0; });
      syncers.forEach(function (fn) { fn(); });
      recompute();
    });

    recompute();
  })();

  /* ---- Boss Confessions rotator ------------------------------ */
  (function () {
    var row = document.getElementById('confess-row');
    if (!row) return;
    var cards = row.querySelectorAll('.confess-card');
    if (!cards.length) return;

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var FALLBACK = [
      { quote: "Three guys, three MCs, all dated Monday. Always Monday.",                  attrib: "F&B owner · Boon Lay",         trait: "malingering MC" },
      { quote: "He claimed bird's nest as 'medication'. I claimed his bonus.",            attrib: "Bank ops · CBD",               trait: "expense fraud" },
      { quote: "Took the deposit. Took the uniform. Took the next day off forever.",      attrib: "Events staffing · Bugis",      trait: "contract abandonment" }
    ];

    function shuffle(a) {
      a = a.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }

    function render(items) {
      cards.forEach(function (card, i) {
        var d = items[i];
        if (!d) return;
        card.querySelector('.confess-q').textContent = d.quote;
        card.querySelector('.confess-c').textContent = d.attrib;
        card.querySelector('.confess-t').textContent = d.trait;
      });
    }

    function pickThree(pool, exclude) {
      var ex = (exclude || []).map(function (e) { return e.quote; });
      var rest = pool.filter(function (p) { return ex.indexOf(p.quote) === -1; });
      var chosen = shuffle(rest).slice(0, 3);
      while (chosen.length < 3) chosen.push(shuffle(pool)[0]);
      return chosen;
    }

    function start(pool) {
      var current = shuffle(pool).slice(0, 3);
      render(current);
      if (reduced || pool.length <= 3) return;
      var timer = null;
      var cycle = function () {
        cards.forEach(function (c) { c.classList.add('is-swap'); });
        setTimeout(function () {
          current = pickThree(pool, current);
          render(current);
          cards.forEach(function (c) { c.classList.remove('is-swap'); });
        }, 380);
      };
      var section = row.closest('section');
      var run = function () { timer = setInterval(cycle, 6800); };
      var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
      if (section) {
        section.addEventListener('mouseenter', stop);
        section.addEventListener('mouseleave', run);
        section.addEventListener('focusin', stop);
        section.addEventListener('focusout', run);
      }
      run();
    }

    fetch('assets/data/confessions.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { start((d && d.length) ? d : FALLBACK); })
      .catch(function () { start(FALLBACK); });
  })();

  /* ---- Year stamp -------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
