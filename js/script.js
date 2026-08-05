const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const navbar = document.getElementById('navbar');

function closeMenu() {
  if (!navToggle || !navLinks) return;
  navLinks.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', '打开菜单');
}

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const nextOpen = !navLinks.classList.contains('open');
    navLinks.classList.toggle('open', nextOpen);
    navToggle.setAttribute('aria-expanded', String(nextOpen));
    navToggle.setAttribute('aria-label', nextOpen ? '关闭菜单' : '打开菜单');
  });

  navLinks.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

function updateNavbar() {
  navbar?.classList.toggle('scrolled', window.scrollY > 10);
}

window.addEventListener('scroll', updateNavbar, { passive: true });
updateNavbar();

const sectionLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
const sections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window && sections.length) {
  const navObserver = new IntersectionObserver((entries) => {
    const current = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!current) return;

    sectionLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${current.target.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }, {
    rootMargin: '-30% 0px -60%',
    threshold: [0, 0.2, 0.5],
  });

  sections.forEach((section) => navObserver.observe(section));
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const memberMarquee = document.querySelector('.member-marquee');
const memberTrack = memberMarquee?.querySelector('.member-marquee-track');
const memberSet = memberTrack?.querySelector('.members-directory');
const memberMotionToggle = document.getElementById('memberMotionToggle');

if (memberTrack && memberSet) {
  const memberSetClone = memberSet.cloneNode(true);
  memberSetClone.classList.add('members-directory--clone');
  memberSetClone.setAttribute('aria-hidden', 'true');
  memberSetClone.inert = true;
  memberSetClone.querySelectorAll('a').forEach((link) => {
    link.tabIndex = -1;
  });
  memberTrack.append(memberSetClone);
}

document.querySelectorAll('img[data-fallback-src]').forEach((image) => {
  image.addEventListener('error', () => {
    const fallbackSrc = image.dataset.fallbackSrc;
    if (fallbackSrc) image.src = fallbackSrc;
  }, { once: true });
});

if (memberMotionToggle && memberMarquee) {
  if (reduceMotion) {
    memberMotionToggle.hidden = true;
  } else {
    memberMotionToggle.addEventListener('click', () => {
      const paused = memberMarquee.classList.toggle('is-paused');
      memberMotionToggle.setAttribute('aria-pressed', String(paused));
      const label = memberMotionToggle.querySelector('.marquee-toggle-label');
      if (label) label.textContent = paused ? '继续滚动' : '暂停滚动';
    });
  }
}

const revealItems = Array.from(document.querySelectorAll('.reveal'));

if (!reduceMotion && 'IntersectionObserver' in window) {
  revealItems.forEach((item) => item.classList.add('is-prepared'));

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: '0px 0px -8%',
    threshold: 0.08,
  });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}
