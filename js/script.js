// 移动端导航菜单
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const navbar = document.getElementById('navbar');

function closeMenu() {
  navLinks.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', '打开菜单');
}

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const willOpen = !navLinks.classList.contains('open');
    navLinks.classList.toggle('open', willOpen);
    navToggle.setAttribute('aria-expanded', String(willOpen));
    navToggle.setAttribute('aria-label', willOpen ? '关闭菜单' : '打开菜单');
  });

  // 点击菜单项后自动收起
  navLinks.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });
}

// 导航栏滚动状态
function updateNavbar() {
  navbar?.classList.toggle('scrolled', window.scrollY > 12);
}

window.addEventListener('scroll', updateNavbar, { passive: true });
updateNavbar();

// 根据当前区块高亮导航
const sectionLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
const observedSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window && observedSections.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    sectionLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${visible.target.id}`;
      link.classList.toggle('active', active);
      if (active) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }, {
    rootMargin: '-30% 0px -55%',
    threshold: [0, 0.2, 0.5],
  });

  observedSections.forEach((section) => sectionObserver.observe(section));
}

// 禁用未开放的报名入口
document.querySelectorAll('a[aria-disabled="true"]').forEach((el) => {
  el.addEventListener('click', (e) => e.preventDefault());
});

// ============ Hero 六星星座背景动画 ============
const canvas = document.getElementById('starCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W, H, particles, sixStars;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;

    // 背景漂浮粒子
    const count = Math.floor((W * H) / 16000);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      a: Math.random() * 0.5 + 0.2,
    }));

    // 六颗主星，环状分布在标题周围
    sixStars = Array.from({ length: 6 }, (_, i) => {
      const ang = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      return {
        bx: W / 2 + Math.cos(ang) * Math.min(W, 900) * 0.36,
        by: H / 2 + Math.sin(ang) * H * 0.34,
        phase: Math.random() * Math.PI * 2,
      };
    });
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    // 粒子
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(160, 200, 255, ${p.a})`;
      ctx.fill();
    }

    // 六星位置（带轻微浮动）
    const pts = sixStars.map((s) => ({
      x: s.bx + Math.sin(t / 1600 + s.phase) * 10,
      y: s.by + Math.cos(t / 1900 + s.phase) * 8,
    }));

    // 星之间的连线
    ctx.strokeStyle = 'rgba(0, 229, 160, 0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    pts.forEach((p, i) => {
      const q = pts[(i + 1) % 6];
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(q.x, q.y);
    });
    ctx.stroke();

    // 六颗主星（四苒星光）
    pts.forEach((p, i) => {
      const tw = 0.65 + Math.sin(t / 500 + sixStars[i].phase) * 0.35;
      const R = 7 * tw + 3;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = `rgba(0, 229, 160, ${0.5 + tw * 0.4})`;
      ctx.beginPath();
      for (let k = 0; k < 4; k++) {
        ctx.rotate(Math.PI / 2);
        ctx.moveTo(0, -R);
        ctx.quadraticCurveTo(R * 0.18, -R * 0.18, R, 0);
        ctx.quadraticCurveTo(R * 0.18, R * 0.18, 0, R);
      }
      ctx.fill();
      ctx.restore();
    });

    if (!reduceMotion) {
      requestAnimationFrame(draw);
    }
  }

  window.addEventListener('resize', resize);
  resize();
  if (reduceMotion) {
    draw(0);
  } else {
    requestAnimationFrame(draw);
  }
}
