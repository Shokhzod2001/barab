// Form handler for signup
function handleSignup(event) {
  event.preventDefault();
  const button = event.target.querySelector(".submit-btn");
  const originalText = button.innerHTML;
  button.innerHTML = "Creating Account...";
  button.disabled = true;

  // Simulate API call
  setTimeout(() => {
    alert(
      "Account created successfully! Please check your email for verification."
    );
    button.innerHTML = originalText;
    button.disabled = false;
    event.target.reset();
    // Reset image preview
    removeImage();
  }, 2500);
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
    });

    input.addEventListener("blur", function () {
      this.parentElement.style.transform = "translateY(0)";
    });
  });
});

// Image upload functionality
function triggerFileInput() {
  document.getElementById("logoUpload").click();
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  const preview = document.getElementById("imagePreview");

  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      alert("File size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      preview.innerHTML = `
                <img src="${e.target.result}" alt="Logo preview" class="preview-image">
                <button type="button" class="remove-image" onclick="removeImage()">×</button>
            `;
      preview.classList.add("has-image");
    };
    reader.readAsDataURL(file);
  }
}

function removeImage() {
  const preview = document.getElementById("imagePreview");
  const fileInput = document.getElementById("logoUpload");

  preview.innerHTML = `
        <div class="upload-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
            <p>Upload business logo</p>
            <span>PNG, JPG up to 5MB</span>
        </div>
    `;
  preview.classList.remove("has-image");
  fileInput.value = "";
}

// Form validation
function validateForm() {
  const inputs = document.querySelectorAll(".form-input[required]");
  let isValid = true;

  inputs.forEach((input) => {
    if (!input.value.trim()) {
      input.style.borderColor = "#ef4444";
      isValid = false;
    } else {
      input.style.borderColor = "#e5e7eb";
    }
  });

  // Email validation
  const emailInput = document.querySelector('input[type="email"]');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailInput && !emailRegex.test(emailInput.value)) {
    emailInput.style.borderColor = "#ef4444";
    isValid = false;
  }

  // Phone validation (Korean format)
  const phoneInput = document.querySelector('input[type="tel"]');
  const phoneRegex = /^(\+82|0)[\s-]?1[0-9][\s-]?[0-9]{4}[\s-]?[0-9]{4}$/;
  if (phoneInput && !phoneRegex.test(phoneInput.value.replace(/\s/g, ""))) {
    phoneInput.style.borderColor = "#ef4444";
    isValid = false;
  }

  // Password validation
  const passwordInput = document.querySelector('input[type="password"]');
  if (passwordInput && passwordInput.value.length < 8) {
    passwordInput.style.borderColor = "#ef4444";
    isValid = false;
  }

  return isValid;
}

// Real-time validation
document.addEventListener("DOMContentLoaded", function () {
  const inputs = document.querySelectorAll(".form-input");

  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      if (this.value.trim()) {
        this.style.borderColor = "#10b981";
      } else {
        this.style.borderColor = "#e5e7eb";
      }
    });
  });
});

// Auto-format phone number
document.addEventListener("DOMContentLoaded", function () {
  const phoneInput = document.querySelector('input[type="tel"]');

  if (phoneInput) {
    phoneInput.addEventListener("input", function (e) {
      let value = e.target.value.replace(/\D/g, "");

      if (value.startsWith("82")) {
        value = "+82 " + value.slice(2);
      } else if (value.startsWith("0")) {
        value = value.slice(1);
      }

      if (value.length >= 3) {
        value = value.slice(0, 3) + "-" + value.slice(3);
      }
      if (value.length >= 8) {
        value = value.slice(0, 8) + "-" + value.slice(8, 12);
      }

      e.target.value = value;
    });
  }
});

// Smooth scrolling for form
document.addEventListener("DOMContentLoaded", function () {
  const rightSection = document.querySelector(".right-section");

  // Auto-scroll to top when form loads
  if (rightSection) {
    rightSection.scrollTop = 0;
  }
});

// Loading animation for buttons
function showLoading(button, text = "Loading...") {
  const originalText = button.innerHTML;
  button.innerHTML = `
        <span style="display: inline-flex; align-items: center; gap: 8px;">
            <span style="width: 16px; height: 16px; border: 2px solid #ffffff40; border-top: 2px solid #ffffff; border-radius: 50%; animation: spin 1s linear infinite;"></span>
            ${text}
        </span>
    `;
  button.disabled = true;

  // Add CSS for spinner animation if not already present
  if (!document.querySelector("#spinner-style")) {
    const style = document.createElement("style");
    style.id = "spinner-style";
    style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
    document.head.appendChild(style);
  }

  return originalText;
}

function hideLoading(button, originalText) {
  button.innerHTML = originalText;
  button.disabled = false;
}
