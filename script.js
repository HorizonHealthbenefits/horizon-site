// Horizon Health Benefits — homepage JS
// Just two things: stamp the footer year, and submit the "Request a
// Call" form to /api/request-call without a page reload.

document.getElementById("year").textContent = new Date().getFullYear();

const form = document.getElementById("request-call-form");
const statusEl = document.getElementById("form-status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.className = "";
  statusEl.textContent = "";

  const payload = {
    name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    email: form.email.value.trim(),
    reason: form.reason.value.trim(),
  };

  if (!payload.name || !payload.phone || !payload.email || !payload.reason) {
    statusEl.className = "err";
    statusEl.textContent = "Please fill out every field.";
    return;
  }

  const submitBtn = form.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";

  try {
    const res = await fetch("/api/request-call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Request failed");
    }

    statusEl.className = "ok";
    statusEl.textContent = "Thanks — we got your request and will reach out shortly.";
    form.reset();
  } catch (err) {
    statusEl.className = "err";
    statusEl.textContent = "Something went wrong sending that. Please call or email us directly.";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Request";
  }
});
