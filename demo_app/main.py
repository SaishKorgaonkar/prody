"""Prody Notes — the demo application deployed by the Prody engine.

A small, real Flask service used to show the FULL pipeline end-to-end:
intake -> security review -> architecture -> deploy -> SRE. Unlike
`samples/vulnerable_flask` (which exists to make the security gate FAIL), this
app follows secure defaults so it passes the gate and actually deploys to
Cloud Run:

  * No hardcoded secrets — config comes from the environment.
  * Parameterised SQL (no injection).
  * User input is escaped before it is rendered (no reflected XSS).
  * Binds to $PORT and 0.0.0.0 for Cloud Run.
"""
import os
import sqlite3
from html import escape

from flask import Flask, request, jsonify

app = Flask(__name__)

# Config from the environment (12-factor) — never hardcoded.
APP_NAME = os.environ.get("APP_NAME", "Prody Notes")
DB_PATH = os.environ.get("DB_PATH", "/tmp/prody_notes.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute(
        "CREATE TABLE IF NOT EXISTS notes ("
        "id INTEGER PRIMARY KEY AUTOINCREMENT, body TEXT NOT NULL)"
    )
    conn.commit()
    conn.close()


@app.route("/")
def index():
    return (
        f"<h1>{escape(APP_NAME)}</h1>"
        "<p>A tiny, production-ready notes service deployed by Prody.</p>"
        "<ul>"
        "<li>GET <code>/healthz</code> — liveness check</li>"
        "<li>GET <code>/notes</code> — list notes</li>"
        "<li>POST <code>/notes</code> {\"body\": \"...\"} — add a note</li>"
        "<li>GET <code>/search?q=term</code> — search notes</li>"
        "</ul>"
    )


@app.route("/healthz")
def healthz():
    return jsonify(status="ok", app=APP_NAME)


@app.route("/notes", methods=["GET", "POST"])
def notes():
    conn = get_db()
    if request.method == "POST":
        body = (request.get_json(silent=True) or {}).get("body", "").strip()
        if not body:
            conn.close()
            return jsonify(error="body is required"), 400
        # Parameterised query — no SQL injection.
        cur = conn.execute("INSERT INTO notes (body) VALUES (?)", (body,))
        conn.commit()
        note_id = cur.lastrowid
        conn.close()
        return jsonify(id=note_id, body=body), 201

    rows = conn.execute("SELECT id, body FROM notes ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify(notes=[dict(r) for r in rows])


@app.route("/search")
def search():
    q = request.args.get("q", "")
    conn = get_db()
    # Parameterised LIKE — safe. Input is escaped before rendering — no XSS.
    rows = conn.execute(
        "SELECT id, body FROM notes WHERE body LIKE ?", (f"%{q}%",)
    ).fetchall()
    conn.close()
    items = "".join(f"<li>#{r['id']}: {escape(r['body'])}</li>" for r in rows)
    return f"<h3>Results for: {escape(q)}</h3><ul>{items}</ul>"


init_db()

if __name__ == "__main__":
    # 0.0.0.0 + $PORT so the same code runs locally and on Cloud Run.
    port = int(os.environ.get("PORT", "8080"))
    app.run(host="0.0.0.0", port=port)
