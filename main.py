from fastapi import FastAPI
from pydantic import BaseModel
import sqlite3
import onnxruntime as ort
import uvicorn
import datetime
from fastapi.middleware.cors import CORSMiddleware


application = FastAPI()

application.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000"],  
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],  
)

session = ort.InferenceSession("expense_model.onnx")  

categories_map = {
    0: "Food & Beverage",
    1: "Transport",
    2: "Entertainment",
    3: "Shopping",
    4: "Utilities",
    5: "Healthcare",
    6: "Other"
}

def predict_category(description: str) -> str:
    desc = description.lower().replace("₹", "").strip()
    input_name = session.get_inputs()[0].name
    pred = session.run(None, {input_name: [desc]})
    result = pred[0][0]

    if isinstance(result, str):
        return result
    if isinstance(result, (int, float)):
        return categories_map.get(int(result), "Other")
    return "Other"


conn = sqlite3.connect("transactions.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT,
    amount REAL,
    date TEXT,
    category TEXT
)
""")
conn.commit()


class Transaction(BaseModel):
    desc: str
    amount: float
    date: str  



@application.post("/add_transaction")
def add_transaction(tx: Transaction):
    try:
        category = predict_category(tx.desc)
    except Exception as e:
        print("Prediction error:", e)
        category = "Other"

    try:
        month = datetime.datetime.strptime(tx.date, "%Y-%m-%d").strftime("%b %Y")
    except ValueError as e:
        print("Date parsing error:", e)
        month = "Unknown"

    cursor.execute(
        "INSERT INTO transactions (description, amount, date, category) VALUES (?, ?, ?, ?)",
        (tx.desc, tx.amount, tx.date, category)
    )
    conn.commit()

    return get_dashboard_data()

@application.get("/dashboard_data")
def get_dashboard_data():
    cursor.execute("SELECT * FROM transactions")
    rows = cursor.fetchall()

    total_spending = sum([r[2] for r in rows]) if rows else 0
    transactions_count = len(rows)
    categories = [r[4] for r in rows]

    cat_counts = {}
    for c in categories:
        cat_counts[c] = cat_counts.get(c, 0) + 1

    top_category = max(cat_counts, key=cat_counts.get) if cat_counts else "N/A"
    categories_used = len(cat_counts)

    monthly_totals = {}
    for r in rows:
        try:
            month = datetime.datetime.strptime(r[3], "%Y-%m-%d").strftime("%b %Y")
        except Exception:
            month = "Unknown"
        monthly_totals[month] = monthly_totals.get(month, 0) + r[2]

    return {
        "total_spending": total_spending,
        "transactions": transactions_count,
        "top_category": top_category,
        "categories_used": categories_used,
        "recent_transactions": [
            {"desc": r[1], "amount": r[2], "date": r[3], "category": r[4]} for r in rows[-10:]
        ],
        "category_totals": cat_counts,
        "monthly_totals": monthly_totals
    }

@application.post("/reset")
def reset_data():
    cursor.execute("DELETE FROM transactions")   
    conn.commit()
    return {"message": "All transactions erased"}


if __name__ == "__main__":
    uvicorn.run(application, host="127.0.0.1", port=8000)
