const API_URL = 'http://localhost:5000';
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "customer") {
  window.location.href = "auth.html";
}

// Global variables to hold chart instances and user balance
let creditChart;
let spendingChart;
let userBalance = 0;

// Initialize the dashboard after DOM load
document.addEventListener("DOMContentLoaded", () => {
  showSection("overviewSection");
  initializeDashboard();
  loadTransactions();
  loadLoans();
  renderCharts();
  loadUserProfile();
});

// Section switching function
function showSection(sectionId) {
  const sections = [
    "overviewSection",
    "depositSection",
    "sendMoneySection",
    "transactionsSection",
    "loansSection"
  ];
  sections.forEach(id => {
    const section = document.getElementById(id);
    if (section) section.classList.add("d-none");
  });
  const activeSection = document.getElementById(sectionId);
  if (activeSection) activeSection.classList.remove("d-none");
  document.getElementById("pageTitle").textContent = getTitleForSection(sectionId);
}

function getTitleForSection(sectionId) {
  const titles = {
    overviewSection: "Overview",
    depositSection: "Deposit / Withdraw",
    sendMoneySection: "Send Money",
    transactionsSection: "Transaction History",
    loansSection: "Loan Management"
  };
  return titles[sectionId] || "";
}

// Initialize dashboard with API call
async function initializeDashboard() {
  try {
    const response = await fetch(`${API_URL}/api/user/overview`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    console.log("Dashboard data:", data);

    if (response.ok) {
      document.getElementById("cardHolderName").textContent = data.name;
      // Update balance element and store balance globally
      userBalance = parseFloat(data.balance);
      document.getElementById("balance").textContent = `Ksh ${userBalance.toFixed(2)}`;
      document.getElementById("phone").textContent = data.phone;
      document.getElementById("idNumber").textContent = data.idNumber;
      document.getElementById("networth").textContent = `Ksh ${parseFloat(data.networth).toFixed(2)}`;
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }
}

// Load transactions from API
async function loadTransactions() {
  try {
    const response = await fetch(`${API_URL}/api/transaction/transactions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const transactions = await response.json();
    const txList = document.getElementById("transactionList");
    txList.innerHTML = "";
    if (!transactions.length) {
      txList.innerHTML = '<li class="list-group-item text-muted">No transactions yet.</li>';
      return;
    }
    transactions.forEach(tx => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.textContent = `${tx.type}: Ksh ${parseFloat(tx.amount).toFixed(2)} on ${new Date(tx.date).toLocaleString()}`;
      txList.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading transactions:", error);
  }
}

// Load loans from API
async function loadLoans() {
  try {
    const response = await fetch(`${API_URL}/api/loan/loans`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const loans = await response.json();
    renderLoanHistory(loans);
  } catch (error) {
    console.error("Error loading loans:", error);
  }
}

function renderLoanHistory(loans) {
  const loanAccordion = document.getElementById("loanAccordion");
  loanAccordion.innerHTML = "";
  if (!loans.length) {
    loanAccordion.innerHTML = "<p class='text-muted text-center mt-3'>No loans applied yet.</p>";
    return;
  }
  loans.forEach((loan, index) => {
    const amountFormatted = parseFloat(loan.amount) ? parseFloat(loan.amount).toFixed(2) : "N/A";
    const item = document.createElement("div");
    item.className = "accordion-item";
    item.innerHTML = `
      <h2 class="accordion-header" id="heading${index}">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
          Loan ID: ${loan.id} - Ksh ${amountFormatted} (${loan.status})
        </button>
      </h2>
      <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#loanAccordion">
        <div class="accordion-body">
          <p><strong>Purpose:</strong> ${loan.purpose}</p>
          <p><strong>Date Applied:</strong> ${new Date(loan.date).toLocaleString()}</p>
          <p><strong>Status:</strong> ${loan.status}</p>
        </div>
      </div>
    `;
    loanAccordion.appendChild(item);
  });
}

// Process deposit or withdrawal transactions
async function processTransaction(type, amount) {
  amount = parseFloat(amount);
  if (isNaN(amount) || amount <= 0) {
    showToast("Error", "Enter a valid amount.", 3000);
    return;
  }
  const endpoint = type === "deposit" ? "deposit" : "withdraw";
  try {
    const res = await fetch(`${API_URL}/api/transaction/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ amount })
    });
    const result = await res.json();
    showToast("Success", result.message || `${type === "deposit" ? "Deposit" : "Withdrawal"} successful`, 3000);
    initializeDashboard();
    loadTransactions();
    renderCharts(); // Re-render charts after transaction
  } catch (error) {
    console.error(error);
    showToast("Error", "Transaction failed.", 3000);
  }
}

document.getElementById("depositForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = document.getElementById("depositAmount").value;
  processTransaction("deposit", amount);
});

document.getElementById("withdrawForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = document.getElementById("withdrawAmount").value;
  processTransaction("withdraw", amount);
});

// Process send money operation
document.getElementById("confirmSendBtn").addEventListener("click", async () => {
  const recipientEmail = document.getElementById("recipientEmail").value;
  const amount = parseFloat(document.getElementById("sendAmount").value);
  if (!recipientEmail || isNaN(amount) || amount <= 0) {
    showToast("Error", "Please enter a valid recipient and amount.", 3000);
    return;
  }
  try {
    const res = await fetch(`${API_URL}/api/transaction/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ recipientEmail, amount })
    });
    const result = await res.json();
    showToast("Success", result.message || `Sent Ksh ${amount.toFixed(2)} successfully`, 3000);
    loadTransactions();
    bootstrap.Modal.getInstance(document.getElementById("confirmSendModal")).hide();
  } catch (error) {
    console.error(error);
    showToast("Error", "Send money failed.", 3000);
  }
});

async function renderCharts() {
  // Render Credit Doughnut Chart with dynamic credit data
  try {
    const creditResponse = await fetch(`${API_URL}/api/dashboard-data/credit-data`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const creditData = await creditResponse.json();
    console.log("Dynamic Credit Data:", creditData);
    
    const creditCtx = document.getElementById("creditChart").getContext("2d");
    
    // Destroy the existing credit chart instance if it exists
    if (creditChart) {
      creditChart.destroy();
    }
    
    // Set available credit equal to the user's balance
    const available = userBalance;
    
    creditChart = new Chart(creditCtx, {
      type: "doughnut",
      data: {
        labels: ["Used", "Available"],
        datasets: [{
          data: [creditData.used, available],
          backgroundColor: ["#e63946", "#00adb5"]
        }]
      },
      options: { responsive: true, plugins: { legend: { position: "bottom" } } }
    });
  } catch (error) {
    console.error("Error fetching dynamic credit data:", error);
  }

  // Render the monthly spending bar chart and show insights
  try {
    const spendingResponse = await fetch(`${API_URL}/api/dashboard-data/monthly-spending`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const spendingData = await spendingResponse.json();
    console.log("Monthly Spending Data:", spendingData);
    const labels = spendingData.map(item => item.month);
    const dataValues = spendingData.map(item => item.totalSpending);
    const spendingCtx = document.getElementById("spendingChart").getContext("2d");
    
    // Destroy the existing spending chart instance if it exists
    if (spendingChart) {
      spendingChart.destroy();
    }
    
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

    // Calculate and display spending insights
    renderSpendingInsights(spendingData);
  } catch (error) {
    console.error("Error fetching monthly spending data:", error);
  }
}

// Function to calculate and display spending insights
function renderSpendingInsights(spendingData) {
  if (!spendingData || !spendingData.length) return;

  // Safely parse totalSpending for each item, defaulting to 0 if invalid
  spendingData = spendingData.map(item => ({
    ...item,
    totalSpending: parseFloat(item.totalSpending) || 0
  }));

  // Calculate total, average, highest, and lowest spending
  const totalSpending = spendingData.reduce((sum, item) => sum + item.totalSpending, 0);
  const averageSpending = totalSpending / spendingData.length;
  const highestMonthData = spendingData.reduce((max, item) => (item.totalSpending > max.totalSpending ? item : max), spendingData[0]);
  const lowestMonthData = spendingData.reduce((min, item) => (item.totalSpending < min.totalSpending ? item : min), spendingData[0]);

  const insightsInfo = `
    <p><strong>Total Spending:</strong> Ksh ${totalSpending.toFixed(2)}</p>
    <p><strong>Average Spending:</strong> Ksh ${averageSpending.toFixed(2)}</p>
    <p><strong>Highest Spending:</strong> Ksh ${highestMonthData.totalSpending.toFixed(2)} in ${highestMonthData.month}</p>
    <p><strong>Lowest Spending:</strong> Ksh ${lowestMonthData.totalSpending.toFixed(2)} in ${lowestMonthData.month}</p>
  `;
  
  // Ensure you have an element with id="spendingInsightsInfo" in your HTML
  const insightsContainer = document.getElementById("spendingInsightsInfo");
  if (insightsContainer) {
    insightsContainer.innerHTML = insightsInfo;
  }
}


// Function to fetch and display notifications
async function showNotifications() {
  try {
    const response = await fetch(`${API_URL}/api/notification`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const notifications = await response.json();
    console.log("Fetched notifications:", notifications);
    
    const notificationsBody = document.getElementById("notificationsBody");
    notificationsBody.innerHTML = "";
    if (!notifications || notifications.length === 0) {
      notificationsBody.innerHTML = "<p class='text-muted'>No new notifications.</p>";
    } else {
      notifications.forEach(notification => {
        const div = document.createElement("div");
        div.className = "notification-item p-2 border-bottom";
        div.textContent = notification.message;
        notificationsBody.appendChild(div);
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
      document.getElementById('profile-image').src = `${API_URL}/uploads/${data.profile_picture || 'default-avatar.png'}?t=${new Date().getTime()}`;
    } else {
      console.warn("Failed to load profile image:", data.message);
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
};

// Loan Application Event Listener
document.getElementById("loanForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const loanAmountInput = document.getElementById("loanAmount");
  const loanPurposeInput = document.getElementById("loanPurpose");
  const loanAmount = parseFloat(loanAmountInput.value);
  const loanPurpose = loanPurposeInput.value.trim();
  if (isNaN(loanAmount) || loanAmount <= 0 || !loanPurpose) {
    showToast("Error", "Please enter a valid loan amount and purpose.", 3000);
    return;
  }
  const payload = { loanAmount, purpose: loanPurpose };
  console.log("Loan payload:", payload);
  try {
    const response = await fetch(`${API_URL}/api/loan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (err) {
      console.error("Response is not valid JSON:", responseText);
      showToast("Error", "Unexpected response from server.", 3000);
      return;
    }
    if (response.ok) {
      showToast("Success", data.message || "Loan application submitted successfully!", 3000);
      loadLoans();
      e.target.reset();
    } else {
      console.error("Server error:", data.message);
      showToast("Error", data.message || "Loan application failed.", 3000);
    }
  } catch (error) {
    console.error("Error applying for loan:", error);
    showToast("Error", "An error occurred. Please try again later.", 3000);
  }
});
