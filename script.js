/* =========================================
   WEDDING TEMPLATE — DION & AFNI
   JavaScript Interactions
   ========================================= */

'use strict';

// ── LOADER ──────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
  }, 1600);
});

// ── NAVBAR SCROLL BEHAVIOUR ──────────────────────
(function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const toggle  = document.getElementById('navToggle');
  const links   = document.getElementById('navLinks');
  if (!navbar) return;

  // Scroll class
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Helper: close the menu
  const closeMenu = () => {
    links.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  // Toggle open/close on hamburger click
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on nav-link click
    links.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close when tapping the overlay background
    links.addEventListener('click', (e) => {
      if (e.target === links) closeMenu();
    });
  }
})();

// ── SMOOTH SCROLL OFFSET (fixed navbar) ──────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ── COUNTDOWN TIMER ──────────────────────────────
(function initCountdown() {
  // Wedding date: 11 November 2026 08:00:00 WITA (UTC+8)
  const weddingDate = new Date('2026-11-11T08:00:00+08:00');

  const els = {
    days:    document.getElementById('cd-days'),
    hours:   document.getElementById('cd-hours'),
    minutes: document.getElementById('cd-minutes'),
    seconds: document.getElementById('cd-seconds'),
  };

  function pad(n) { return String(n).padStart(2, '0'); }

  function animateNum(el, newVal) {
    if (el.textContent === newVal) return;
    el.style.transform = 'translateY(-8px)';
    el.style.opacity   = '0';
    setTimeout(() => {
      el.textContent  = newVal;
      el.style.transform = 'translateY(8px)';
      setTimeout(() => {
        el.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        el.style.transform = 'translateY(0)';
        el.style.opacity   = '1';
      }, 20);
    }, 150);
  }

  function tick() {
    const now  = Date.now();
    const diff = weddingDate.getTime() - now;

    if (diff <= 0) {
      Object.values(els).forEach(el => { if (el) el.textContent = '00'; });
      return;
    }

    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000)  / 60000);
    const seconds = Math.floor((diff % 60000)    / 1000);

    if (els.days)    animateNum(els.days,    pad(days));
    if (els.hours)   animateNum(els.hours,   pad(hours));
    if (els.minutes) animateNum(els.minutes, pad(minutes));
    if (els.seconds) animateNum(els.seconds, pad(seconds));
  }

  // Make countdown nums have CSS transition styles
  Object.values(els).forEach(el => {
    if (el) {
      el.style.display    = 'block';
      el.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    }
  });

  tick();
  setInterval(tick, 1000);
})();

// ── SCROLL REVEAL ─────────────────────────────────
(function initReveal() {
  const targets = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach(el => observer.observe(el));
})();

// ── RSVP FORM ─────────────────────────────────────
(function initRsvp() {
  const form     = document.getElementById('rsvpForm');
  const wishList = document.getElementById('wishList');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = document.getElementById('rsvp-name').value.trim();
    const phone   = document.getElementById('rsvp-phone').value.trim();
    const attend  = document.getElementById('rsvp-attend').value;
    const message = document.getElementById('rsvp-message').value.trim();

    // Basic validation
    if (!name || !phone || !attend) {
      showToast('Mohon lengkapi semua field wajib.', 'error');
      return;
    }
    if (!/^08\d{8,11}$/.test(phone.replace(/\s/g, ''))) {
      showToast('Nomor WhatsApp tidak valid.', 'error');
      return;
    }

    // Add wish card if message exists
    if (message && wishList) {
      const card = document.createElement('div');
      card.className = 'wish-card';
      card.innerHTML = `
        <p class="wish-name">${escapeHtml(name)}</p>
        <p class="wish-text">${escapeHtml(message)}</p>
      `;
      wishList.prepend(card);
    }

    const attendText = {
      'hadir':      'akan hadir',
      'hadir-plus': 'hadir dengan tamu',
      'tidak':      'tidak dapat hadir'
    }[attend] || '';

    showToast(`Terima kasih, ${name}! Anda ${attendText}. 💌`, 'success');
    form.reset();
  });

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showToast(msg, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = msg;

    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%) translateY(20px)',
      background: type === 'success' ? '#8b7355' : '#c0392b',
      color: '#fff',
      padding: '1rem 2rem',
      borderRadius: '999px',
      fontSize: '0.9rem',
      fontFamily: 'Jost, sans-serif',
      fontWeight: '300',
      letterSpacing: '0.05em',
      zIndex: '9999',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      opacity: '0',
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      maxWidth: '90vw',
      textAlign: 'center',
    });

    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }
})();

// ── GALLERY LIGHTBOX (simple) ─────────────────────
(function initLightbox() {
  const items = document.querySelectorAll('.gallery-item');
  if (!items.length) return;

  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0',
    background: 'rgba(30,24,18,0.95)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: '9998', opacity: '0',
    transition: 'opacity 0.4s ease',
    cursor: 'zoom-out',
  });

  const lightImg = document.createElement('img');
  Object.assign(lightImg.style, {
    maxWidth: '90vw', maxHeight: '90vh',
    objectFit: 'contain',
    borderRadius: '4px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    transform: 'scale(0.9)',
    transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
  });

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  Object.assign(closeBtn.style, {
    position: 'absolute', top: '1.5rem', right: '2rem',
    background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
    fontSize: '2.5rem', cursor: 'pointer', lineHeight: '1',
    fontFamily: 'serif',
  });

  overlay.appendChild(lightImg);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);

  const open = (src, alt) => {
    lightImg.src = src;
    lightImg.alt = alt;
    overlay.style.display = 'flex';
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      lightImg.style.transform = 'scale(1)';
    });
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    overlay.style.opacity = '0';
    lightImg.style.transform = 'scale(0.9)';
    setTimeout(() => {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }, 400);
  };

  items.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) open(img.src.replace('w=600', 'w=1200'), img.alt);
    });
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target === closeBtn) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
})();

// ── ACTIVE NAV LINK ON SCROLL ─────────────────────
(function initActiveLinks() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  if (!sections.length || !links.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => observer.observe(s));
})();

// ── PARALLAX EFFECT ───────────────────────────────
(function initParallax() {
  const heroImg = document.querySelector('.hero-img');
  const storyImg = document.querySelector('.story-bg-img img');
  
  if (!heroImg && !storyImg) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    // Request animation frame for performance
    requestAnimationFrame(() => {
      if (heroImg) {
        // Move hero image down slightly as we scroll down (speed 0.4)
        heroImg.style.transform = `scale(1.12) translateY(${scrollY * 0.4}px)`;
      }
      
      if (storyImg) {
        const storySection = document.querySelector('.story-section');
        if (storySection) {
          const rect = storySection.getBoundingClientRect();
          // Only animate if story section is in view
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            // Calculate relative scroll within the section
            const relativeScroll = window.innerHeight - rect.top;
            storyImg.style.transform = `translateY(${relativeScroll * 0.15}px)`;
          }
        }
      }
    });
  }, { passive: true });
})();
