const API_URL = 'http://localhost:5000';

document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('contact-name').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const subject = document.getElementById('contact-subject').value.trim();
  const message = document.getElementById('contact-message').value.trim();

  try {
    const response = await fetch(`${API_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message })
    });

    const data = await response.json();

    if (response.ok) {
      showToast('Success', data.message, 4000);
      document.getElementById('contact-form').reset();
    } else {
      showToast('Error', data.message || 'Failed to send message.', 4000);
    }
  } catch (error) {
    console.error('Contact form error:', error);
    showToast('Error', 'An unexpected error occurred.', 4000);
  }
});
function showToast(title, message, duration = 4000) {
  // For example, creating a simple toast element:
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.innerHTML = `<strong>${title}:</strong> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, duration);
}
