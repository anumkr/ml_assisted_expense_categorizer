const spendingBox = document.getElementById("spendingbox");
const transactionsBox = document.getElementById("transactions");
const topCategoryBox = document.getElementById("top");
const categoryBox = document.getElementById("category");
const recentBox = document.querySelector(".detailbox");

let doughnutChart;
let barChart;

function showLoading(message = "Loading...") {
  recentBox.innerHTML = `<p>${message}</p>`;
}

function guessCategory(desc) {
  const text = desc.toLowerCase();
  if (text.includes("milk") || text.includes("vegetables") || text.includes("cheese") ||text.includes("butter")||text.includes("spices")||text.includes("curry powder")||text.includes("sugar")||text.includes("fruits")||text.includes("jam")) return "Groceries";
  if (text.includes("newspaper") || text.includes("electricity") || text.includes("water")|| text.includes("bill")) return "Bills";
  if (text.includes("phone") || text.includes("wifi") || text.includes("netflix") || text.includes("prime")) return "Recharge/Subscription";
  if (text.includes("books") || text.includes("pen") || text.includes("pencil")) return "Stationery";
  if (text.includes("uber") || text.includes("bus") || text.includes("taxi")|| text.includes("rapido")|| text.includes("train")|| text.includes("flight")|| text.includes("metro")) return "Stationery";
  if (text.includes("tablet") || text.includes("syrup") || text.includes("medicine")) return "Medicines";
  if (text.includes("pizza") || text.includes("burger") || text.includes("noodles")|| text.includes("icecream")|| text.includes("cake")|| text.includes("chocolate")|| text.includes("pasta")|| text.includes("restaurant")||text.includes("meals")) return "Food";
  if (text.includes("petrol") || text.includes("diesel")) return "Fuel";
  if (text.includes("loan") || text.includes("installments")) return "EMI";
  if (text.includes("school fees") || text.includes("transport fees")) return "Fees";
  if (text.includes("shirt") || text.includes("tops")||text.includes("pants")||text.includes("jeans")|| text.includes("jacket")) return "Clothes";
  if (text.includes("lipstick") || text.includes("moisturizer") || text.includes("foundation") ||text.includes("jewellery")||text.includes("earrings")) return "Accessories/Makeup";
  if (text.includes("sofa") || text.includes("table") || text.includes("chair") ||text.includes("bed")) return "Furniture";
  if (text.includes("coffee")||text.includes("Starbucks coffee")||text.includes("tea")||text.includes("sandwich")||text.includes("juice")||text.includes("milkshake")) return "Cafe/Snack";
  if (text.includes("movie ticket") || text.includes("concert")) return "Entertainment";
  return "Other";
}

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  let rawDate = document.getElementById("date").value;
  let date = rawDate;

  if (rawDate.includes("-") && rawDate.split("-")[0].length === 2) {
    const parts = rawDate.split("-");
    date = `${parts[2]}-${parts[1]}-${parts[0]}`; 
  }

  const data = {
    desc: document.getElementById("desc").value,
    amount: parseFloat(document.getElementById("amount").value),
    date
  };

  try {
    showLoading("Adding transaction...");
    const res = await fetch("http://127.0.0.1:8000/add_transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error(`Failed to add transaction (status ${res.status})`);

    const dashboard = await res.json();
    updateDashboard(dashboard);
  } catch (err) {
    console.error("Transaction error:", err);
    recentBox.innerHTML = `<p style="color:red;">Error: Could not add transaction (${err.message}).</p>`;
  }
});

window.onload = async () => {
  try {
    showLoading();
    const res = await fetch("http://127.0.0.1:8000/dashboard_data");
    if (!res.ok) throw new Error(`Failed to load dashboard data (status ${res.status})`);

    const dashboard = await res.json();
    updateDashboard(dashboard);
  } catch (err) {
    console.error("Dashboard load error:", err);
    recentBox.innerHTML = `<p style="color:red;">Error: Could not load dashboard (${err.message}).</p>`;
  }
};

function updateDashboard(data) {
  spendingBox.textContent = `₹${data.total_spending.toFixed(2)}`;
  transactionsBox.textContent = data.transactions;

  let categoryTotals = {};
  let monthlyTotals = {};

  recentBox.innerHTML = "";
  if (!data.recent_transactions || data.recent_transactions.length === 0) {
    recentBox.textContent = "No transactions yet. Add your first expense above!";
  } else {
    data.recent_transactions.forEach(tx => {
      let category = tx.category;
      if (category === "Other") {
        category = guessCategory(tx.desc);
      }

      categoryTotals[category] = (categoryTotals[category] || 0) + tx.amount;


      const monthLabel = tx.date.slice(0, 7); 
      monthlyTotals[monthLabel] = (monthlyTotals[monthLabel] || 0) + tx.amount;

      const item = document.createElement("p");
      item.textContent = `${tx.desc} | ₹${tx.amount} | ${tx.date} | ${category}`;
      recentBox.appendChild(item);
    });
  }


  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  topCategoryBox.textContent = sortedCategories.length > 0 ? sortedCategories[0][0] : "N/A";
  categoryBox.textContent = Object.keys(categoryTotals).length;


  renderDoughnutChart(categoryTotals);
  renderBarChart(monthlyTotals);
}

document.getElementById("resetBtn").addEventListener("click", async () => {
  try {
    const res = await fetch("http://127.0.0.1:8000/reset", { method: "POST" });
    if (!res.ok) throw new Error("Failed to reset backend data");

    spendingBox.textContent = "₹0.00";
    transactionsBox.textContent = "0";
    topCategoryBox.textContent = "N/A";
    categoryBox.textContent = "0";
    recentBox.innerHTML = "No transactions yet. Add your first expense above!";

    if (doughnutChart) doughnutChart.destroy();
    if (barChart) barChart.destroy();
  } catch (err) {
    console.error("Reset error:", err);
    recentBox.innerHTML = `<p style="color:red;">Error: Could not reset data (${err.message}).</p>`;
  }
});


function renderDoughnutChart(categoryTotals) {
  const ctx = document.getElementById("spendingbycat").getContext("2d");
  const labels = Object.keys(categoryTotals || {});
  const values = Object.values(categoryTotals || {});

  if (labels.length === 0) {
    ctx.font = "16px Inter";
    ctx.fillText("No category data", 50, 50);
    return;
  }

  const colors = [
    "#003366", "#0055AA", "#007BFF", "#3399FF",
    "#66B2FF", "#99CCFF", "#CCE5FF"
  ];

  if (doughnutChart) doughnutChart.destroy();
  doughnutChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, labels.length)
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

function renderBarChart(monthlyTotals) {
  const ctx = document.getElementById("monthtotals").getContext("2d");
  const labels = Object.keys(monthlyTotals || {});
  const values = Object.values(monthlyTotals || {});

  if (labels.length === 0) {
    ctx.font = "16px Inter";
    ctx.fillText("No monthly data", 50, 50);
    return;
  }

  const barColors = [
    "#003366", "#0055AA", "#007BFF", "#3399FF",
    "#66B2FF", "#99CCFF", "#CCE5FF"
  ];

  if (barChart) barChart.destroy();
  barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Monthly Spending",
        data: values,
        backgroundColor: barColors
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

