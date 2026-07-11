"""
Small, fully WORKING Flask demo application paired with a pre-existing
but WEAK test suite (see test_app.py).

This app is a target for an authorized, local-only functional-testing
agent. All routes function correctly; it exists to demo the analyst's
"assess existing tests, then fix/augment" path rather than treating an
empty test suite as absent coverage. Used only for a hackathon demo
running on 127.0.0.1.
"""

import os
from flask import Flask, jsonify, request

app = Flask(__name__)

GREETINGS = {"en": "Hello", "es": "Hola", "fr": "Bonjour"}


@app.route("/")
def index():
    return """
    <h1>Flask Weak Tests Demo</h1>
    <ul>
        <li><a href="/health">/health</a></li>
        <li><a href="/greet?lang=en">/greet?lang=en</a></li>
    </ul>
    """


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/greet")
def greet():
    lang = request.args.get("lang", "en")
    greeting = GREETINGS.get(lang, GREETINGS["en"])
    return jsonify({"greeting": greeting})


if __name__ == "__main__":
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "5000"))
    app.run(host=host, port=port, debug=False)
