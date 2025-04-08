const API_URL = 'https://bank-management-system-backend.onrender.com';
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

console.log("Token:", token, "Role:", role);
if (!token || role !== "employee") {
  console.warn("User not authenticated or not an employee. Redirecting to employee-auth.html");
  window.location.href = "employee-auth.html";
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");
  initializeEmployeeDashboard();
  loadUserProfile(); // Load profile image and details
});

// Initialize dashboard by fetching overview data
async function initializeEmployeeDashboard() {
  console.log("Initializing employee dashboard...");
  try {
    const response = await fetch(`${API_URL}/api/user/overview`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Dashboard response status:", response.status);
    if (!response.ok) throw new Error("Failed to load dashboard data");
    const data = await response.json();
    console.log("Dashboard data:", data);

    // Update DOM elements with dashboard data
    const profileNameEl = document.getElementById("profileName");
    if (profileNameEl) profileNameEl.textContent = data.name;
    
    const profileEmailEl = document.getElementById("profileEmail");
    if (profileEmailEl) profileEmailEl.textContent = data.email;
    
    const totalTransactionsEl = document.getElementById("totalTransactions");
    if (totalTransactionsEl) totalTransactionsEl.textContent = data.totalTransactions;
    
    const pendingLoansEl = document.getElementById("pendingLoans");
    if (pendingLoansEl) pendingLoansEl.textContent = data.pendingLoans;
    
    const balanceEl = document.getElementById("balance");
    if (balanceEl) {
      const balance = parseFloat(data.balance);
      balanceEl.textContent = isNaN(balance) ? "Ksh 0.00" : `Ksh ${balance.toFixed(2)}`;
    }
    
    const phoneEl = document.getElementById("phone");
    if (phoneEl) phoneEl.textContent = data.phone;
    
    const idNumberEl = document.getElementById("idNumber");
    if (idNumberEl) idNumberEl.textContent = data.idNumber;
    
    const networthEl = document.getElementById("networth");
    if (networthEl) {
      const networth = parseFloat(data.networth);
      networthEl.textContent = isNaN(networth) ? "Ksh 0.00" : `Ksh ${networth.toFixed(2)}`;
    }
    
    // NEW: Display total number of customer transactions
    const totalCustomerTransactionsEl = document.getElementById("totalCustomerTransactions");
    if (totalCustomerTransactionsEl) {
      totalCustomerTransactionsEl.textContent = data.totalCustomerTransactions;
    }
    
    // NEW: Display total number of customer loans
    const totalCustomerLoansEl = document.getElementById("totalCustomerLoans");
    if (totalCustomerLoansEl) {
      totalCustomerLoansEl.textContent = data.totalCustomerLoans;
    }
    
    // Load additional sections if available
    if (typeof renderCustomerAccounts === 'function') {
      console.log("Rendering customer accounts");
      renderCustomerAccounts();
    }
    if (typeof renderEmployeeTransactions === 'function') {
      console.log("Rendering employee transactions");
      renderEmployeeTransactions();
    }
    if (typeof renderLoanRequests === 'function') {
      console.log("Rendering loan requests");
      renderLoanRequests();
    }
    if (typeof renderEmployeeCharts === 'function') {
      console.log("Rendering employee charts");
      renderEmployeeCharts();
    }
    if (typeof loadDashboardOverview === 'function') {
      console.log("Loading dashboard overview counts");
      loadDashboardOverview();
    }
    
    showEmployeeSection("empOverview");
  } catch (error) {
    console.error("Error initializing dashboard:", error);
    showToast("Error", "Failed to load dashboard data.", 4000);
  }
}

// Function to show a specific section by ID
function showEmployeeSection(sectionId) {
  console.log("Switching to section:", sectionId);
  const sections = ["empOverview", "empCustomers", "empTransactions", "empLoans", "empProfile"];
  sections.forEach(id => {
    const section = document.getElementById(id);
    if (section) section.classList.add("d-none");
  });
  const activeSection = document.getElementById(sectionId);
  if (activeSection) activeSection.classList.remove("d-none");
  const titles = {
    empOverview: "Overview",
    empCustomers: "Customer Accounts",
    empTransactions: "Transactions",
    empLoans: "Loan Approvals",
    empProfile: "Profile"
  };
  const pageTitleEl = document.getElementById("pageTitle");
  if (pageTitleEl) pageTitleEl.textContent = titles[sectionId] || "";
}

// Render customer accounts list
async function renderCustomerAccounts() {
  console.log("Loading customer accounts...");
  try {
    const response = await fetch(`${API_URL}/api/customer/accounts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Customer accounts response status:", response.status);
    const customers = await response.json();
    console.log("Customer accounts data:", customers);
    const customerList = document.getElementById("customerList");
    customerList.innerHTML = "";
    if (!customers.length) {
      customerList.innerHTML = "<p class='text-muted text-center'>No customer accounts available.</p>";
      return;
    }
    customers.forEach(customer => {
      const div = document.createElement("div");
      div.className = "mb-3 p-3 border rounded";
      const balance = parseFloat(customer.balance);
      const formattedBalance = isNaN(balance) ? "0.00" : balance.toFixed(2);
      div.innerHTML = `<strong>${customer.name}</strong> - Balance: Ksh ${formattedBalance}`;
      customerList.appendChild(div);
    });
  } catch (error) {
    console.error("Error loading customer accounts:", error);
    showToast("Error", "Failed to load customer accounts.", 4000);
  }
}

// Render all employee transactions (all customer transactions)
async function renderEmployeeTransactions() {
  console.log("Loading employee transactions...");
  try {
    // Using /api/transaction/all endpoint to get all transactions
    const response = await fetch(`${API_URL}/api/transaction/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Transactions response status:", response.status);
    const transactions = await response.json();
    console.log("Transactions data:", transactions);
    const txList = document.getElementById("empTransactionList");
    txList.innerHTML = "";
    if (!transactions.length) {
      txList.innerHTML = '<li class="list-group-item text-muted">No transactions recorded.</li>';
      return;
    }
    transactions.forEach(tx => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      const amount = parseFloat(tx.amount);
      const formattedAmount = isNaN(amount) ? "0.00" : amount.toFixed(2);
      li.textContent = `${tx.type}: Ksh ${formattedAmount} on ${new Date(tx.date).toLocaleString()}`;
      txList.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading transactions:", error);
    showToast("Error", "Failed to load transactions.", 4000);
  }
}

// Render pending loan requests
async function renderLoanRequests() {
  console.log("Loading pending loan requests...");
  try {
    const response = await fetch(`${API_URL}/api/loan/pending-loans`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Loan requests response status:", response.status);
    const loans = await response.json();
    console.log("Pending loans:", loans);
    if (!loans || loans.length === 0) {
      document.getElementById("loanAccordion").innerHTML = "<p class='text-muted text-center mt-3'>No pending loan requests.</p>";
      return;
    }
    renderLoanHistory(loans);
  } catch (error) {
    console.error("Error loading pending loans:", error);
    showToast("Error", "Failed to load pending loans.", 4000);
  }
}

// Render loan history in accordion format with approve/reject buttons
function renderLoanHistory(loans) {
  console.log("Rendering loan history with", loans.length, "loans.");
  const loanAccordion = document.getElementById("loanAccordion");
  loanAccordion.innerHTML = ""; // Clear previous items
  loans.forEach((loan, index) => {
    const amount = parseFloat(loan.amount);
    const formattedAmount = isNaN(amount) ? "0.00" : amount.toFixed(2);
    const loanItem = document.createElement("div");
    loanItem.className = "accordion-item";
    loanItem.innerHTML = `
      <h2 class="accordion-header" id="empHeading${index}">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#empCollapse${index}" aria-expanded="false" aria-controls="empCollapse${index}">
          Loan ID: ${loan.id} - Ksh ${formattedAmount} (${loan.status})
        </button>
      </h2>
      <div id="empCollapse${index}" class="accordion-collapse collapse" aria-labelledby="empHeading${index}" data-bs-parent="#loanAccordion">
        <div class="accordion-body">
          <p><strong>Purpose:</strong> ${loan.purpose}</p>
          <p><strong>Date Applied:</strong> ${new Date(loan.date).toLocaleString()}</p>
          <p><strong>Status:</strong> ${loan.status}</p>
          <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-success btn-sm" onclick="approveLoan('${loan.id}')">Approve</button>
            <button class="btn btn-danger btn-sm" onclick="rejectLoan('${loan.id}')">Reject</button>
          </div>
        </div>
      </div>
    `;
    loanAccordion.appendChild(loanItem);
  });
}

// Refresh pending loans list
function loadPendingLoans() {
  renderLoanRequests();
}

// Loan approval function
async function approveLoan(loanId) {
  try {
    const response = await fetch(`${API_URL}/api/loan/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ loanId })
    });
    const textResponse = await response.text();
    console.log("Raw Response:", textResponse);
    const data = JSON.parse(textResponse);
    if (response.ok) {
      showToast("Success", data.message || "Loan approved!", 3000);
      loadPendingLoans(); // Reload pending loans
      loadLoans(); // Placeholder if user loans need reloading
    } else {
      showToast("Error", data.message || "Approval failed.", 3000);
    }
  } catch (error) {
    console.error("Error approving loan:", error);
    showToast("Error", "Something went wrong.", 3000);
  }
}

// Loan rejection function
async function rejectLoan(loanId) {
  try {
    const response = await fetch(`${API_URL}/api/loan/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ loanId })
    });
    const textResponse = await response.text();
    console.log("Raw Response:", textResponse);
    const data = JSON.parse(textResponse);
    if (response.ok) {
      showToast("Success", data.message || "Loan rejected!", 3000);
      loadPendingLoans(); // Reload pending loans
      loadLoans(); // Placeholder if user loans need reloading
    } else {
      showToast("Error", data.message || "Rejection failed.", 3000);
    }
  } catch (error) {
    console.error("Error rejecting loan:", error);
    showToast("Error", "Something went wrong.", 3000);
  }
}

// Placeholder function for reloading user loans
function loadLoans() {
  console.log("Reloading user loans...");
}

async function renderEmployeeCharts() {
  // Fetch aggregated credit data for employees
  try {
    const creditResponse = await fetch(`${API_URL}/api/dashboard-data/employee-credit-data`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const creditData = await creditResponse.json();
    console.log("Employee Aggregated Credit Data:", creditData);
    
    // Now creditData contains: { totalAvailable: <sum of customer balances>, totalCreditUsage: <sum of withdrawals and sends> }
    const creditCtx = document.getElementById("creditChart").getContext("2d");
    
    // Create a new Chart.js doughnut chart with the aggregated data
    creditChart = new Chart(creditCtx, {
      type: "doughnut",
      data: {
        labels: ["Total Available", "Total Credit Usage"],
        datasets: [{
          data: [creditData.totalAvailable, creditData.totalCreditUsage],
          backgroundColor: ["#00adb5", "#e63946"]
        }]
      },
      options: { responsive: true, plugins: { legend: { position: "bottom" } } }
    });
  } catch (error) {
    console.error("Error fetching employee credit data:", error);
  }
  
  // Render the monthly spending bar chart (if applicable)
  try {
    const spendingResponse = await fetch(`${API_URL}/api/dashboard-data/monthly-spending`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const spendingData = await spendingResponse.json();
    console.log("Monthly Spending Data:", spendingData);
    const labels = spendingData.map(item => item.month);
    const dataValues = spendingData.map(item => item.totalSpending);
    const spendingCtx = document.getElementById("spendingChart").getContext("2d");
    spendingChart = new Chart(spendingCtx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Spending",
          data: dataValues,
          backgroundColor: "#8a42f5"
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
  } catch (error) {
    console.error("Error fetching monthly spending data:", error);
  }
}

// Function to fetch and display employee notifications in a modal
async function showNotifications() {
  try {
    const response = await fetch(`${API_URL}/api/notification/employee`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    // If the response is an object with a 'notifications' property, extract it.
    const notifications = Array.isArray(data) ? data : (data.notifications || []);
    console.log("Employee Notifications:", notifications);
    
    const notificationsBody = document.getElementById("notificationsBody");
    notificationsBody.innerHTML = "";
    
    if (!notifications.length) {
      notificationsBody.innerHTML = "<p class='text-muted'>No new notifications.</p>";
    } else {
      notifications.forEach(notification => {
        const notifItem = document.createElement("div");
        notifItem.className = "notification-item p-2 border-bottom";
        notifItem.innerHTML = `<strong>${notification.message}</strong>
          <small class="text-muted d-block">${new Date(notification.date).toLocaleString()}</small>`;
        notificationsBody.appendChild(notifItem);
      });
    }
    
    const notificationsModalEl = document.getElementById("notificationsModal");
    if (notificationsModalEl) {
      const notificationsModal = new bootstrap.Modal(notificationsModalEl);
      notificationsModal.show();
    } else {
      console.error("Notifications modal element not found.");
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
    showToast("Error", "Failed to load notifications.", 3000);
  }
}

// Load dashboard overview counts (pending loans, total transactions)
async function loadDashboardOverview() {
  try {
    const response = await fetch(`${API_URL}/api/dashboard/overview`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Failed to load overview data");
    const data = await response.json();
    console.log("Dashboard overview data:", data);
    const pendingLoansEl = document.getElementById("pendingLoans");
    if (pendingLoansEl) pendingLoansEl.textContent = data.pendingLoans;
    const totalTransactionsEl = document.getElementById("totalTransactions");
    if (totalTransactionsEl) totalTransactionsEl.textContent = data.totalTransactions;
  } catch (error) {
    console.error("Error loading dashboard overview:", error);
    showToast("Error", "Failed to load dashboard overview.", 4000);
  }
}

// Show toast notifications
function showToast(title, message, delay = 4000) {
  console.log(`Showing toast: ${title} - ${message}`);
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
  const toast = new bootstrap.Toast(toastEl, { autohide: true, delay });
  toast.show();
}

// Profile picture upload form submission
document.getElementById('profile-picture-form').addEventListener('submit', async (e) => {
  console.log("Profile picture form submitted");
  e.preventDefault();
  const fileInput = document.getElementById('profile-pic');
  const file = fileInput.files[0];
  if (!file) {
    console.warn("No file selected for profile picture upload.");
    showToast("Error", "Please select a file to upload.", 3000);
    return;
  }
  const formData = new FormData();
  formData.append('profilePic', file);
  try {
    const response = await fetch(`${API_URL}/api/user/upload-profile`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    console.log("Profile picture upload response status:", response.status);
    const data = await response.json();
    if (response.ok) {
      showToast("Success", "Profile picture updated successfully!", 3000);
      // Append a timestamp to bypass the browser cache
      document.getElementById('profile-image').src = `${API_URL}/uploads/${data.filename}?t=${new Date().getTime()}`;
    } else {
      console.warn("Profile picture upload failed:", data.message);
      showToast("Error", data.message || "Failed to update profile picture.", 3000);
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    showToast("Error", "An error occurred. Please try again later.", 3000);
  }
});

// Load user profile data (profile picture)
const loadUserProfile = async () => {
  console.log("Loading user profile...");
  try {
    const response = await fetch(`${API_URL}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("User profile response status:", response.status);
    const data = await response.json();
    console.log("User profile data:", data);
    if (response.ok) {
      // Append a timestamp to bypass cache when loading the image
      document.getElementById('profile-image').src = `${API_URL}/uploads/${data.profile_picture || 'default-avatar.png'}?t=${new Date().getTime()}`;
    } else {
      console.warn("Failed to load profile image:", data.message);
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
};

// Initialize additional functions on page load
document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();
  renderCustomerAccounts();
  renderEmployeeTransactions();
  loadDashboardOverview();
  renderLoanRequests();
});

// Sidebar toggle for mobile devices
const sidebarOpenBtn = document.getElementById('sidebarOpen');
const sidebarCloseBtn = document.getElementById('sidebarClose');
const sidebar = document.getElementById('sidebar');

if (sidebarOpenBtn) {
  sidebarOpenBtn.addEventListener('click', () => {
    sidebar.classList.add('active');
  });
}
if (sidebarCloseBtn) {
  sidebarCloseBtn.addEventListener('click', () => {
    sidebar.classList.remove('active');
  });
}

// Show employee section with fade animations and active link highlighting
function showEmployeeSection(sectionId, event) {
  const sections = ['empOverview', 'empCustomers', 'empTransactions', 'empLoans'];

  // Fade out currently visible sections
  sections.forEach(id => {
    const section = document.getElementById(id);
    if (section && !section.classList.contains('d-none')) {
      section.classList.add('fade-out');
      setTimeout(() => {
        section.classList.add('d-none');
        section.classList.remove('fade-out');
      }, 300);
    }
  });

  // After fade out, show the selected section with fade in
  setTimeout(() => {
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
      activeSection.classList.remove('d-none');
      activeSection.classList.add('fade-in');
      setTimeout(() => activeSection.classList.remove('fade-in'), 300);
    }
  }, 300);

  // Update page title based on selected section
  const titles = {
    empOverview: 'Overview',
    empCustomers: 'Customers',
    empTransactions: 'Transactions',
    empLoans: 'Loan Approvals'
  };
  document.getElementById('pageTitle').textContent = titles[sectionId] || 'Dashboard';

  // Highlight active sidebar link
  document.querySelectorAll('.sidebar .nav-link').forEach(link => link.classList.remove('active'));
  if (event && event.currentTarget) {
    const link = event.currentTarget.querySelector('.nav-link');
    if (link) {
      link.classList.add('active');
    }
  }

  // On small screens, hide sidebar after selecting a section
  if (window.innerWidth <= 768) {
    sidebar.classList.remove('active');
  }
}

// Example Support function
function showSupport() {
  alert("Support details here.");
}
