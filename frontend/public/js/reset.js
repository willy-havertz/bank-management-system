const API_URL = "https://bank-management-system-backend.onrender.com";



// Determine if a reset token exists in the URL
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  const forgotForm = document.getElementById("forgot-form");
  const resetForm = document.getElementById("reset-form");
  const formTitle = document.getElementById("formTitle");

  if (token) {
    // Show reset form if token is present
    resetForm.classList.remove("d-none");
    document.getElementById("reset-token").value = token;
    formTitle.textContent = "Reset Your Password";
  } else {
    // Show forgot form if token is absent
    forgotForm.classList.remove("d-none");
    formTitle.textContent = "Forgot Password?";
  }
});

// Forgot Password Submission
document.getElementById("forgot-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("forgot-email").value.trim();

  try {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (response.ok) {
      showToast("Success", data.message, 4000);
    } else {
      showToast("Error", data.message || "Failed to send reset link.", 4000);
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    showToast("Error", "Something went wrong. Please try again later.", 4000);
  }
});

// Reset Password Submission
document.getElementById("reset-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = document.getElementById("reset-token").value;
  const newPassword = document.getElementById("new-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  
  if (newPassword !== confirmPassword) {
    showToast("Error", "Passwords do not match.", 4000);
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await response.json();
    if (response.ok) {
      showToast("Success", "Password reset successful! Redirecting to login...", 4000);
      setTimeout(() => window.location.href = '/auth.html', 4000);
    } else {
      showToast("Error", data.message || "Failed to reset password.", 4000);
    }
  } catch (error) {
    console.error("Reset password error:", error);
    showToast("Error", "Something went wrong. Please try again later.", 4000);
  }
});
function showToast(title, message, delay = 4000) {
  const toastEl = document.getElementById("liveToast");
  const toastTitleEl = document.getElementById("toastTitle");
  const toastBodyEl = document.getElementById("toastBody");
  if (!toastEl || !toastTitleEl || !toastBodyEl) {
    console.error("Toast elements not found");
    return;
  }
  toastTitleEl.textContent = title;
  toastBodyEl.textContent = message;
  const toast = new bootstrap.Toast(toastEl, { autohide: true, delay });
  toast.show();
}
