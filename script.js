/* ----- Navbar scroll ----- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

/* ----- Fade-up on scroll ----- */
const fadeEls = document.querySelectorAll('.fade-up');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
fadeEls.forEach(el => observer.observe(el));

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

      // Force a reflow to get correct widths
      let trackWidth = Array.from(track.children).slice(0, items.length).reduce((acc, item) => acc + item.offsetWidth, 0);

      // Fallback if images are not loaded yet (nested cards are usually ~300-400px)
      if (trackWidth === 0 && isNested) {
        trackWidth = items.length * track.parentElement.offsetWidth;
      }

      // Increased speed: 80 for main gallery, 120 for nested carousels to make them more dynamic
      const speed = isNested ? 120 : 80;
      const duration = trackWidth / speed;

      if (duration > 0) {
        track.style.animation = 'none';
        track.offsetHeight; // trigger reflow
        track.style.animation = `miniSlide ${duration}s linear infinite`;
      }
    };

    // Initial setup after a short delay, and again after window load
    setTimeout(updateAnimation, 500);
    window.addEventListener('load', updateAnimation);

    window.addEventListener('resize', updateAnimation);
  });
};

// Initialize carousels
setupCarousels();
