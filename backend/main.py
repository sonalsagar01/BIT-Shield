
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
import sqlite3

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DB_PATH = Path(__file__).with_name("safezone.db")

app = FastAPI(title="BIT Shield API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://bit-shield-gold.vercel.app",
        "http://192.168.29.242:5173",
    ],
    # allow_methods=["GET", "POST", "PATCH"],
    # allow_headers=["Content-Type"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@contextmanager
def connect_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        with conn:
            yield conn
    finally:
        conn.close()


def init_db():
    with connect_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL,
                location TEXT NOT NULL,
                description TEXT NOT NULL,
                contact TEXT DEFAULT '',
                latitude REAL,
                longitude REAL,
                status TEXT NOT NULL DEFAULT 'Received',
                created_at TEXT NOT NULL
            )
        """)
        # Support databases created by the earlier prototype.
        columns = {
            row["name"]
            for row in conn.execute("PRAGMA table_info(reports)")
        }

        if "latitude" not in columns:
            conn.execute("ALTER TABLE reports ADD COLUMN latitude REAL")
        if "longitude" not in columns:
            conn.execute("ALTER TABLE reports ADD COLUMN longitude REAL")


init_db()


class IncidentInput(BaseModel):
    category: str = Field(min_length=2, max_length=60)
    location: str = Field(min_length=2, max_length=120)
    description: str = Field(min_length=5, max_length=1000)
    contact: str = Field(default="", max_length=120)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)


@app.get("/")
def home():
    return {"message": "BIT Shield API is running"}

@app.get("/reports")
def get_reports():
    with connect_db() as conn:
        rows = conn.execute(
            "SELECT * FROM reports ORDER BY id DESC"
        ).fetchall()
    return [dict(row) for row in rows]


@app.post("/reports", status_code=201)
def create_report(report: IncidentInput):
    created_at = datetime.now(timezone.utc).isoformat()

    with connect_db() as conn:
        cursor = conn.execute(
            """
            INSERT INTO reports (
                category, location, description, contact,
                latitude, longitude, status, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, 'Received', ?)
            """,
            (
                report.category,
                report.location,
                report.description,
                report.contact,
                report.latitude,
                report.longitude,
                created_at,
            ),
        )

        row = conn.execute(
            "SELECT * FROM reports WHERE id = ?",
            (cursor.lastrowid,),
        ).fetchone()

    return dict(row)


@app.patch("/reports/{report_id}")
def update_status(report_id: int, status: str):
    allowed = {"Received", "Under Review", "Resolved"}

    if status not in allowed:
        raise HTTPException(
            status_code=400,
            detail="Invalid report status",
        )

    with connect_db() as conn:
        cursor = conn.execute(
            "UPDATE reports SET status = ? WHERE id = ?",
            (status, report_id),
        )

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Report not found")

        row = conn.execute(
            "SELECT * FROM reports WHERE id = ?",
            (report_id,),
        ).fetchone()

    return dict(row)