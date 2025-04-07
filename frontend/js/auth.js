const API_URL = 'https://bank-management-system-backend.onrender.com';

// Utility function to disable form inputs during processing (optional)
function setFormDisabled(formId, disabled) {
  const form = document.getElementById(formId);
  if (form) {
    Array.from(form.elements).forEach(el => el.disabled = disabled);
  }
}

// Customer Signup
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Retrieve input values
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const phone = document.getElementById('signup-phone').value.trim();
  const idNumber = document.getElementById('signup-id').value.trim();
  const role = 'customer';

  // Basic client-side validation
  if (!name || !email || !password || !phone || !idNumber) {
    showToast("Error", "Please fill in all required fields.", 4000);
    return;
  }

  try {
    // Optionally disable the form to prevent duplicate submissions
    setFormDisabled('signup-form', true);

    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, idNumber, role })
    });
    const result = await response.json();

    if (response.ok) {
      showToast("Success", result.message, 4000);
      // Clear the form after successful registration
      document.getElementById('signup-form').reset();
      setTimeout(() => window.location.href = 'auth.html', 4000);
    } else {
      showToast("Error", result.message || "Signup failed!", 4000);
    }
  } catch (error) {
    console.error('Signup error:', error);
    showToast("Error", "An error occurred during signup.", 4000);
  } finally {
    setFormDisabled('signup-form', false);
  }
});

// Customer Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showToast("Error", "Please provide both email and password.", 4000);
    return;
  }

  try {
    // Disable the login form during processing
    setFormDisabled('login-form', true);

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      // Redirect based on role (customer or employee)
      window.location.href = data.role === 'employee' ? 'employee.html' : 'dashboard.html';
    } else {
      showToast("Error", data.message || "Login failed!", 4000);
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast("Error", "An error occurred during login.", 4000);
  } finally {
    setFormDisabled('login-form', false);
  }
});
