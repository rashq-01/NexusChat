document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  const loader = document.getElementById("loader");
  const loginBox = document.getElementById("loginBox");

  if (!token) {
    loader.style.display = "none";
    loginBox.style.display = "block";
    return;
  }
  try {
    const res = await fetch("http://localhost:5000/api/auth/verify-token", {
      headers: {
        Authorization: token,
      },
    });
    const data = await res.json();
    if (data.success) {
      window.location.href = "public/dashboard.html";
    } else {
      loader.style.display = "none";
      loginBox.style.display = "block";
    }
  } catch (err) {
    console.log(err.message);
    loader.style.display = "none";
    loginBox.style.display = "block";
  }
});

// Background animation
function createBackgroundAnimation() {
  const bgAnimation = document.getElementById("bgAnimation");
  const nodeCount = 25;

  // Create nodes
  for (let i = 0; i < nodeCount; i++) {
    const node = document.createElement("div");
    node.className = "node";
    node.style.left = `${Math.random() * 100}%`;
    node.style.top = `${Math.random() * 100}%`;
    node.style.width = `${Math.random() * 6 + 3}px`;
    node.style.height = node.style.width;
    node.style.backgroundColor = `rgba(37, 99, 235, ${Math.random() * 0.2 + 0.1})`;
    bgAnimation.appendChild(node);

    // Animate nodes
    animateNode(node);
  }

  // Create connections
  for (let i = 0; i < 15; i++) {
    const connection = document.createElement("div");
    connection.className = "connection";

    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    const length = Math.random() * 100 + 50;
    const angle = Math.random() * Math.PI * 2;

    connection.style.left = `${startX}%`;
    connection.style.top = `${startY}%`;
    connection.style.width = `${length}px`;
    connection.style.transform = `rotate(${angle}rad)`;

    bgAnimation.appendChild(connection);
  }
}

function animateNode(node) {
  const startX = parseFloat(node.style.left);
  const startY = parseFloat(node.style.top);
  const speedX = (Math.random() - 0.5) * 0.05;
  const speedY = (Math.random() - 0.5) * 0.05;

  function move() {
    let x = parseFloat(node.style.left) + speedX;
    let y = parseFloat(node.style.top) + speedY;

    // Bounce off edges
    if (x < 0 || x > 100) x = startX;
    if (y < 0 || y > 100) y = startY;

    node.style.left = `${x}%`;
    node.style.top = `${y}%`;

    requestAnimationFrame(move);
  }

  move();
}

// System stats animation
function animateStats() {
  const onlineUsers = document.getElementById("onlineUsers");
  const messageRate = document.getElementById("messageRate");
  const serverNodes = document.getElementById("serverNodes");

  // Simulate changing stats
  setInterval(() => {
    const users = parseInt(onlineUsers.textContent.replace(/,/g, ""));
    const newUsers = users + Math.floor(Math.random() * 21) - 10;
    onlineUsers.textContent = Math.max(
      8000,
      Math.min(9000, newUsers),
    ).toLocaleString();

    const rate = parseInt(messageRate.textContent);
    const newRate = rate + Math.floor(Math.random() * 11) - 5;
    messageRate.textContent = Math.max(120, Math.min(180, newRate)) + "/sec";
  }, 3000);
}

// Form functionality
document.addEventListener("DOMContentLoaded", function () {
  createBackgroundAnimation();
  animateStats();

  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginButton = document.getElementById("loginButton");
  const buttonText = document.getElementById("buttonText");
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");
  const signupLink = document.getElementById("signupLink");

  // Demo credentials
  const demoCredentials = {
    admin: "nexuschat123",
    john: "password123",
    jane: "test123",
    alex: "demo123",
  };

  // Form submission
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Hide messages
    errorMessage.style.display = "none";
    successMessage.style.display = "none";

    // Basic validation
    if (!username || !password) {
      showError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      showError("Password must be at least 6 characters");
      return;
    }

    // Show loading state
    console.log("Before Fetch");
    loginButton.disabled = true;
    buttonText.innerHTML = '<div class="loading"></div> Signing in...';
    const response = await fetch(`http://localhost:5000/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userOrEmail: username,
        password: password,
      }),
    });
    console.log("After fetch");

    const data = await response.json();
    console.log(data);
    if (!data.success) {
      showError(data.message);
      buttonText.textContent = "Sign In";
      loginButton.disabled = false;
      return;
    }
    showSuccess("Login successful! Redirecting to NexusChat...");

    localStorage.setItem("token", data.token);

    window.location.href = "/public/dashboard.html";
  });

  // Forgot password link
  document
    .querySelector(".forgot-password")
    .addEventListener("click", function (e) {
      e.preventDefault();
      showSuccess(
        "Password reset link would be sent to your email in a real application.",
      );
    });

  // Sign up link
  signupLink.addEventListener("click", function (e) {
    e.preventDefault();
    showSuccess("Redirecting to the signup page...");
    window.location.href = "/public/signUp.html";
  });

  // Social login buttons
  document.querySelectorAll(".social-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const provider = this.classList.contains("google") ? "Google" : "GitHub";
      showSuccess(
        `${provider} authentication would be implemented in a production environment.`,
      );
    });
  });

  // Helper functions
  function showError(message) {
    errorMessage.style.display = "flex";
    document.getElementById("errorText").textContent = message;

    // Auto-hide error after 5 seconds
    setTimeout(() => {
      errorMessage.style.display = "none";
    }, 5000);
  }

  function showSuccess(message) {
    successMessage.style.display = "flex";
    document.getElementById("successText").textContent = message;

    // Auto-hide success after 5 seconds
    setTimeout(() => {
      successMessage.style.display = "none";
    }, 5000);
  }

  // Demo auto-fill for presentation
  setTimeout(() => {
    if (!localStorage.getItem("demoShown")) {
      usernameInput.value = "admin";
      passwordInput.value = "nexuschat123";
      showSuccess('Demo credentials auto-filled. Click "Sign In" to continue.');
      localStorage.setItem("demoShown", "true");
    }
  }, 1000);
});
