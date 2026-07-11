"""
DELIBERATELY VULNERABLE Flask demo application.

This app is a target for an authorized, local-only penetration-testing
agent. It is intentionally insecure (hardcoded secrets, SQL injection,
reflected XSS, broken access control) and MUST NEVER be deployed outside
a local, isolated demo environment. It is used only for a hackathon demo
running on 127.0.0.1.
"""

import os
import sqlite3
from flask import Flask, request

app = Flask(__name__)

# --- Hardcoded secrets (intentionally vulnerable: secret-scanner target) ---
API_KEY = "sk-live-abc123def456ghi789jkl012mno345"
DB_PASSWORD = "SuperSecretP@ssw0rd123"

DB_PATH = "/tmp/vulnerable_flask_demo.db"


def get_db():
    """Open a fresh connection per request (safe with Flask's threading)."""
    return sqlite3.connect(DB_PATH)


def init_db():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS users")
    cur.execute(
        "CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)"
    )
    cur.executemany(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [
            ("admin", "admin123"),
            ("alice", "alicepass"),
            ("bob", "bobsecret"),
        ],
    )
    conn.commit()
    conn.close()


@app.route("/")
def index():
    return """
    <h1>Vulnerable Flask Demo</h1>
    <ul>
        <li><a href="/search?q=test">/search?q=test</a></li>
        <li><a href="/login">/login</a></li>
        <li><a href="/admin">/admin</a></li>
    </ul>
    """


@app.route("/search")
def search():
    q = request.args.get("q", "")

    # VULNERABLE: string-concatenated SQL (SQL injection via GET)
    sql = "SELECT id, username FROM users WHERE username LIKE '%" + q + "%'"

    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(sql)
        rows = cur.fetchall()
        conn.close()
    except sqlite3.Error as e:
        # VULNERABLE: leaking raw database error text to the client
        return "Database error: " + str(e)

    # VULNERABLE: reflected XSS - q is echoed unescaped into raw HTML
    html = "<h3>Results for: " + q + "</h3>"
    html += "<ul>"
    for row in rows:
        html += "<li>id=" + str(row[0]) + " username=" + str(row[1]) + "</li>"
    html += "</ul>"
    html += "<p>Query used: " + sql + "</p>"
    return html


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return """
        <h2>Login</h2>
        <form method="POST">
            Username: <input name="username"><br>
            Password: <input name="password" type="password"><br>
            <input type="submit" value="Login">
        </form>
        """

    u = request.form.get("username", "")
    p = request.form.get("password", "")

    # VULNERABLE: string-concatenated SQL (SQL injection via POST)
    sql = "SELECT * FROM users WHERE username='" + u + "' AND password='" + p + "'"

    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(sql)
        row = cur.fetchone()
        conn.close()
    except sqlite3.Error as e:
        # VULNERABLE: leaking raw database error text to the client
        return "Database error: " + str(e)

    if row:
        return "Welcome, " + u + "! Login successful."
    return "Invalid credentials for user: " + u


@app.route("/admin")
def admin():
    # VULNERABLE: broken access control - no authentication check at all
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, username, password FROM users")
    rows = cur.fetchall()
    conn.close()

    html = "<h2>Admin Panel</h2>"
    html += "<p>API_KEY: " + API_KEY + "</p>"
    html += "<p>DB_PASSWORD: " + DB_PASSWORD + "</p>"
    html += "<h3>All Users</h3><ul>"
    for row in rows:
        html += (
            "<li>id="
            + str(row[0])
            + " username="
            + str(row[1])
            + " password="
            + str(row[2])
            + "</li>"
        )
    html += "</ul>"
    return html


init_db()

if __name__ == "__main__":
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "5000"))
    app.run(host=host, port=port, debug=False)
