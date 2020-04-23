import * as vscode from "vscode";
import * as cp from "child_process";

import { buildCommand } from "./commands/buildCommand";
import { infoMessage } from "./utils/message";

export function activate(context: vscode.ExtensionContext) {
  var proc: cp.ChildProcess | null;
  var outputChannel: vscode.OutputChannel;

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
    if (!outputChannel) {
      outputChannel = vscode.window.createOutputChannel("vscode-input.Result");
    }
    outputChannel.show();
    proc = buildCommand(outputChannel);
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
