"""Fixture for the draft-PR review trigger test."""


def divide(a, b):
    # no zero check - deliberate finding
    return a / b


def fetch(data):
    # unguarded key access - deliberate finding
    return data["value"]


def build_query(user_input):
    # string-interpolated SQL - deliberate finding
    return "SELECT * FROM users WHERE name = '" + user_input + "'"
