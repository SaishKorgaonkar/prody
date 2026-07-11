import * as vscode from "vscode";
import { getDashboardUrl } from "./sessionController";
import type { SessionSnapshot } from "./types";

export class ProdySessionPanel implements vscode.WebviewViewProvider {
  public static readonly viewType = "prody.session";

  constructor(private readonly getSnapshot: () => SessionSnapshot) {}

  private view?: vscode.WebviewView;

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this.view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [],
    };

    webviewView.webview.onDidReceiveMessage((msg) => {
      if (msg.type === "approve") {
        void vscode.commands.executeCommand("prody.approve");
      } else if (msg.type === "reject") {
        void vscode.commands.executeCommand("prody.reject");
      } else if (msg.type === "retry") {
        void vscode.commands.executeCommand("prody.retrySecurity");
      } else if (msg.type === "openFixes") {
        void vscode.commands.executeCommand("prody.openFixesDoc");
      } else if (msg.type === "openDashboard") {
        void vscode.commands.executeCommand("prody.openDashboard");
      }
    });

    this.render();
  }

  refresh() {
    this.render();
  }

  private render() {
    if (!this.view) {
      return;
    }
    const s = this.getSnapshot();
    const engineUrl = vscode.workspace
      .getConfiguration("prody")
      .get<string>("engineUrl", "http://127.0.0.1:8000");
    const imageUrl =
      s.pendingApproval?.image_url && s.sessionId
        ? `${engineUrl}${s.pendingApproval.image_url}`
        : null;

    this.view.webview.html = htmlForSnapshot(s, imageUrl, getDashboardUrl());
  }
}

function sevClass(sev: string): string {
  const s = sev.toLowerCase();
  if (s === "critical" || s === "high") return "sev-high";
  if (s === "medium") return "sev-med";
  return "sev-low";
}

function htmlForSnapshot(
  s: SessionSnapshot,
  imageUrl: string | null,
  dashboardUrl: string
): string {
  const gate = s.gate?.status ?? "—";
  const gateClass =
    gate === "PASS"
      ? "gate-pass"
      : gate === "PASS_WITH_WARNINGS"
        ? "gate-warn"
        : gate === "FAIL" || gate === "ERROR"
          ? "gate-fail"
          : "gate-pending";

  const findingsHtml =
    s.findings.length === 0
      ? `<p class="muted">No open findings yet. Run <strong>Prody: Ship to Production</strong>.</p>`
      : s.findings
          .map(
            (f) => `
        <article class="finding ${sevClass(f.severity)}">
          <header>
            <span class="badge">${escapeHtml(f.severity)}</span>
            <strong>${escapeHtml(f.title)}</strong>
            ${f.location ? `<code>${escapeHtml(f.location)}</code>` : ""}
          </header>
          ${f.evidence ? `<pre>${escapeHtml(f.evidence)}</pre>` : ""}
          ${f.remediation ? `<p class="fix"><strong>Fix:</strong> ${escapeHtml(f.remediation)}</p>` : ""}
        </article>`
          )
          .join("");

  const resolvedHtml =
    s.resolvedFindings.length === 0
      ? ""
      : `<section>
          <h3>Resolved since last scan</h3>
          <ul class="resolved">
            ${s.resolvedFindings.map((f) => `<li>✅ ${escapeHtml(f.title)}</li>`).join("")}
          </ul>
        </section>`;

  const approvalHtml = s.pendingApproval
    ? `<section class="approval">
        <h3>Approval required</h3>
        <p>${escapeHtml(s.pendingApproval.description)}</p>
        ${imageUrl ? `<img src="${imageUrl}" alt="Architecture diagram" />` : ""}
        <div class="actions">
          <button onclick="approve()">Approve & deploy</button>
          <button class="secondary" onclick="reject()">Reject</button>
        </div>
      </section>`
    : "";

  const blockedBanner = s.blocked
    ? `<div class="banner fail">
        Security gate blocked deploy. Open <code>PRODY_SECURITY_FIXES.md</code> for your agent, implement fixes, then retry.
        <div class="actions">
          <button onclick="openFixes()">Open fix guide</button>
          <button onclick="retry()">Retry after fixes</button>
        </div>
      </div>`
    : "";

  const deployHtml = s.deployUrl
    ? `<div class="banner pass">Live: <a href="${escapeHtml(s.deployUrl)}">${escapeHtml(s.deployUrl)}</a></div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: http: data:; style-src 'unsafe-inline'; script-src 'unsafe-inline';" />
  <style>
    body { font-family: var(--vscode-font-family); font-size: 13px; color: var(--vscode-foreground); padding: 12px; line-height: 1.45; }
    h2 { font-size: 14px; margin: 0 0 8px; }
    h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; opacity: 0.7; margin: 16px 0 8px; }
    .meta { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
    .pill { padding: 2px 8px; border-radius: 999px; background: var(--vscode-badge-background); font-size: 11px; }
    .gate-pass { color: #22c55e; }
    .gate-warn { color: #eab308; }
    .gate-fail { color: #ef4444; }
    .gate-pending { opacity: 0.6; }
    .finding { border-left: 3px solid var(--vscode-panel-border); padding: 8px 10px; margin: 8px 0; background: var(--vscode-editor-inactiveSelectionBackground); border-radius: 4px; }
    .finding.sev-high { border-left-color: #ef4444; }
    .finding.sev-med { border-left-color: #eab308; }
    .finding.sev-low { border-left-color: #60a5fa; }
    .finding header { display: flex; flex-direction: column; gap: 4px; }
    .badge { display: inline-block; width: fit-content; font-size: 10px; text-transform: uppercase; opacity: 0.85; }
    pre { white-space: pre-wrap; font-size: 11px; opacity: 0.9; margin: 6px 0; }
    .fix { margin: 6px 0 0; }
    code { font-size: 11px; }
    .muted { opacity: 0.65; }
    .banner { padding: 10px; border-radius: 6px; margin-bottom: 12px; }
    .banner.fail { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.35); }
    .banner.pass { background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.35); }
    .actions { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
    button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; }
    button.secondary { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); }
    img { max-width: 100%; border-radius: 6px; margin-top: 8px; background: #fff; }
    .resolved { margin: 0; padding-left: 18px; }
    a { color: var(--vscode-textLink-foreground); }
  </style>
</head>
<body>
  <h2>Prody session</h2>
  <div class="meta">
    <span class="pill">${escapeHtml(s.sessionId || "—")}</span>
    <span class="pill">Phase: ${escapeHtml(s.phase)}</span>
    <span class="pill ${gateClass}">Gate: ${escapeHtml(gate)}</span>
    ${s.readinessScore != null ? `<span class="pill">Readiness: ${s.readinessScore}/100</span>` : ""}
  </div>
  ${blockedBanner}
  ${deployHtml}
  ${approvalHtml}
  ${resolvedHtml}
  <h3>Open findings</h3>
  ${findingsHtml}
  <div class="actions">
    <button class="secondary" onclick="openDashboard()">Open web dashboard</button>
  </div>
  <script>
    const vscode = acquireVsCodeApi();
    function approve() { vscode.postMessage({ type: 'approve' }); }
    function reject() { vscode.postMessage({ type: 'reject' }); }
    function retry() { vscode.postMessage({ type: 'retry' }); }
    function openFixes() { vscode.postMessage({ type: 'openFixes' }); }
    function openDashboard() { vscode.postMessage({ type: 'openDashboard' }); }
  </script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
