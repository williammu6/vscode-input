import * as vscode from "vscode";
import * as fs from "fs";
import * as cp from "child_process";

import { errorMessage, infoMessage } from "../utils/message";

const BuildCommand = (): cp.ChildProcess | null => {
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

  const execCommand = (path: string, inputPath: string): cp.ChildProcess => {
    const command = `g++ -lm ${path} -o bin && ./bin < ${inputPath}`;
    const proc: cp.ChildProcess = cp.exec(command, (err, stdout, stderr) => {
      if (stdout) {
        const output: vscode.OutputChannel = vscode.window.createOutputChannel(
          "vscode-input.Result"
        );
        output.append(stdout);
        output.show();
      }
      if (!err) {
        infoMessage("Code executed succeessfully  😎!");
      }
    });

    return proc;
  };

  const currentlyOpenTabfilePath: string =
    vscode.window.activeTextEditor?.document.uri.fsPath || "";

  if (currentlyOpenTabfilePath) {
    try {
      const input = extractInputFromFile(currentlyOpenTabfilePath);
      if (input) {
        const inputPath = saveInputToFile(input);
        return execCommand(currentlyOpenTabfilePath, inputPath);
      }
    } catch (err) {
      console.log(err);
      errorMessage("Error during execution  😢");
      return null;
    }
  }
  return null;
};

export default BuildCommand;
