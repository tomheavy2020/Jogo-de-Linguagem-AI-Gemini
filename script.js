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
const setupCarousel = () => {
  const track = document.querySelector('.carousel-mini-track');
  if (!track) return;

  const items = Array.from(track.children);
  if (items.length === 0) return;

  // Clone items for infinite loop
  items.forEach(item => {
    const clone = item.cloneNode(true);
    track.appendChild(clone);
  });

  const updateAnimation = () => {
    // Force a reflow to get correct widths
    const itemWidths = Array.from(track.children).slice(0, items.length).reduce((acc, item) => acc + item.offsetWidth, 0);
    const duration = itemWidths / 50; // 50px per second
    track.style.animation = 'none';
    track.offsetHeight; // trigger reflow
    track.style.animation = `miniSlide ${duration}s linear infinite`;
  };

  // Initial setup after a short delay to ensure images are loaded or layout is ready
  setTimeout(updateAnimation, 500);

  window.addEventListener('resize', updateAnimation);
};

// Initialize carousel
setupCarousel();
