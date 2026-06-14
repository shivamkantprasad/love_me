(function () {
  const form = document.getElementById("date-form");
  const statusEl = document.getElementById("form-status");
  const submitBtn = document.getElementById("submit-btn");

  function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = `form-status ${type}`;
    statusEl.classList.remove("hidden");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!window.DISCORD_WEBHOOK_URL || window.DISCORD_WEBHOOK_URL.includes("YOUR_WEBHOOK")) {
      showStatus("Discord webhook is not configured yet. Edit js/config.js.", "error");
      return;
    }

    const data = new FormData(form);
    const date = data.get("date");
    const time = data.get("time");
    const activity = data.get("activity");

    const payload = {
      embeds: [
        {
          title: "New date request",
          color: 16738740,
          fields: [
            { name: "Date", value: date, inline: true },
            { name: "Time", value: time, inline: true },
            { name: "Plans", value: activity },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    submitBtn.disabled = true;
    showStatus("Sending...", "success");

    try {
      const response = await fetch(window.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Discord returned ${response.status}`);
      }

      showStatus("Sent! I'll see you then.", "success");
      form.reset();
    } catch (err) {
      showStatus("Could not send. Check your webhook URL and try again.", "error");
      console.error(err);
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
