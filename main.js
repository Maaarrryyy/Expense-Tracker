// DOM Elements
const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income-total");
const expenseEl = document.getElementById("expense-total");
const transactionFormEl = document.getElementById("transaction-form");
const transactionTypeEl = document.getElementById("transaction-type");
const descriptionEl = document.getElementById("description");
const amountEl = document.getElementById("amount");
const categoryEl = document.getElementById("category");
const dateEl = document.getElementById("date");
const transactionListEl = document.getElementById("transaction-list");
const filterEl = document.getElementById("filter");
const notificationEl = document.getElementById("notification");
const notificationMessageEl = document.getElementById("notification-message");

// Set default date to today
dateEl.valueAsDate = new Date();

// Initialize transactions from localStorage or empty array
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Initialize the app
function init() {
  updateCategoryOptions();
  updateTransactionList();
  updateSummary();
}

// Update category options based on transaction type
function updateCategoryOptions() {
  const transactionType = transactionTypeEl.value;
  const categories = categoryEl.options;

  for (let i = 0; i < categories.length; i++) {
    const option = categories[i];
    if (option.value === "") continue;
    option.style.display =
      transactionType === "income"
        ? option.classList.contains("income-category")
          ? "block"
          : "none"
        : option.classList.contains("expense-category")
        ? "block"
        : "none";
  }
  categoryEl.value = "";
}

// Generate unique ID
function generateID() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

// Format date
function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Format amount
function formatAmount(amount) {
  return `₹${amount.toFixed(2)}`;
}

// Show notification
function showNotification(message, type = "success") {
  notificationMessageEl.textContent = message;
  notificationEl.className = "notification show";
  notificationEl.style.borderLeft =
    type === "error"
      ? "5px solid var(--expense-color)"
      : "5px solid var(--income-color)";
  setTimeout(() => {
    notificationEl.className = "notification";
  }, 3000);
}

// Add transaction to DOM
function addTransactionToDOM(transaction) {
  const { id, type, description, amount, category, date } = transaction;
  const listItem = document.createElement("li");
  listItem.classList.add(type);
  listItem.dataset.id = id;

  listItem.innerHTML = `
        <div class="transaction-details">
            <span class="transaction-description">${description}</span>
            <div class="transaction-meta">
                <span>${formatDate(date)}</span>
                <span class="category-tag">${category}</span>
            </div>
        </div>
        <span class="transaction-amount">${formatAmount(amount)}</span>
        <button class="delete-btn"><i class="fas fa-trash"></i></button>
    `;

  listItem
    .querySelector(".delete-btn")
    .addEventListener("click", () => removeTransaction(id));
  transactionListEl.appendChild(listItem);
}

// Update transaction list
function updateTransactionList() {
  transactionListEl.innerHTML = "";
  const filterValue = filterEl.value;
  const filtered = transactions
    .filter((t) => filterValue === "all" || t.type === filterValue)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (filtered.length === 0) {
    transactionListEl.innerHTML =
      '<p class="empty-message">No transactions found</p>';
    return;
  }
  filtered.forEach(addTransactionToDOM);
}

// Update summary
function updateSummary() {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;

  balanceEl.textContent = formatAmount(balance);
  incomeEl.textContent = formatAmount(income);
  expenseEl.textContent = formatAmount(expense);

  balanceEl.className = "balance";
  if (balance > 0) balanceEl.classList.add("money", "plus");
  else if (balance < 0) balanceEl.classList.add("money", "minus");
}

// Validate form
function validateForm() {
  if (!descriptionEl.value.trim()) {
    showNotification("Please enter a description", "error");
    return false;
  }
  if (!amountEl.value || parseFloat(amountEl.value) <= 0) {
    showNotification("Please enter a valid amount", "error");
    return false;
  }
  if (!categoryEl.value) {
    showNotification("Please select a category", "error");
    return false;
  }
  if (!dateEl.value) {
    showNotification("Please select a date", "error");
    return false;
  }
  return true;
}

// Add transaction
function addTransaction(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const transaction = {
    id: generateID(),
    type: transactionTypeEl.value,
    description: descriptionEl.value.trim(),
    amount: parseFloat(amountEl.value),
    category: categoryEl.value,
    date: dateEl.value,
  };

  transactions.push(transaction);
  updateLocalStorage();
  updateTransactionList();
  updateSummary();
  resetForm();
  showNotification("Transaction added successfully!");
}

// Remove transaction
function removeTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  updateLocalStorage();
  updateTransactionList();
  updateSummary();
  showNotification("Transaction removed successfully!");
}

// Reset form
function resetForm() {
  transactionFormEl.reset();
  dateEl.valueAsDate = new Date();
  updateCategoryOptions();
}

// Update localStorage
function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Event listeners
transactionTypeEl.addEventListener("change", updateCategoryOptions);
transactionFormEl.addEventListener("submit", addTransaction);
filterEl.addEventListener("change", updateTransactionList);

// Initialize
init();
