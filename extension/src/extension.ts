import * as vscode from "vscode";
import { ProdySessionPanel } from "./sessionPanel";
import { getDashboardUrl, SessionController } from "./sessionController";

export function activate(context: vscode.ExtensionContext) {
  const output = vscode.window.createOutputChannel("Prody");
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBar.command = "prody.shipToProduction";

  const controller = new SessionController(context, statusBar, output);
  const panel = new ProdySessionPanel(() => controller.getSnapshot());

  controller.setOnChange(() => panel.refresh());

  context.subscriptions.push(
    output,
    statusBar,
    controller,
    vscode.window.registerWebviewViewProvider(ProdySessionPanel.viewType, panel)
  );

  const runStart = async (retry: boolean) => {
    try {
      await vscode.commands.executeCommand("workbench.view.extension.prody");
      await controller.startSession(retry);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      void vscode.window.showErrorMessage(
        `Prody: ${msg}. Is the engine running? (uvicorn backend.main:app --port 8000)`
      );
    }
  };

  context.subscriptions.push(
    vscode.commands.registerCommand("prody.shipToProduction", () => runStart(false)),
    vscode.commands.registerCommand("prody.retrySecurity", () => runStart(true)),
    vscode.commands.registerCommand("prody.approve", () => controller.approve()),
    vscode.commands.registerCommand("prody.reject", () => controller.reject()),
    vscode.commands.registerCommand("prody.openFixesDoc", async () => {
      const uri = controller.getFixesDocUri();
      if (uri) {
        await vscode.window.showTextDocument(uri, { preview: false });
      } else {
        void vscode.window.showInformationMessage(
          "No fix guide yet. Run Prody: Ship to Production first."
        );
      }
    }),
    vscode.commands.registerCommand("prody.openDashboard", () => {
      const snap = controller.getSnapshot();
      const base = getDashboardUrl();
      const url = snap.sessionId
        ? `${base}/session/${snap.sessionId}`
        : base;
      void vscode.env.openExternal(vscode.Uri.parse(url));
    })
  );

  statusBar.text = "$(cloud) Prody";
  statusBar.tooltip = "Click to ship to production";
  statusBar.show();
}

export function deactivate() {}
