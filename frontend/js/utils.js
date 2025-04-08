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

