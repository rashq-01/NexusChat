import { API_BASE_URL } from "/src/js/API.js";

(function () {
  // ----- simple DOM refs -----
  const newPw = document.getElementById("newPassword");
  const confirmPw = document.getElementById("confirmPassword");
  const resetBtn = document.getElementById("resetButton");
  const buttonText = document.getElementById("buttonText");
  const errorMsg = document.getElementById("errorMessage");
  const errorText = document.getElementById("errorText");
  const successMsg = document.getElementById("successMessage");
  const successText = document.getElementById("successText");
  const resetForm = document.getElementById("resetForm");

  // ---- helpers to show/hide messages ----
  function hideAllMessages() {
    errorMsg.style.display = "none";
    successMsg.style.display = "none";
  }

  function showError(message) {
    hideAllMessages();
    errorText.innerText = message || "Something went wrong.";
    errorMsg.style.display = "flex";
  }

  function showSuccess(message) {
    hideAllMessages();
    successText.innerText = message || "Password updated!";
    successMsg.style.display = "flex";
  }

  // ---- simulate reset (just client-side validation + demo) ----
  async function handleReset(e) {
    e.preventDefault();
    hideAllMessages();

    const newVal = newPw.value.trim();
    const confirmVal = confirmPw.value.trim();

    // basic validation
    if (!newVal || newVal.length < 6) {
      showError("Password must be at least 6 characters.");
      return;
    }
    if (newVal !== confirmVal) {
      showError("Passwords do not match.");
      return;
    }

    // --- success: pretend we updated password ---
    // disable button, show spinner
    try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
      const response = fetch(`${API_BASE_URL}/api/auth/forgot-password-link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPassword: newVal,
          confirmPassword: confirmVal,
          token : token,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        setTimeout(() => {
          showError(
            data.message || "Something went wrong! Redirecting to home page",
          );
          resetBtn.disabled = false;
          buttonText.innerText = "Reset password";
        }, 1500);
        window.location.href = "/";
      }

      resetBtn.disabled = true;
      buttonText.innerHTML = '<span class="loading"></span> Updating…';

      // simulate async call
      setTimeout(() => {
        // show success
        showSuccess("Password successfully updated! Redirecting to login…");
        resetBtn.disabled = false;
        buttonText.innerText = "Reset password";
      }, 1500);
      window.location.href = "/";

    } catch (err) {
      setTimeout(() => {
        showError(
          err.message || "Something went wrong! Redirecting to home page",
        );
        resetBtn.disabled = false;
        buttonText.innerText = "Reset password";
      }, 1500);
      window.location.href = "/";
    }
  }

  // ---- attach submit ----
  resetForm.addEventListener("submit", handleReset);

  // ---- "Sign in" link (just demo) ----
  document.getElementById("signinLink").addEventListener("click", function (e) {
    e.preventDefault();
    // simulate navigation: clear form, show info
    hideAllMessages();
    newPw.value = "";
    confirmPw.value = "";
    showSuccess("Redirecting to sign in page … (demo)");
    // you could actually redirect: window.location.href = '/login.html';
  });

  // ---- small background animation (simple nodes) ----
  (function addBgDots() {
    const bg = document.getElementById("bgAnimation");
    if (!bg) return;
    for (let i = 0; i < 12; i++) {
      const dot = document.createElement("div");
      dot.className = "node";
      dot.style.left = Math.random() * 100 + "%";
      dot.style.top = Math.random() * 100 + "%";
      dot.style.width = 4 + Math.random() * 6 + "px";
      dot.style.height = dot.style.width;
      dot.style.opacity = 0.08 + Math.random() * 0.12;
      bg.appendChild(dot);
    }
  })();
})();
