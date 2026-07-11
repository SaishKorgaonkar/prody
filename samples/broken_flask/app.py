"""
DELIBERATELY BROKEN Flask demo application.

This app is a target for an authorized, local-only functional-testing
agent. Most routes work correctly (/, /items return 200), but /checkout
contains a genuine code defect that makes it 500 on every normal GET/POST
request. It exists only to demo the functional-test agent's FAIL /
short-circuit path for a hackathon demo running on 127.0.0.1.
"""

import os
from flask import Flask, jsonify

app = Flask(__name__)

ITEMS = [
    {"id": 1, "name": "Widget", "price": 9.99},
    {"id": 2, "name": "Gadget", "price": 19.99},
    {"id": 3, "name": "Gizmo", "price": 29.99},
]

# Cart summary consumed by /checkout below. Note: "discount" was removed
# from this dict when promo codes were dropped, but /checkout was never
# updated to match - that mismatch is the actual bug.
CART = {"subtotal": sum(item["price"] for item in ITEMS)}


@app.route("/")
def index():
    return """
    <h1>Broken Flask Demo</h1>
    <ul>
        <li><a href="/items">/items</a></li>
        <li><a href="/checkout">/checkout</a></li>
    </ul>
    """


@app.route("/items")
def items():
    return jsonify(ITEMS)


@app.route("/checkout", methods=["GET", "POST"])
def checkout():
    # BUG: "discount" no longer exists in CART, so this raises KeyError on
    # every normal request - Flask turns that into a 500 happy-path failure.
    total = CART["subtotal"] - CART["discount"]
    return jsonify({"total": total})


if __name__ == "__main__":
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "5000"))
    app.run(host=host, port=port, debug=False)
