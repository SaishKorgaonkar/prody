"""
Pre-existing but WEAK test suite for the flask_weak_tests demo app.

This test is tautological (asserts a constant) and never imports or
exercises the Flask app - it exists so the functional-test agent's
analyst phase can demonstrate the "assess existing tests, then fix/
augment" path instead of treating an empty test suite as absent coverage.
"""


def test_placeholder():
    assert True
