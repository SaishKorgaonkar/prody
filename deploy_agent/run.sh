#!/bin/bash
# Launcher for the GCP Deployment Agent.
# Managed Agents require google-genai >= 2.3.0 and a supported Python runtime.

PYTHON="${PYTHON:-/usr/local/bin/python3.12}"

if [ ! -x "$PYTHON" ]; then
    echo "ERROR: Python 3.12 not found at $PYTHON"
    exit 1
fi

echo "Using: $PYTHON"
exec "$PYTHON" "$(dirname "$0")/agent.py" "$@"
