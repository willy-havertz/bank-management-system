// Toast Notification Helper Function
function showToast(title, message, delay = 4000) {
  title = title.charAt(0).toUpperCase() + title.slice(1);
  const toastEl = document.getElementById("liveToast");
  const toastTitleEl = document.getElementById("toastTitle");
  const toastBodyEl = document.getElementById("toastBody");

  if (!toastEl || !toastTitleEl || !toastBodyEl) {
    console.error("Toast elements not found");
    return;
  }
  
  toastTitleEl.textContent = title;
  toastBodyEl.textContent = message;
  
  if (title.toLowerCase() === "error") {
    toastEl.classList.remove("bg-success");
    toastEl.classList.add("bg-danger");
  } else {
    toastEl.classList.remove("bg-danger");
    toastEl.classList.add("bg-success");
  }
  
  const toast = new bootstrap.Toast(toastEl, { autohide: true, delay });
  toast.show();
}

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Function to show the loading spinner
function showSpinner() {
  // Create or select an existing spinner overlay element
  let spinner = document.getElementById('spinnerOverlay');
  if (!spinner) {
    spinner = document.createElement('div');
    spinner.id = 'spinnerOverlay';
    spinner.className = 'spinner-overlay';
    spinner.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(spinner);
  }
  spinner.style.display = 'flex';
}

// Function to hide the loading spinner
function hideSpinner() {
  const spinner = document.getElementById('spinnerOverlay');
  if (spinner) {
    spinner.style.display = 'none';
  }
}

// Example usage during section transition
function showSectionWithSpinner(sectionId, event) {
  showSpinner();
  // Simulate loading delay (remove this delay in production)
  setTimeout(() => {
    // Call your existing section transition logic (slide animations)
    showEmployeeSection(sectionId, event);  // or showCustomerSection, depending on dashboard
    hideSpinner();
  }, 500);
}
