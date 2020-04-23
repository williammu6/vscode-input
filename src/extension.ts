import * as vscode from "vscode";
import * as cp from "child_process";

import BuildCommand from "./commands/buildCommand";
import { infoMessage } from "./utils/message";

export function activate(context: vscode.ExtensionContext) {
  var proc: cp.ChildProcess | null;
  const registerCommand = (
    context: vscode.ExtensionContext,
    command: string,
    callback: (...args: any[]) => any
  ) => {
    const disposable = vscode.commands.registerCommand(
      command,
      async (args) => {
        if (!vscode.window.activeTextEditor) {
          return;
        }
        callback(args);
      }
    );
    context.subscriptions.push(disposable);
  };

  registerCommand(context, "vscode-input.Build", async () => {
    proc = BuildCommand();
  });
  registerCommand(context, "vscode-input.Cancel", () => {
    if (proc) {
      proc.kill();
      infoMessage("Process killed!");
    } else {
      infoMessage("No process to kill!");
    }
  });
}

export function deactivate() {}
