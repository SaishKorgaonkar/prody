#!/usr/bin/env bash
#
# setup_tools.sh — best-effort installer for optional security CLIs.
#
# The pentest agent's Python-native HTTP engine (http_probe, test_sql_injection,
# test_xss_reflection, test_path_exposure, etc.) works with zero external
# dependencies. If the tools below happen to be installed, the Recon agent
# will additionally shell out to them for deeper static/secret analysis.
# None of this is required — every install below is allowed to fail
# without breaking the rest of the script.
#
# NOTE: intentionally NOT `set -e` — every step below is optional and must
# be able to fail without aborting the script.

echo "==> Installing optional Python SAST / dependency-audit tools (semgrep, bandit, pip-audit)..."
pip install --quiet semgrep bandit pip-audit || true

echo "==> Installing optional secret-scanning tool (gitleaks)..."
brew install gitleaks || true

echo "==> Installing optional dynamic scanning tools (ffuf, nuclei, sqlmap, nikto, gobuster)..."
brew install ffuf nuclei sqlmap nikto gobuster || true

echo "==> Done."
echo "==> All of the above are OPTIONAL. The pentest agent's Python-native"
echo "==> HTTP engine works fully without any of these CLIs installed —"
echo "==> it degrades gracefully and simply skips tool-specific checks for"
echo "==> whichever tools are missing."
