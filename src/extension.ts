import * as vscode from "vscode";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "vscode-input.helloWorld",
    () => {
      const extractInputFromFile = (path: string): string | null => {
        const content = fs.readFileSync(path, "utf8");
        const input = content.match(/(?<=\*\*input\n)(.*\n)*(?=\*)/g);

        if (input) {
          return input[0];
        }
        return null;
      };

      const saveInputToFile = (input: string): string => {
        const path = "/tmp/file";
        fs.writeFileSync(path, Buffer.from(input), "utf8");
        return path;
      };

      const currentlyOpenTabfilePath: string =
        vscode.window.activeTextEditor?.document.uri.fsPath || "";

      const execCommand = (path: string, inputPath: string) => {
        const command = `g++ -lm ${path} -o bin && ./bin < ${inputPath}`;
        console.log(command);
        if (vscode.window.terminals.length > 0) {
          vscode.window.activeTerminal?.sendText(command);
        } else {
          const terminal = vscode.window.createTerminal("command");
          terminal.sendText(command);
        }
      };

      if (currentlyOpenTabfilePath) {
        try {
          const input = extractInputFromFile(currentlyOpenTabfilePath);
          if (input) {
            const inputPath = saveInputToFile(input);
            execCommand(currentlyOpenTabfilePath, inputPath);
            vscode.window.showInformationMessage("Code executed!");
          }
        } catch (err) {
          console.log(err);
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
