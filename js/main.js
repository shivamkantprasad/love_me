(function () {
  const noBtn = document.getElementById("no-btn");
  const buttonArea = document.getElementById("button-area");
  const hint = document.getElementById("no-hint");

  const CHASE_MS = 90000;
  const REQUIRED_CLICKS = 5;
  const FLEE_DISTANCE = 120;
  const MOBILE_BREAKPOINT = 768;

  let chaseEndTime = Date.now() + CHASE_MS;
  let isChasePhase = true;
  let clickCount = 0;
  let isMobile = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;

  noBtn.classList.add("chase-mode");
  hint.classList.remove("hidden");
  hint.textContent = "Good luck catching that button...";

  function randomPosition() {
    const areaRect = buttonArea.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    const maxX = areaRect.width - btnRect.width - 8;
    const maxY = areaRect.height - btnRect.height - 8;

    return {
      x: Math.max(8, Math.random() * Math.max(maxX, 8)),
      y: Math.max(8, Math.random() * Math.max(maxY, 8)),
    };
  }

  function moveNoButton(x, y) {
    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
  }

  function fleeFromPoint(clientX, clientY) {
    const btnRect = noBtn.getBoundingClientRect();
    const areaRect = buttonArea.getBoundingClientRect();

    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;

    const dx = btnCenterX - clientX;
    const dy = btnCenterY - clientY;
    const distance = Math.hypot(dx, dy);

    if (distance > FLEE_DISTANCE) return;

    let newX = parseFloat(noBtn.style.left || "0") || 0;
    let newY = parseFloat(noBtn.style.top || "0") || 0;

    if (distance > 0) {
      const push = (FLEE_DISTANCE - distance) * 1.5;
      newX += (dx / distance) * push;
      newY += (dy / distance) * push;
    } else {
      const pos = randomPosition();
      newX = pos.x;
      newY = pos.y;
    }

    const maxX = areaRect.width - btnRect.width;
    const maxY = areaRect.height - btnRect.height;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    moveNoButton(newX, newY);
  }

  function teleportNoButton() {
    const pos = randomPosition();
    moveNoButton(pos.x, pos.y);
  }

  function enterClickablePhase() {
    isChasePhase = false;
    noBtn.classList.remove("chase-mode");
    noBtn.classList.add("clickable-mode");
    noBtn.style.position = "relative";
    noBtn.style.left = "";
    noBtn.style.top = "";
    hint.textContent = `Okay fine... click No ${REQUIRED_CLICKS} times if you really mean it.`;
  }

  function checkChaseTimer() {
    if (!isChasePhase) return;

    if (Date.now() >= chaseEndTime) {
      enterClickablePhase();
    }
  }

  setInterval(checkChaseTimer, 500);

  window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).addEventListener("change", (e) => {
    isMobile = e.matches;
  });

  document.addEventListener("mousemove", (e) => {
    if (isChasePhase && !isMobile) {
      fleeFromPoint(e.clientX, e.clientY);
    }
  });

  noBtn.addEventListener("touchstart", (e) => {
    if (!isChasePhase) return;
    e.preventDefault();
    teleportNoButton();
  }, { passive: false });

  noBtn.addEventListener("click", (e) => {
    if (isChasePhase) {
      e.preventDefault();
      if (isMobile) {
        teleportNoButton();
      }
      return;
    }

    clickCount += 1;
    const remaining = REQUIRED_CLICKS - clickCount;

    if (remaining > 0) {
      hint.textContent = `${remaining} more click${remaining === 1 ? "" : "s"}...`;
    } else {
      window.location.href = "sad.html";
    }
  });

  const startPos = randomPosition();
  moveNoButton(startPos.x, startPos.y);
})();
