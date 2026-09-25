/* ==========================================================================
   Bandar Deterjen — Landing Page Interactions
   IIFE + guard, no globals, no inline handlers.
   ========================================================================== */

(function () {
  'use strict';

  var PAGE_SELECTOR = '.bandar-deterjen-page';
  var WA_NUMBER = '6285773009666';

  function init() {
    var page = document.querySelector(PAGE_SELECTOR);
    if (!page) return;

    initTestimonial(page);
    initForm(page);
  }

  /* ---------- Testimonial slider ---------- */
  function initTestimonial(root) {
    var slider = root.querySelector('#bd-testi');
    if (!slider) return;

    var slides = Array.prototype.slice.call(
      slider.querySelectorAll('.bd-testi__slide')
    );
    var dots = Array.prototype.slice.call(
      slider.querySelectorAll('#bd-testi-dots li')
    );
    var prevBtn = slider.querySelector('#bd-testi-prev');
    var nextBtn = slider.querySelector('#bd-testi-next');

    if (!slides.length) return;

    var current = 0;
    var timer = null;
    var AUTOPLAY_MS = 5500;
    var touchStartX = 0;
    var touchEndX = 0;

    function show(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;

      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
      current = index;
    }

    function next() { show(current + 1); }
    function prev() { show(current - 1); }

    function startAutoplay() {
      stopAutoplay();
      timer = window.setInterval(next, AUTOPLAY_MS);
    }
    function stopAutoplay() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }

    function goTo(index) {
      show(index);
      startAutoplay();
    }

    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });
    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { goTo(i); });
      dot.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goTo(i);
        }
      });
    });

    // Pause autoplay saat hover/focus
    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);
    slider.addEventListener('focusin', stopAutoplay);
    slider.addEventListener('focusout', startAutoplay);

    // Swipe support
    slider.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    slider.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].clientX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) < 40) return;
      if (diff > 0) goTo(current + 1);
      else goTo(current - 1);
    }, { passive: true });

    // Keyboard nav
    slider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
    });

    show(0);
    startAutoplay();
  }

  /* ---------- WhatsApp Form ---------- */
  function initForm(root) {
    var form = root.querySelector('#bd-form');
    if (!form) return;

    var nameEl = form.querySelector('#bd-name');
    var emailEl = form.querySelector('#bd-email');
    var cityEl = form.querySelector('#bd-city');
    var produkEl = form.querySelector('#bd-produk');
    var noteEl = form.querySelector('#bd-form-note');

    function setNote(msg, type) {
      if (!noteEl) return;
      noteEl.textContent = msg || '';
      noteEl.classList.remove('is-error', 'is-success');
      if (type) noteEl.classList.add('is-' + type);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = (nameEl && nameEl.value || '').trim();
      var email = (emailEl && emailEl.value || '').trim();
      var city = (cityEl && cityEl.value || '').trim();
      var produk = (produkEl && produkEl.value || '').trim();

      if (!name) {
        setNote('Mohon isi nama terlebih dahulu.', 'error');
        if (nameEl) nameEl.focus();
        return;
      }

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setNote('Format email tidak valid.', 'error');
        if (emailEl) emailEl.focus();
        return;
      }

      var lines = [
        'Halo Bandar Deterjen,',
        '',
        'Nama: ' + name,
        'Email: ' + (email || '-'),
        'Kota: ' + (city || '-'),
        'Kebutuhan: ' + (produk || '-'),
        '',
        'Mohon info lengkap & harga grosirnya. Terima kasih.'
      ];

      var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));

      setNote('Membuka WhatsApp...', 'success');

      var win = window.open(url, '_blank', 'noopener');
      if (win) win.focus();
      else window.location.href = url;

      form.reset();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
