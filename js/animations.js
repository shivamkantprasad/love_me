(function () {
  const HEART = "\u2665";

  function initFloatingHearts(containerId, count) {
    const container = document.getElementById(containerId);
    if (!container) return;

    for (let i = 0; i < count; i += 1) {
      const heart = document.createElement("span");
      heart.className = "float-heart";
      heart.textContent = HEART;
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.fontSize = `${14 + Math.random() * 28}px`;
      heart.style.setProperty("--heart-opacity", `${0.15 + Math.random() * 0.35}`);
      heart.style.setProperty("--drift", `${-40 + Math.random() * 80}px`);
      heart.style.animationDuration = `${10 + Math.random() * 14}s`;
      heart.style.animationDelay = `${Math.random() * 12}s`;
      container.appendChild(heart);
    }
  }

  function initBreakingHeart() {
    const el = document.querySelector(".breaking-heart");
    if (!el) return;
    requestAnimationFrame(() => el.classList.add("animate"));
  }

  function initConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const colors = ["#ff6b9d", "#e8437a", "#ffb3c9", "#ffd700", "#ff8fab", "#fff", "#c9a0ff"];
    let particles = [];
    let width = 0;
    let height = 0;
    let rafId = 0;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }

    function createParticle(x, y, burst) {
      const angle = burst
        ? Math.random() * Math.PI * 2
        : -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
      const speed = burst ? 4 + Math.random() * 8 : 1 + Math.random() * 3;

      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (burst ? 2 : 0),
        w: 6 + Math.random() * 8,
        h: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        spin: -4 + Math.random() * 8,
        gravity: 0.08 + Math.random() * 0.06,
        life: 1,
        decay: 0.003 + Math.random() * 0.006,
        shape: Math.random() > 0.5 ? "rect" : "circle",
      };
    }

    function burst(x, y, amount) {
      for (let i = 0; i < amount; i += 1) {
        particles.push(createParticle(x, y, true));
      }
    }

    function spawnStream() {
      for (let i = 0; i < 3; i += 1) {
        particles.push(createParticle(Math.random() * width, -10, false));
      }
    }

    function drawParticle(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.life;

      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }

      ctx.restore();
    }

    function tick() {
      ctx.clearRect(0, 0, width, height);

      if (Math.random() < 0.35) spawnStream();

      particles = particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.99;
        p.rotation += p.spin;
        p.life -= p.decay;

        if (p.life > 0 && p.y < height + 40) {
          drawParticle(p);
          return true;
        }
        return false;
      });

      rafId = requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize);

    burst(width * 0.15, height * 0.85, 60);
    burst(width * 0.85, height * 0.82, 60);
    setTimeout(() => burst(width * 0.5, height * 0.1, 80), 400);

    tick();

    window.addEventListener("beforeunload", () => cancelAnimationFrame(rafId));

    return { burst };
  }

  window.LoveAnimations = {
    initFloatingHearts,
    initBreakingHeart,
    initConfetti,
  };

  let confettiApi = null;

  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.classList.contains("page-main")) {
      initFloatingHearts("floating-hearts", 28);
    }

    if (document.body.classList.contains("page-sad")) {
      initBreakingHeart();
    }

    if (document.body.classList.contains("page-date")) {
      confettiApi = initConfetti();
      window.LoveAnimations.confettiBurst = (x, y, amount) => {
        if (confettiApi) confettiApi.burst(x, y, amount);
      };
    }
  });
})();
