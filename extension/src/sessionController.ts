import * as vscode from "vscode";
import { ProdyClient } from "./prodyClient";
import { buildFixesMarkdown, diffFindings, parseFinding } from "./findingsReport";
import type { GateVerdict, ProdyEvent, ProdyFinding, SessionSnapshot } from "./types";

function findingKey(f: ProdyFinding): string {
  return `${f.id ?? ""}|${f.title}|${f.location ?? ""}`;
}

export class SessionController {
  private client: ProdyClient;
  private unsubscribe: (() => void) | null = null;
  private snapshot: SessionSnapshot = emptySnapshot("");
  private previousFindings: ProdyFinding[] = [];
  private previousSessionId: string | undefined;
  private onChange: (() => void) | null = null;
  private statusBar: vscode.StatusBarItem;
  private output: vscode.OutputChannel;

  constructor(
    private readonly context: vscode.ExtensionContext,
    statusBar: vscode.StatusBarItem,
    output: vscode.OutputChannel
  ) {
    this.statusBar = statusBar;
    this.output = output;
    this.client = new ProdyClient(getEngineUrl());
  }

  setOnChange(fn: () => void) {
    this.onChange = fn;
  }

  getSnapshot(): SessionSnapshot {
    return this.snapshot;
  }

  getFixesDocUri(): vscode.Uri | undefined {
    if (!this.snapshot.fixesDocPath) {
      return undefined;
    }
    return vscode.Uri.file(this.snapshot.fixesDocPath);
  }

  async startSession(isRetry = false): Promise<void> {
    const folder = vscode.workspace.workspaceFolders?.[0];
    if (!folder) {
      throw new Error("Open a workspace folder first.");
    }

    if (isRetry && this.snapshot.findings.length > 0) {
      this.previousFindings = [...this.snapshot.findings];
      this.previousSessionId = this.snapshot.sessionId;
    }

    this.stopStream();
    this.client = new ProdyClient(getEngineUrl());

    const projectPath = folder.uri.fsPath;
    const sessionId = await this.client.startSession({ projectPath });

    this.snapshot = {
      ...emptySnapshot(sessionId),
      phase: "intake",
      status: "running",
    };

    this.log(`Session ${sessionId} started (${isRetry ? "retry" : "new"})`);
    this.refreshUi();

    this.unsubscribe = this.client.subscribeEvents(
      sessionId,
      (event) => this.handleEvent(event),
      () => {
        void this.pollFinalStatus(sessionId);
      }
    );
  }

  async approve(): Promise<void> {
    const step = this.snapshot.pendingApproval?.step_id;
    if (!step || !this.snapshot.sessionId) {
      return;
    }
    await this.client.approve(this.snapshot.sessionId, step, true);
    this.snapshot.pendingApproval = undefined;
    this.refreshUi();
  }

  async reject(): Promise<void> {
    const step = this.snapshot.pendingApproval?.step_id;
    if (!step || !this.snapshot.sessionId) {
      return;
    }
    await this.client.approve(this.snapshot.sessionId, step, false);
    this.snapshot.pendingApproval = undefined;
    this.refreshUi();
  }

  dispose() {
    this.stopStream();
  }

  private stopStream() {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  private async pollFinalStatus(sessionId: string) {
    try {
      const status = await this.client.getStatus(sessionId);
      this.snapshot.status = String(status.status ?? this.snapshot.status);
      this.snapshot.phase = String(status.phase ?? this.snapshot.phase);
      if (status.deploy_url) {
        this.snapshot.deployUrl = String(status.deploy_url);
      }
      if (typeof status.readiness_score === "number") {
        this.snapshot.readinessScore = status.readiness_score;
      }
      this.refreshUi();
    } catch {
      // engine may be offline
    }
  }

  private handleEvent(event: ProdyEvent) {
    this.snapshot.logs.push(event);
    if (event.phase) {
      this.snapshot.phase = event.phase;
    }

    switch (event.type) {
      case "finding": {
        const f = parseFinding(event.data);
        if (f && !this.snapshot.findings.some((x) => findingKey(x) === findingKey(f))) {
          this.snapshot.findings.push(f);
        }
        break;
      }
      case "gate": {
        this.snapshot.gate = {
          status: String(event.data?.status ?? "UNKNOWN"),
          summary: event.data?.summary as Record<string, number> | undefined,
          executive_summary: event.message,
        };
        const { resolved, stillOpen } = diffFindings(
          this.previousFindings,
          this.snapshot.findings
        );
        this.snapshot.resolvedFindings = resolved;
        if (this.previousFindings.length > 0) {
          this.snapshot.findings = stillOpen;
        }

        const blocking = ["FAIL", "ERROR"].includes(this.snapshot.gate.status);
        this.snapshot.blocked = blocking;

        void this.writeFixesDoc(blocking);
        break;
      }
      case "approval_required": {
        this.snapshot.pendingApproval = {
          step_id: String(event.data?.step_id ?? "architecture"),
          description: event.message || String(event.data?.description ?? "Approval required"),
          image_url: event.data?.image_url as string | null | undefined,
        };
        void vscode.window.showInformationMessage(
          "Prody: Architecture ready for your approval.",
          "Approve",
          "Review in sidebar"
        );
        break;
      }
      case "approved":
        this.snapshot.pendingApproval = undefined;
        break;
      case "deploy_url":
        this.snapshot.deployUrl = String(event.data?.deploy_url ?? event.message);
        void vscode.window.showInformationMessage(
          `Prody: Live at ${this.snapshot.deployUrl}`,
          "Open URL"
        ).then((choice) => {
          if (choice === "Open URL" && this.snapshot.deployUrl) {
            void vscode.env.openExternal(vscode.Uri.parse(this.snapshot.deployUrl));
          }
        });
        break;
      case "readiness":
        if (typeof event.data?.readiness_score === "number") {
          this.snapshot.readinessScore = event.data.readiness_score;
        }
        break;
      case "finished":
        this.snapshot.status = String(event.data?.status ?? "done");
        if (event.data?.deploy_url) {
          this.snapshot.deployUrl = String(event.data.deploy_url);
        }
        break;
      case "error":
        if (event.agent === "security") {
          this.snapshot.blocked = true;
          void this.writeFixesDoc(true);
        }
        break;
      default:
        break;
    }

    this.log(`[${event.agent ?? "prody"}] ${event.message}`);
    this.refreshUi();
  }

  private async writeFixesDoc(blocking: boolean) {
    const folder = vscode.workspace.workspaceFolders?.[0];
    if (!folder) {
      return;
    }

    const fileName = vscode.workspace
      .getConfiguration("prody")
      .get<string>("fixesFileName", "PRODY_SECURITY_FIXES.md");
    const docPath = vscode.Uri.joinPath(folder.uri, fileName);
    const md = buildFixesMarkdown({
      sessionId: this.snapshot.sessionId,
      projectPath: folder.uri.fsPath,
      gate: this.snapshot.gate,
      findings: this.snapshot.findings,
      resolvedFindings: this.snapshot.resolvedFindings,
      previousSessionId: this.previousSessionId,
    });

    await vscode.workspace.fs.writeFile(docPath, Buffer.from(md, "utf8"));
    this.snapshot.fixesDocPath = docPath.fsPath;

    if (blocking) {
      const open = "Open fix guide";
      const retry = "Retry after fixes";
      void vscode.window
        .showWarningMessage(
          `Prody blocked deploy: security gate ${this.snapshot.gate?.status}. Fix issues in ${fileName}, then retry.`,
          open,
          retry
        )
        .then((choice) => {
          if (choice === open) {
            void vscode.window.showTextDocument(docPath, { preview: false });
          } else if (choice === retry) {
            void vscode.commands.executeCommand("prody.retrySecurity");
          }
        });
    } else if (this.snapshot.resolvedFindings.length > 0) {
      void vscode.window.showInformationMessage(
        `Prody: ${this.snapshot.resolvedFindings.length} issue(s) resolved since last scan. Continuing pipeline…`
      );
    }
  }

  private log(line: string) {
    this.output.appendLine(line);
  }

  private refreshUi() {
    const gate = this.snapshot.gate?.status;
    const phase = this.snapshot.phase;
    this.statusBar.text = `$(cloud) Prody: ${phase}${gate ? ` · ${gate}` : ""}`;
    this.statusBar.tooltip = this.snapshot.deployUrl
      ? `Deploy URL: ${this.snapshot.deployUrl}`
      : "Prody cloud engineer session";
    this.statusBar.show();
    this.onChange?.();
  }
}

function emptySnapshot(sessionId: string): SessionSnapshot {
  return {
    sessionId,
    phase: "queued",
    status: "queued",
    findings: [],
    resolvedFindings: [],
    gate: null,
    logs: [],
    blocked: false,
  };
}

function getEngineUrl(): string {
  return vscode.workspace.getConfiguration("prody").get<string>("engineUrl", "http://127.0.0.1:8000");
}

export function getDashboardUrl(): string {
  return vscode.workspace.getConfiguration("prody").get<string>("dashboardUrl", "http://localhost:3001");
}
