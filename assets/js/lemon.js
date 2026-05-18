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

  /* ---- Score gauge: arc draw + count-up ---------------------- */
  document.querySelectorAll('[data-gauge]').forEach(function (g) {
    var target = parseInt(g.getAttribute('data-gauge'), 10) || 0;
    var max = 1000;
    var arc = g.querySelector('.gauge__arc');
    var num = g.querySelector('[data-gauge-num]');
    var len = arc ? arc.getTotalLength() : 0;
    if (arc) { arc.style.strokeDasharray = len; arc.style.strokeDashoffset = len; }

    var fired = false;
    var run = function () {
      if (fired) return; fired = true;
      if (arc) {
        // animate dashoffset to reflect score fraction of a 270deg arc
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
        msg.style.color = 'var(--rind)';
        msg.textContent = '✓ Logged. The team will be in touch about the pilot cohort.';
        form.reset();
      } else {
        msg.style.color = 'var(--flag)';
        msg.textContent = 'Enter a valid work email address.';
      }
    });
  });

  /* ---- Year stamp -------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
