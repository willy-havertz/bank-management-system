const API_URL = 'http://localhost:5000';

// Utility function to disable form inputs during processing
function setFormDisabled(formId, disabled) {
  const form = document.getElementById(formId);
  if (form) {
    Array.from(form.elements).forEach(el => el.disabled = disabled);
  }
}

// Employee Signup
document.getElementById('employee-signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Retrieve and trim input values
  const name = document.getElementById('employee-signup-name').value.trim();
  const idNumber = document.getElementById('employee-signup-id').value.trim();
  const phone = document.getElementById('employee-signup-phone').value.trim();
  const email = document.getElementById('employee-signup-email').value.trim();
  const password = document.getElementById('employee-signup-password').value;
  const role = 'employee';

  // Basic client-side validation
  if (!name || !idNumber || !phone || !email || !password) {
    showToast("Error", "Please fill in all required fields.", 4000);
    return;
  }

  try {
    setFormDisabled('employee-signup-form', true);
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, idNumber, role })
    });
    const result = await response.json();
    showToast("Success", result.message, 4000);
    if (response.ok) {
      // Optionally clear the form and redirect to the employee auth page after a delay
      document.getElementById('employee-signup-form').reset();
      setTimeout(() => window.location.href = 'employee-auth.html', 4000);
    }
  } catch (error) {
    console.error('Signup error:', error);
    showToast("Error", "An error occurred during signup.", 4000);
  } finally {
    setFormDisabled('employee-signup-form', false);
  }
});

// Employee Login
document.getElementById('employee-login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('employee-login-email').value.trim();
  const password = document.getElementById('employee-login-password').value;

  if (!email || !password) {
    showToast("Error", "Please provide both email and password.", 4000);
    return;
  }

  try {
    setFormDisabled('employee-login-form', true);
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok) {
      // Ensure the user is an employee
      if (data.role === 'employee') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        window.location.href = 'employee.html';
      } else {
        showToast("Error", "Access denied. Not an employee account.", 4000);
      }
    } else {
      showToast("Error", data.message || "Login failed!", 4000);
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast("Error", "An error occurred during login.", 4000);
  } finally {
    setFormDisabled('employee-login-form', false);
  }
});
