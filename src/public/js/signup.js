// Form handler for signup
function handleSignup(event) {
  event.preventDefault();

  // Show loading state
  const button = event.target.querySelector(".submit-btn");
  const originalText = button.innerHTML;
  button.innerHTML = "Creating Account...";
  button.disabled = true;

  // Create FormData and submit
  const formData = new FormData(event.target);

  fetch("/admin/signup", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (response.ok) {
        // Redirect or show success message
        window.location.href = "/admin/product/all";
      } else {
        throw new Error("Signup failed");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Signup failed. Please try again.");
    })
    .finally(() => {
      // Reset button state
      button.innerHTML = originalText;
      button.disabled = false;
    });
}

// Form validation
function validateForm() {
  let isValid = true;

  // Name validation
  const name = document.getElementById("name");
  if (!name.value.trim()) {
    showError(name, "Please enter your name");
    isValid = false;
  } else {
    hideError(name);
  }

  // Phone validation
  const phone = document.getElementById("phone");
  const phoneRegex = /^(\+82|0)[\s-]?1[0-9][\s-]?[0-9]{4}[\s-]?[0-9]{4}$/;
  if (!phoneRegex.test(phone.value.replace(/\s/g, ""))) {
    showError(phone, "Please enter a valid Korean phone number");
    isValid = false;
  } else {
    hideError(phone);
  }

  // Password validation
  const password = document.getElementById("password");
  if (password.value.length < 8) {
    showError(password, "Password must be at least 8 characters");
    isValid = false;
  } else {
    hideError(password);
  }

  // Repeat password validation
  const repeatPassword = document.getElementById("repeatPassword");
  if (password.value !== repeatPassword.value) {
    showError(repeatPassword, "Passwords do not match");
    isValid = false;
  } else {
    hideError(repeatPassword);
  }

  return isValid;
}

function showError(input, message) {
  const errorElement = document.getElementById(input.id + "Error");
  input.classList.add("error");
  input.classList.remove("valid");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add("show");
  }
}

function hideError(input) {
  const errorElement = document.getElementById(input.id + "Error");
  input.classList.remove("error");
  input.classList.add("valid");
  if (errorElement) {
    errorElement.classList.remove("show");
  }
}

// Image upload functionality
function triggerFileInput() {
  document.getElementById("profileUpload").click();
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  const preview = document.getElementById("imagePreview");

  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      preview.innerHTML = `
        <img src="${e.target.result}" alt="Profile preview" class="preview-image">
        <button type="button" class="remove-image" onclick="removeImage()">×</button>
      `;
      preview.classList.add("has-image");
    };
    reader.readAsDataURL(file);
  }
}

function removeImage() {
  const preview = document.getElementById("imagePreview");
  const fileInput = document.getElementById("profileUpload");

  preview.innerHTML = `
    <div class="upload-placeholder">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="9" cy="9" r="2"/>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
      </svg>
      <p>Upload profile picture</p>
      <span>PNG, JPG up to 5MB</span>
    </div>
  `;
  preview.classList.remove("has-image");
  fileInput.value = "";
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Real-time password matching
  const password = document.getElementById("password");
  const repeatPassword = document.getElementById("repeatPassword");

  if (repeatPassword) {
    repeatPassword.addEventListener("input", function () {
      if (password.value && repeatPassword.value) {
        if (password.value === repeatPassword.value) {
          hideError(repeatPassword);
        } else {
          showError(repeatPassword, "Passwords do not match");
        }
      }
    });
  }
});
