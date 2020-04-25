import { commands, window, ExtensionContext, OutputChannel } from "vscode";
import * as cp from "child_process";

import buildCommand from "./commands/buildCommand";

export function activate(context: ExtensionContext) {
  var runningProcess: cp.ChildProcess | undefined;
  var outputChannel: OutputChannel;

  const registerCommand = (
    context: ExtensionContext,
    command: string,
    callback: (...args: any[]) => any
  ) => {
    const disposable = commands.registerCommand(command, async (args) => {
      if (!window.activeTextEditor) {
        return;
      }
      callback(args);
    });
    context.subscriptions.push(disposable);
  };

  const getOutputChannel = (): OutputChannel => {
    if (!outputChannel) {
      outputChannel = window.createOutputChannel("vscode-input.Result");
    }
    outputChannel.clear();

    return outputChannel;
  };

  const killProcess = (newProcessStarted = false) => {
    outputChannel = getOutputChannel();

    if (runningProcess) {
      runningProcess.kill();
    }
    outputChannel.clear();
    if (!newProcessStarted) {
      outputChannel.append("Canceled.\n");
      outputChannel.show(true);
    }
    runningProcess = undefined;
  };

  registerCommand(context, "vscode-input.Build", async () => {
    // TODO: Set focus to editor when focus it's not focused [?]

    killProcess(true);

    outputChannel = getOutputChannel();

    outputChannel.clear();
    outputChannel.append('Running...');
    outputChannel.show(true);

    runningProcess = await buildCommand(outputChannel);
  });

  registerCommand(context, "vscode-input.Cancel", async () => {
    killProcess(false);
  });
}

export function deactivate() {}
