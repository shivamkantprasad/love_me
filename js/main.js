(function () {
  const noBtn = document.getElementById("no-btn");
  const buttonArea = document.getElementById("button-area");
  const hint = document.getElementById("no-hint");
  const guiltPopups = document.getElementById("guilt-popups");

  const CHASE_MS = 30000;
  const REQUIRED_CLICKS = 5;
  const FLEE_DISTANCE = 120;
  const MOBILE_BREAKPOINT = 768;

  const GUILT_MESSAGES = [
    "Really?",
    "Why?",
    "Please =(",
    "Why would you do that?",
    "Are you sure?",
    "That hurts...",
    "Think again...",
    "Don't do this to me",
    "You can't mean that",
    "Say yes instead!",
    "Stoppp",
    "I'm gonna cry",
    "How could you?",
    "Not like this...",
    "But... why though?",
    "Please reconsider",
    "My heart...",
    "You're breaking me",
    "Is that your final answer?",
    "I'll remember this",
    "Wow. Okay.",
    "After everything?",
    "Try Yes instead",
    "You're kidding, right?",
  ];

  const CLICK_PHASE_MESSAGES = [
    "Still going through with it?",
    "You really mean that?",
    "Last chance to change your mind...",
    "Why are you still clicking No?",
    "This is on you now",
    "Fine. Keep going then.",
  ];

  let chaseEndTime = Date.now() + CHASE_MS;
  let isChasePhase = true;
  let clickCount = 0;
  let isMobile = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
  let lastMessageIndex = -1;
  let lastGuiltTime = 0;

  noBtn.classList.add("chase-mode");
  hint.classList.remove("hidden");
  hint.textContent = "Good luck catching that button...";

  function pickMessage(pool) {
    let index = Math.floor(Math.random() * pool.length);
    if (pool.length > 1) {
      while (index === lastMessageIndex) {
        index = Math.floor(Math.random() * pool.length);
      }
    }
    lastMessageIndex = index;
    return pool[index];
  }

  function showGuiltBubble(text) {
    const bubble = document.createElement("span");
    bubble.className = "guilt-bubble";
    bubble.textContent = text;

    const btnRect = noBtn.getBoundingClientRect();
    const offsetX = -30 + Math.random() * 60;
    bubble.style.left = `${btnRect.left + btnRect.width / 2 + offsetX}px`;
    bubble.style.top = `${btnRect.top}px`;

    guiltPopups.appendChild(bubble);
    bubble.addEventListener("animationend", () => bubble.remove());
  }

  function showGuiltMessage(pool, minInterval = 600, hintSuffix = "") {
    const now = Date.now();
    if (now - lastGuiltTime < minInterval) return false;
    lastGuiltTime = now;

    const message = pickMessage(pool);

    hint.textContent = hintSuffix ? `${message} ${hintSuffix}` : message;
    hint.classList.remove("guilt-flash");
    void hint.offsetWidth;
    hint.classList.add("guilt-flash");

    showGuiltBubble(message);
    return true;
  }

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
    const areaRect = buttonArea.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();

    const pointerX = clientX - areaRect.left;
    const pointerY = clientY - areaRect.top;
    const btnCenterX = btnRect.left - areaRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top - areaRect.top + btnRect.height / 2;

    const dx = btnCenterX - pointerX;
    const dy = btnCenterY - pointerY;
    const distance = Math.hypot(dx, dy);

    if (distance > FLEE_DISTANCE) return;

    let newX = btnRect.left - areaRect.left;
    let newY = btnRect.top - areaRect.top;

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
    showGuiltMessage(GUILT_MESSAGES, 1200);
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
    hint.classList.remove("guilt-flash");
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

  noBtn.addEventListener("mousedown", (e) => {
    if (!isChasePhase) return;
    showGuiltMessage(GUILT_MESSAGES, 400);
  });

  noBtn.addEventListener("touchstart", (e) => {
    if (!isChasePhase) return;
    e.preventDefault();
    showGuiltMessage(GUILT_MESSAGES, 400);
    teleportNoButton();
  }, { passive: false });

  noBtn.addEventListener("click", (e) => {
    if (isChasePhase) {
      e.preventDefault();
      if (!isMobile) {
        showGuiltMessage(GUILT_MESSAGES, 400);
      }
      return;
    }

    clickCount += 1;
    const remaining = REQUIRED_CLICKS - clickCount;

    if (remaining > 0) {
      const suffix = `(${remaining} more click${remaining === 1 ? "" : "s"}...)`;
      showGuiltMessage(CLICK_PHASE_MESSAGES, 400, suffix);
    } else {
      hint.textContent = "Fine. I'll remember this.";
      window.location.href = "sad.html";
    }
  });

  const startPos = randomPosition();
  moveNoButton(startPos.x, startPos.y);
})();
