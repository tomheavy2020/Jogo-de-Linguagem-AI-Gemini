/* ----- Initial Setup ----- */
document.documentElement.classList.add('js-enabled');

/* ----- Navbar scroll ----- */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
}

/* ----- Fade-up on scroll ----- */
const fadeEls = document.querySelectorAll('.fade-up');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.01, rootMargin: '50px' });
  fadeEls.forEach(el => observer.observe(el));
} else {
  fadeEls.forEach(el => el.classList.add('visible'));
}

// Safety fallback for fade-up (forces visibility after 3s if observer fails)
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.fade-up:not(.visible)').forEach(el => el.classList.add('visible'));
  }, 3000);
});

/* ----- Favorite toggle ----- */
document.querySelectorAll('.prop-fav').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.textContent = btn.textContent === '♡' ? '♥' : '♡';
    btn.style.color = btn.textContent === '♥' ? '#b8924a' : '';
  });
});

/* ----- Infinite Carousel Logic ----- */
const setupCarousels = () => {
  const tracks = document.querySelectorAll('.carousel-mini-track');

  tracks.forEach(track => {
    const items = Array.from(track.children);
    if (items.length === 0) return;

    // Clone items for infinite loop
    items.forEach(item => {
      const clone = item.cloneNode(true);
      track.appendChild(clone);
    });

    const updateAnimation = () => {
      const isNested = track.closest('.nested-carousel');
      const container = track.closest('.carousel-mini');
      if (!container) return;

      // Force a reflow to get correct widths
      let trackWidth = 0;
      const originalItems = Array.from(track.children).slice(0, items.length);

      originalItems.forEach(item => {
        trackWidth += item.offsetWidth;
      });

      // Fallback if offsetWidth is 0 (e.g. hidden or not rendered yet)
      if (trackWidth === 0) {
        const containerWidth = container.offsetWidth || window.innerWidth;
        if (isNested) {
          trackWidth = items.length * containerWidth;
        } else {
          const isMobile = window.innerWidth <= 768;
          if (isMobile) {
            trackWidth = items.length * (containerWidth * 0.85);
          } else {
            const hasFeatured = track.querySelector('.featured');
            trackWidth = (items.length - (hasFeatured ? 1 : 0)) * 400 + (hasFeatured ? 600 : 0);
          }
        }
      }

      // Use data-speed attribute if present, otherwise default to context-based speed
      const speed = container.dataset.speed || (isNested ? 120 : 80);
      const duration = trackWidth / speed;

      if (duration > 0) {
        track.style.animation = 'none';
        track.offsetHeight; // trigger reflow
        track.style.animation = `miniSlide ${duration}s linear infinite`;
      }
    };

    // Initial setup
    setTimeout(updateAnimation, 500);
    window.addEventListener('load', updateAnimation);

    // Watch for image loads
    track.querySelectorAll('img').forEach(img => {
      if (img.complete) {
        updateAnimation();
      } else {
        img.addEventListener('load', updateAnimation);
      }
    });

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => {
        updateAnimation();
      });
      ro.observe(track);
    } else {
      window.addEventListener('resize', updateAnimation);
    }
  });
};

// Initialize carousels
setupCarousels();
