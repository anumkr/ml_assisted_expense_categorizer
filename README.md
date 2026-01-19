# ExperTrack 🧾  
**ML-Assisted Expense Tracker with ONNX Integration**

ExperTrack is a full‑stack expense tracking application that combines **FastAPI**, **SQLite**, **Chart.js**, and an **ONNX machine learning model** to deliver smart, automated expense categorization with a responsive dashboard.

---

## 🚀 Features
- **ML-Assisted Categorization**  
  Automatically classifies transactions using an ONNX ML model, with a JavaScript fallback classifier for robust predictions.
- **Dynamic Dashboard**  
  Responsive UI with interactive **doughnut and bar charts** powered by Chart.js.
- **Transaction History**  
  View recent transactions with categorized insights.
- **RESTful APIs**  
  Endpoints for adding transactions, retrieving dashboard data, and resetting state.

---

## 📸 Screenshots

### Dashboard Overview
![Dashboard Overview](https://github.com/anumkr/ml_assisted_expense_categorizer/blob/main/expdashboard.png?raw=true)

### Expense Dashboard
![Add Transaction](https://github.com/anumkr/ml_assisted_expense_categorizer/blob/main/categorizer1.png?raw=true)

### Recent Transactions
![Add Transaction](https://github.com/anumkr/ml_assisted_expense_categorizer/blob/main/categorizer2.png?raw=true)

---

## 🛠️ Tech Stack
- **Backend:** FastAPI, SQLite, ONNX Runtime  
- **Frontend:** HTML, CSS, JavaScript, Chart.js  
- **ML Integration:** ONNX model for transaction categorization + JS fallback logic  

---

## 📊 Dashboard Highlights
- Total spending overview  
- Category distribution (Food, Transport, Entertainment, etc.)  
- Monthly spending trends  
- Top spending category  

---

## 🔧 API Endpoints
- `POST /add_transaction` → Add a new transaction (auto-categorized)  
- `GET /dashboard_data` → Retrieve dashboard metrics and charts  
- `POST /reset` → Reset all stored transactions  

## 📌 Project Scope 
The scope of **ExperTrack** is to provide a lightweight yet intelligent expense tracking solution that demonstrates: 
- **Integration of ML models** into a real-world web application. 
- **Hybrid categorization logic** combining machine learning with rule-based fallbacks for reliability. 
- **Full-stack development skills** across backend (FastAPI + SQLite), frontend (Chart.js + JS), and ML deployment (ONNX). 
- **Data visualization** for financial insights, including category breakdowns and monthly spending trends. 
- **Extensibility** for future enhancements such as authentication, cloud deployment, and advanced analytics.

