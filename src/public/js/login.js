// Form navigation functions
function showForm(type) {
  document.getElementById("actionSelector").style.display = "none";
  document.getElementById("loginForm").classList.remove("active");

  if (type === "login") {
    document.getElementById("loginForm").classList.add("active");
  }
}

function showSelector() {
  document.getElementById("actionSelector").style.display = "block";
  document.getElementById("loginForm").classList.remove("active");
}

// Login form handler
function handleLogin(event) {
  event.preventDefault();
  const button = event.target.querySelector(".submit-btn");
  const originalText = button.innerHTML;
  button.innerHTML = "Authenticating...";
  button.disabled = true;

  setTimeout(() => {
    alert("Login successful! Redirecting to admin dashboard...");
    button.innerHTML = originalText;
    button.disabled = false;
    // Here you would typically redirect to the dashboard
    // window.location.href = '/dashboard';
  }, 2000);
}

// Social button handlers
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".social-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const provider = this.textContent.includes("Google")
        ? "Google"
        : "KakaoTalk";
      alert(
        `${provider} integration available in enterprise plans. Contact support for setup.`
      );
    });
  });

  // Enhanced form interactions
  document.querySelectorAll(".form-input").forEach((input) => {
    input.addEventListener("focus", function () {
      this.parentElement.style.transform = "translateY(-2px)";
      this.parentElement.style.transition = "transform 0.3s ease";
    });

    input.addEventListener("blur", function () {
      this.parentElement.style.transform = "translateY(0)";
    });
  });

  // Add subtle button interactions
  document.querySelectorAll(".action-btn, .submit-btn").forEach((btn) => {
    btn.addEventListener("mouseenter", function () {
      if (!this.disabled) {
        this.style.transform = "translateY(-3px) scale(1.02)";
      }
    });

    btn.addEventListener("mouseleave", function () {
      if (!this.disabled) {
        this.style.transform = "translateY(0) scale(1)";
      }
    });
  });
});

// Add form validation
function validateForm() {
  const email = document.querySelector('input[type="email"]').value;
  const password = document.querySelector('input[type="password"]').value;

  if (!email || !password) {
    alert("Please fill in all required fields.");
    return false;
  }

  if (!isValidEmail(email)) {
    alert("Please enter a valid email address.");
    return false;
  }

  return true;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Add keyboard shortcuts
document.addEventListener("keydown", function (event) {
  // Enter key to submit form when focused on input
  if (event.key === "Enter" && event.target.classList.contains("form-input")) {
    const form = event.target.closest("form");
    if (form) {
      form.dispatchEvent(new Event("submit"));
    }
  }
});
