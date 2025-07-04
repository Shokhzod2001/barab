// Login form handler
function handleLogin(event) {
  event.preventDefault(); // Prevent immediate form submission

  const form = event.target;
  const button = form.querySelector(".submit-btn");

  button.innerHTML = "Authenticating...";
  button.disabled = true;

  // Wait 0.5 seconds, then submit the form
  setTimeout(() => {
    form.submit(); // Triggers real POST to /admin/login
  }, 500);
}

// Social button handlers
document.addEventListener("DOMContentLoaded", function () {
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
  document.querySelectorAll(".submit-btn").forEach((btn) => {
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
  const name = document.querySelector('input[type="text"]').value;
  const password = document.querySelector('input[type="password"]').value;

  if (!name || !password) {
    alert("Please fill in all required fields.");
    return false;
  }

  return true;
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
