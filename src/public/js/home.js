// Navigation functions
function navigateToLogin() {
  window.location.href = "/admin/login";
}

function navigateToSignup() {
  window.location.href = "/admin/signup";
}

// Enhanced button interactions
document.addEventListener("DOMContentLoaded", function () {
  // Add subtle button interactions
  document.querySelectorAll(".action-btn").forEach((btn) => {
    btn.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-3px) scale(1.02)";
    });

    btn.addEventListener("mouseleave", function () {
      if (!this.classList.contains("active")) {
        this.style.transform = "translateY(0) scale(1)";
      }
    });

    // Add click animation
    btn.addEventListener("click", function () {
      this.style.transform = "translateY(-1px) scale(0.98)";
      setTimeout(() => {
        this.style.transform = "translateY(-3px) scale(1.02)";
      }, 150);
    });
  });

  // Add ripple effect to buttons
  document.querySelectorAll(".action-btn").forEach((button) => {
    button.addEventListener("click", function (e) {
      const ripple = document.createElement("span");
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // Add CSS for ripple animation
  const style = document.createElement("style");
  style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        .action-btn {
            position: relative;
            overflow: hidden;
        }
    `;
  document.head.appendChild(style);
});
