import { API_BASE_URL } from "/src/js/API.js";
(function () {
  "use strict";

  // DOM refs
  const form = document.getElementById("forgotForm");
  const identifierInput = document.getElementById("resetIdentifier");
  const validationMsg = document.getElementById("identifierValidation");
  const sendBtn = document.getElementById("sendResetButton");

  const errorMsg = document.getElementById("errorMessage");
  const errorText = document.getElementById("errorText");
  const successMsg = document.getElementById("successMessage");
  const successText = document.getElementById("successText");
  const warningMsg = document.getElementById("warningMessage");
  const warningText = document.getElementById("warningText");
  const infoMsg = document.getElementById("infoMessage");
  const infoText = document.getElementById("infoText");

  // helper to hide all messages
  function hideAllMessages() {
    errorMsg.style.display = "none";
    successMsg.style.display = "none";
    warningMsg.style.display = "none";
    infoMsg.style.display = "none";
  }

  // show a specific message
  function showMessage(type, text) {
    hideAllMessages();
    if (type === "error") {
      errorText.textContent = text;
      errorMsg.style.display = "flex";
    } else if (type === "success") {
      successText.textContent = text;
      successMsg.style.display = "flex";
    } else if (type === "warning") {
      warningText.textContent = text;
      warningMsg.style.display = "flex";
    } else if (type === "info") {
      infoText.textContent = text;
      infoMsg.style.display = "flex";
    }
  }

  // set validation style on input
  function setInputValidation(valid) {
    identifierInput.classList.remove("error", "success");
    if (valid === true) {
      identifierInput.classList.add("success");
      validationMsg.className = "validation-message success";
      validationMsg.innerHTML =
        '<i class="fas fa-check-circle"></i> Looks good';
    } else if (valid === false) {
      identifierInput.classList.add("error");
      validationMsg.className = "validation-message error";
      validationMsg.innerHTML =
        '<i class="fas fa-exclamation-circle"></i> Please enter your email or username';
    } else {
      // neutral
      validationMsg.className = "validation-message";
      validationMsg.innerHTML = "";
    }
  }

  // simulate sending reset link (async)
  function sendResetLink(identifier) {
    return new Promise((resolve, reject) => {
      // simulate network delay
      setTimeout(() => {
        // For demo: accept any non-empty value as "valid"
        if (identifier && identifier.trim().length > 0) {
          resolve({ success: true, message: "Reset link sent to your email." });
        } else {
          reject({
            success: false,
            message: "Please provide a valid email or username.",
          });
        }
      }, 1500);
    });
  }

  // handle form submit
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const identifier = identifierInput.value.trim();

    // reset validation
    setInputValidation(null);
    hideAllMessages();

    // basic check
    if (!identifier) {
      setInputValidation(false);
      showMessage("warning", "Please enter your email or username.");
      return;
    }

    // show info / loading state
    showMessage("info", "Sending reset link, please wait…");
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span class="loading-spinner"></span> Sending…';

    try {
      hideAllMessages();
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usernameOrEmail: identifierInput.value.trim(),
        }),
      });

      const data = await response.json();

      console.log(data);
      if (!data.success) {
        showMessage("error", data.message || "Something Went wrong.");
        setInputValidation(false);
        return;
      }

      showMessage("success", "Reset link sent! Check your inbox.");
      setInputValidation(true);

      // change button to "resent" style
      sendBtn.disabled = false;
      sendBtn.innerHTML = '<i class="fas fa-check"></i> Link Sent';
      sendBtn.classList.add("success");
    } catch (err) {
      hideAllMessages();
      showMessage(
        "error",
        err.message || "Something went wrong. Please try again.",
      );
      setInputValidation(false);
      sendBtn.disabled = false;
      sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Reset Link';
    } finally {
      if (!sendBtn.classList.contains("success")) {
        sendBtn.disabled = false;
        sendBtn.innerHTML =
          '<i class="fas fa-paper-plane"></i> Send Reset Link';
      }
    }
  });

  // real‑time validation hint (optional)
  identifierInput.addEventListener("input", function () {
    const val = this.value.trim();
    if (val.length > 0) {
      setInputValidation(true);
    } else {
      setInputValidation(null);
    }
    // hide any previous error messages while typing
    hideAllMessages();
  });

  // back to login link (demo)
  document
    .getElementById("backToLogin")
    .addEventListener("click", function (e) {
      e.preventDefault();
      console.log("working");
      window.location.href = "/";
    });

  // social buttons (demo)
  document.querySelectorAll(".social-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      alert(`Social login with ${this.textContent.trim()} (demo)`);
    });
  });

  // small background animation (same as signup style) – just for visual
  const bg = document.getElementById("bgAnimation");
  for (let i = 0; i < 15; i++) {
    const node = document.createElement("div");
    node.className = "node";
    node.style.left = Math.random() * 100 + "%";
    node.style.top = Math.random() * 100 + "%";
    node.style.width = 2 + Math.random() * 6 + "px";
    node.style.height = node.style.width;
    node.style.opacity = 0.1 + Math.random() * 0.2;
    bg.appendChild(node);
  }
})();
