// Background animation
function createBackgroundAnimation() {
  const bgAnimation = document.getElementById("bgAnimation");
  const nodeCount = 25;

  for (let i = 0; i < nodeCount; i++) {
    const node = document.createElement("div");
    node.className = "node";
    node.style.left = `${Math.random() * 100}%`;
    node.style.top = `${Math.random() * 100}%`;
    node.style.width = `${Math.random() * 6 + 3}px`;
    node.style.height = node.style.width;
    node.style.backgroundColor = `rgba(37, 99, 235, ${Math.random() * 0.2 + 0.1})`;
    bgAnimation.appendChild(node);

    animateNode(node);
  }

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

    if (x < 0 || x > 100) x = startX;
    if (y < 0 || y > 100) y = startY;

    node.style.left = `${x}%`;
    node.style.top = `${y}%`;

    requestAnimationFrame(move);
  }

  move();
}

// Form state
let currentStep = 1;
let resendCooldown = 0;
let resendTimer = null;
const formData = {
  firstName: "",
  lastName: "",
  email: "",
  username: "",
  password: "",
  agreeTerms: false,
};

// DOM Elements
const step1Form = document.getElementById("step1Form");
const step2Form = document.getElementById("step2Form");
const step3Form = document.getElementById("step3Form");
const progressFill = document.getElementById("progressFill");
const verificationInfo = document.getElementById("verificationInfo");
const verificationEmail = document.getElementById("verificationEmail");
const resendLink = document.getElementById("resendLink");
const countdown = document.getElementById("countdown");

const step1Elements = document.querySelectorAll("#step1");
const step2Elements = document.querySelectorAll("#step2");
const step3Elements = document.querySelectorAll("#step3");

const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const agreeTermsCheckbox = document.getElementById("agreeTerms");

const passwordToggle = document.getElementById("passwordToggle");
const confirmPasswordToggle = document.getElementById("confirmPasswordToggle");

const nextStep1Button = document.getElementById("nextStep1Button");
const prevStep2Button = document.getElementById("prevStep2Button");
const createAccountButton = document.getElementById("createAccountButton");
const continueToLoginButton = document.getElementById("continueToLoginButton");
const loginLink = document.getElementById("loginLink");

// Strength indicator elements
const strengthFill = document.getElementById("strengthFill");
const strengthText = document.getElementById("strengthText");

// Validation messages elements
const firstNameValidation = document.getElementById("firstNameValidation");
const lastNameValidation = document.getElementById("lastNameValidation");
const emailValidation = document.getElementById("emailValidation");
const usernameValidation = document.getElementById("usernameValidation");
const passwordValidation = document.getElementById("passwordValidation");
const confirmPasswordValidation = document.getElementById(
  "confirmPasswordValidation",
);
const termsValidation = document.getElementById("termsValidation");

// Message elements
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");
const warningMessage = document.getElementById("warningMessage");
const infoMessage = document.getElementById("infoMessage");

// Password strength calculation
function calculatePasswordStrength(password) {
  let strength = 0;

  // Length check
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;

  // Character variety checks
  if (/[a-z]/.test(password)) strength += 20;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 20;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 10;

  // Ensure max 100
  strength = Math.min(strength, 100);

  return strength;
}

function updatePasswordStrength() {
  const password = passwordInput.value;
  const strength = calculatePasswordStrength(password);

  // Update visual indicator
  strengthFill.style.width = `${strength}%`;

  // Update color and text based on strength
  let color, text;
  if (strength < 30) {
    color = "#ef4444";
    text = "Very weak";
  } else if (strength < 50) {
    color = "#f59e0b";
    text = "Weak";
  } else if (strength < 75) {
    color = "#f59e0b";
    text = "Fair";
  } else if (strength < 90) {
    color = "#10b981";
    text = "Good";
  } else {
    color = "#10b981";
    text = "Strong";
  }

  strengthFill.style.backgroundColor = color;
  strengthText.textContent = `Password strength: ${text}`;
  strengthText.style.color = color;
}

// Validation functions
function validateFirstName() {
  const value = firstNameInput.value.trim();
  if (!value) {
    showValidationError(
      firstNameInput,
      firstNameValidation,
      "First name is required",
    );
    return false;
  }
  if (value.length < 2) {
    showValidationError(
      firstNameInput,
      firstNameValidation,
      "First name must be at least 2 characters",
    );
    return false;
  }
  showValidationSuccess(
    firstNameInput,
    firstNameValidation,
    "First name looks good",
  );
  return true;
}

function validateLastName() {
  const value = lastNameInput.value.trim();
  if (!value) {
    showValidationError(
      lastNameInput,
      lastNameValidation,
      "Last name is required",
    );
    return false;
  }
  showValidationSuccess(
    lastNameInput,
    lastNameValidation,
    "Last name looks good",
  );
  return true;
}

function validateEmail() {
  const value = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!value) {
    showValidationError(emailInput, emailValidation, "Email is required");
    return false;
  }
  if (!emailRegex.test(value)) {
    showValidationError(
      emailInput,
      emailValidation,
      "Please enter a valid email address",
    );
    return false;
  }
  showValidationSuccess(emailInput, emailValidation, "Email address is valid");
  return true;
}

function validateUsername() {
  const value = usernameInput.value.trim();
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

  if (!value) {
    showValidationError(
      usernameInput,
      usernameValidation,
      "Username is required",
    );
    return false;
  }
  if (value.length < 3) {
    showValidationError(
      usernameInput,
      usernameValidation,
      "Username must be at least 3 characters",
    );
    return false;
  }
  if (!usernameRegex.test(value)) {
    showValidationError(
      usernameInput,
      usernameValidation,
      "Username can only contain letters, numbers, and underscores",
    );
    return false;
  }

  // Simulate username availability check
  const takenUsernames = ["admin", "john", "jane", "alex", "test"];
  if (takenUsernames.includes(value.toLowerCase())) {
    showValidationError(
      usernameInput,
      usernameValidation,
      "Username is already taken",
    );
    return false;
  }

  showValidationSuccess(
    usernameInput,
    usernameValidation,
    "Username is available",
  );
  return true;
}

function validatePassword() {
  const value = passwordInput.value;

  if (!value) {
    showValidationError(
      passwordInput,
      passwordValidation,
      "Password is required",
    );
    return false;
  }
  if (value.length < 8) {
    showValidationError(
      passwordInput,
      passwordValidation,
      "Password must be at least 8 characters",
    );
    return false;
  }

  const strength = calculatePasswordStrength(value);
  if (strength < 50) {
    showValidationError(
      passwordInput,
      passwordValidation,
      "Password is too weak",
    );
    return false;
  }

  showValidationSuccess(
    passwordInput,
    passwordValidation,
    "Password is strong enough",
  );
  return true;
}

function validateConfirmPassword() {
  const value = confirmPasswordInput.value;
  const password = passwordInput.value;

  if (!value) {
    showValidationError(
      confirmPasswordInput,
      confirmPasswordValidation,
      "Please confirm your password",
    );
    return false;
  }
  if (value !== password) {
    showValidationError(
      confirmPasswordInput,
      confirmPasswordValidation,
      "Passwords do not match",
    );
    return false;
  }
  showValidationSuccess(
    confirmPasswordInput,
    confirmPasswordValidation,
    "Passwords match",
  );
  return true;
}

function validateTerms() {
  if (!agreeTermsCheckbox.checked) {
    showValidationError(
      null,
      termsValidation,
      "You must agree to the terms and conditions",
    );
    return false;
  }
  showValidationSuccess(null, termsValidation, "Terms accepted");
  return true;
}

// Helper functions for validation UI
function showValidationError(input, validationElement, message) {
  if (input) {
    input.classList.remove("success");
    input.classList.add("error");
  }
  validationElement.innerHTML = `<i class="fas fa-times-circle"></i> ${message}`;
  validationElement.classList.remove("success");
  validationElement.classList.add("error");
  return false;
}

function showValidationSuccess(input, validationElement, message) {
  if (input) {
    input.classList.remove("error");
    input.classList.add("success");
  }
  validationElement.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  validationElement.classList.remove("error");
  validationElement.classList.add("success");
  return true;
}

function clearValidation(input, validationElement) {
  if (input) {
    input.classList.remove("error", "success");
  }
  validationElement.innerHTML = "";
  validationElement.classList.remove("error", "success");
}

// Show/hide messages
function showMessage(type, text) {
  // Hide all messages first
  errorMessage.style.display = "none";
  successMessage.style.display = "none";
  warningMessage.style.display = "none";
  infoMessage.style.display = "none";

  // Show the requested message
  if (type === "error") {
    document.getElementById("errorText").textContent = text;
    errorMessage.style.display = "flex";
  } else if (type === "success") {
    document.getElementById("successText").textContent = text;
    successMessage.style.display = "flex";
  } else if (type === "warning") {
    document.getElementById("warningText").textContent = text;
    warningMessage.style.display = "flex";
  } else if (type === "info") {
    document.getElementById("infoText").textContent = text;
    infoMessage.style.display = "flex";
  }
}

// Step navigation
function goToStep(step) {
  // Hide all forms
  step1Form.style.display = "none";
  step2Form.style.display = "none";
  step3Form.style.display = "none";

  // Update step indicators
  step1Elements.forEach((el) => el.classList.remove("active"));
  step2Elements.forEach((el) => el.classList.remove("active"));
  step3Elements.forEach((el) => el.classList.remove("active"));

  // Update progress bar
  if (step === 1) {
    progressFill.style.width = "0%";
  } else if (step === 2) {
    progressFill.style.width = "50%";
  } else if (step === 3) {
    progressFill.style.width = "100%";
  }

  // Show current form and update indicators
  if (step === 1) {
    step1Form.style.display = "block";
    step1Elements.forEach((el) => el.classList.add("active"));
    currentStep = 1;
  } else if (step === 2) {
    step2Form.style.display = "block";
    step2Elements.forEach((el) => el.classList.add("active"));
    currentStep = 2;
  } else if (step === 3) {
    step3Form.style.display = "block";
    step3Elements.forEach((el) => el.classList.add("active"));
    currentStep = 3;

    // Show verification info
    verificationInfo.style.display = "block";
    verificationEmail.textContent = formData.email;

    // Start resend cooldown
    startResendCooldown();
  }
}

// Save form data
function saveFormData() {
  formData.firstName = firstNameInput.value.trim();
  formData.lastName = lastNameInput.value.trim();
  formData.email = emailInput.value.trim();
  formData.username = usernameInput.value.trim();
  formData.password = passwordInput.value;
  formData.agreeTerms = agreeTermsCheckbox.checked;
}

// Resend email functionality
function startResendCooldown() {
  resendCooldown = 60; // 60 seconds cooldown
  resendLink.classList.add("disabled");
  updateResendCountdown();

  resendTimer = setInterval(() => {
    resendCooldown--;
    updateResendCountdown();

    if (resendCooldown <= 0) {
      clearInterval(resendTimer);
      resendLink.classList.remove("disabled");
      countdown.textContent = "";
    }
  }, 1000);
}

function updateResendCountdown() {
  countdown.textContent = `(${resendCooldown}s)`;
}

// Simulate sending verification email
function sendVerificationEmail() {
  showMessage(
    "info",
    `Verification email sent to ${formData.email}. Check your inbox.`,
  );

  // In a real application, this would make an API call to your backend
  // For demo purposes, we'll simulate the email sending
  console.log(`[DEMO] Verification email would be sent to: ${formData.email}`);
  console.log(
    `[DEMO] Email content: Verify your NexusChat account by clicking: http://localhost:3000/verify-email?token=DEMO_TOKEN_${formData.username}`,
  );

  // Show success message
  setTimeout(() => {
    showMessage(
      "success",
      "Verification email sent successfully! Please check your inbox.",
    );
  }, 1000);
}

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  createBackgroundAnimation();

  // Password visibility toggles
  passwordToggle.addEventListener("click", function () {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    this.innerHTML =
      type === "password"
        ? '<i class="fas fa-eye"></i>'
        : '<i class="fas fa-eye-slash"></i>';
  });

  confirmPasswordToggle.addEventListener("click", function () {
    const type =
      confirmPasswordInput.getAttribute("type") === "password"
        ? "text"
        : "password";
    confirmPasswordInput.setAttribute("type", type);
    this.innerHTML =
      type === "password"
        ? '<i class="fas fa-eye"></i>'
        : '<i class="fas fa-eye-slash"></i>';
  });

  // Real-time validation
  firstNameInput.addEventListener("input", validateFirstName);
  lastNameInput.addEventListener("input", validateLastName);
  emailInput.addEventListener("input", validateEmail);
  usernameInput.addEventListener("input", validateUsername);
  passwordInput.addEventListener("input", function () {
    updatePasswordStrength();
    validatePassword();
    if (confirmPasswordInput.value) validateConfirmPassword();
  });
  confirmPasswordInput.addEventListener("input", validateConfirmPassword);
  agreeTermsCheckbox.addEventListener("change", validateTerms);

  // Step 1 to Step 2
  nextStep1Button.addEventListener("click", function () {
    // Validate step 1 fields
    const isFirstNameValid = validateFirstName();
    const isLastNameValid = validateLastName();
    const isEmailValid = validateEmail();
    const isUsernameValid = validateUsername();

    if (
      isFirstNameValid &&
      isLastNameValid &&
      isEmailValid &&
      isUsernameValid
    ) {
      saveFormData();
      goToStep(2);
      showMessage(
        "success",
        "Personal information saved. Now set up your account.",
      );
    } else {
      showMessage("warning", "Please fix the errors before continuing.");
    }
  });

  // Step 2 back to Step 1
  prevStep2Button.addEventListener("click", function () {
    goToStep(1);
  });

  // Form submission (Step 2)
  document
    .getElementById("signupForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      // Validate all fields
      const isPasswordValid = validatePassword();
      const isConfirmPasswordValid = validateConfirmPassword();
      const isTermsValid = validateTerms();

      if (isPasswordValid && isConfirmPasswordValid && isTermsValid) {
        saveFormData();

        // Show loading state
        createAccountButton.disabled = true;
        createAccountButton.innerHTML =
          '<div class="loading"></div> Creating Account...';

        // Simulate API call to backend
        setTimeout(() => {
          // Simulate account creation in backend
          console.log(
            `[DEMO] Account created for: ${formData.username} (${formData.email})`,
          );
          console.log(
            `[DEMO] User data would be saved to PostgreSQL shard #${Math.floor(Math.random() * 5) + 1}`,
          );

          // Simulate sending verification email via Nodemailer
          sendVerificationEmail();

          // Move to verification step
          goToStep(3);

          // Reset button state
          createAccountButton.disabled = false;
          createAccountButton.innerHTML = "Create Account";
        }, 2000);
      } else {
        showMessage(
          "warning",
          "Please fix the errors before creating your account.",
        );
      }
    });

  // Resend verification email
  resendLink.addEventListener("click", function (e) {
    e.preventDefault();

    if (resendCooldown > 0) {
      showMessage(
        "warning",
        `Please wait ${resendCooldown} seconds before resending.`,
      );
      return;
    }

    // Show loading
    const originalText = resendLink.innerHTML;
    resendLink.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    // Simulate resending email
    setTimeout(() => {
      sendVerificationEmail();
      resendLink.innerHTML = originalText;
      startResendCooldown();
    }, 1000);
  });

  // Continue to login button
  continueToLoginButton.addEventListener("click", function () {
    alert(
      `DEMO: Email verification flow complete!\n\nIn a real application:\n1. User clicks verification link in email\n2. Backend verifies token with Nodemailer\n3. User is redirected to login page\n4. User can now log in with credentials\n\nTry logging in with:\nUsername: ${formData.username}\nPassword: ${formData.password}`,
    );

    // Reset form for demo purposes
    setTimeout(() => {
      document.getElementById("signupForm").reset();
      goToStep(1);

      // Clear all validation messages
      clearValidation(firstNameInput, firstNameValidation);
      clearValidation(lastNameInput, lastNameValidation);
      clearValidation(emailInput, emailValidation);
      clearValidation(usernameInput, usernameValidation);
      clearValidation(passwordInput, passwordValidation);
      clearValidation(confirmPasswordInput, confirmPasswordValidation);
      clearValidation(null, termsValidation);

      strengthFill.style.width = "0%";
      strengthText.textContent = "Password strength: Very weak";
      strengthText.style.color = "";

      verificationInfo.style.display = "none";

      showMessage(
        "success",
        "Demo complete! You can create another account to test the verification flow again.",
      );
    }, 500);
  });

  // Login link
  loginLink.addEventListener("click", function (e) {
    e.preventDefault();
    alert("In a real application, this would redirect to the login page.");
  });

  // Social login buttons
  document.querySelectorAll(".social-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const provider = this.classList.contains("google")
        ? "Google"
        : this.classList.contains("github")
          ? "GitHub"
          : "LinkedIn";
      showMessage(
        "success",
        `${provider} OAuth authentication would be implemented in production.`,
      );
    });
  });

  // Auto-fill demo data for presentation
  setTimeout(() => {
    if (!localStorage.getItem("signupDemoShown")) {
      firstNameInput.value = "John";
      lastNameInput.value = "Doe";
      emailInput.value = "john.doe@example.com";
      usernameInput.value = "johndoe";
      passwordInput.value = "NexusChat123!";
      confirmPasswordInput.value = "NexusChat123!";
      agreeTermsCheckbox.checked = true;

      // Trigger validation
      validateFirstName();
      validateLastName();
      validateEmail();
      validateUsername();
      updatePasswordStrength();
      validatePassword();
      validateConfirmPassword();
      validateTerms();

      showMessage(
        "info",
        "Demo data auto-filled. You can proceed through the signup and email verification flow.",
      );
      localStorage.setItem("signupDemoShown", "true");
    }
  }, 500);
});
