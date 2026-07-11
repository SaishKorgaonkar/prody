import sqlite3
import os
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
DB_FILE = os.environ.get(
    'DATABASE_PATH',
    os.path.join(app.root_path, 'database.sqlite'),
)

def init_db():
    database_directory = os.path.dirname(os.path.abspath(DB_FILE))
    os.makedirs(database_directory, exist_ok=True)

    with sqlite3.connect(DB_FILE) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                message TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')

init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/messages', methods=['GET'])
def get_messages():
    with sqlite3.connect(DB_FILE) as conn:
        rows = conn.execute(
            'SELECT name, message, timestamp FROM messages ORDER BY id DESC'
        ).fetchall()

    messages = [
        {'name': row[0], 'message': row[1], 'timestamp': row[2]}
        for row in rows
    ]
    return jsonify(messages)

@app.route('/api/messages', methods=['POST'])
def add_message():
    data = request.get_json(silent=True) or {}
    name = data.get('name')
    message = data.get('message')

    if not isinstance(name, str) or not isinstance(message, str):
        return jsonify({'error': 'Name and message must be strings'}), 400

    name = name.strip()
    message = message.strip()
    
    if not name or not message:
        return jsonify({'error': 'Name and message are required'}), 400

    with sqlite3.connect(DB_FILE) as conn:
        conn.execute(
            'INSERT INTO messages (name, message) VALUES (?, ?)',
            (name, message),
        )
    
    return jsonify({'success': True}), 201

if __name__ == '__main__':
    # Bind the platform-provided port ($PORT) so this runs on Cloud Run (8080)
    # and the pre-deploy gate can reach it; fall back to 3000 for local dev.
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port, debug=False)
