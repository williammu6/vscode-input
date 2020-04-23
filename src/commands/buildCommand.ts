import * as vscode from "vscode";
import * as fs from "fs";
import * as cp from "child_process";

export function buildCommand(
  outputChannel: vscode.OutputChannel
): cp.ChildProcess | null {
  const extractInputFromFile = (
    path: string,
    regexExp: RegExp
  ): string | null => {
    const content = fs.readFileSync(path, "utf8");
    const input = content.match(regexExp);

    if (input) {
      return input[0];
    }
    return null;
  };

  const saveInputToFile = (input: string): string => {
    const path = "/tmp/file";
    fs.writeFileSync(path, input, "utf8");
    return path;
  };

  const execCommand = (
    path: string,
    inputPath: string,
    extension: string,
    executable: string
  ): cp.ChildProcess | null => {
    const command = getCommand(path, inputPath, extension, executable);
    if (!command) return null;
    const proc: cp.ChildProcess = cp.exec(command, (err, stdout, stderr) => {
      outputChannel.clear();
      if (stdout) {
        outputChannel.append(stdout);
        outputChannel.show();
      }
      if (err) {
        outputChannel.append(err.message);
      }
    });

    return proc;
  };

  const getCommand = (
    path: string,
    inputPath: string,
    extension: string,
    executable: string
  ): string => {
    switch (extension) {
      case "cpp":
        return `${executable} -lm ${path} -o bin && ./bin < ${inputPath}`;
      case "py":
        return `${executable} ${path} < ${inputPath}`;
      default:
        return "";
    }
  };

  const getConfigByFileExt = (
    path: string
  ): [RegExp, string, string] | null => {
    let split: string[] = path.split(".");
    let extension = split[split.length - 1];

    var regexExp: RegExp;
    var executable: string;

    switch (extension) {
      case "cpp":
        regexExp = /(?<=\*\*input\n)(.*\n)*(?=\*)/g;
        executable = "g++";
        return [regexExp, executable, extension];
      case "py":
        regexExp = /(?<="""input\n)(.*\n)*(?=")/g;
        executable = "python3";
        return [regexExp, executable, extension];
      default:
        return null;
    }
  };

  const currentlyOpenTabfilePath: string =
    vscode.window.activeTextEditor?.document.uri.fsPath || "";

  if (currentlyOpenTabfilePath) {
    try {
      const config = getConfigByFileExt(currentlyOpenTabfilePath);
      if (config) {
        const [regexExp, executable, extension] = config;
        const input = extractInputFromFile(currentlyOpenTabfilePath, regexExp);
        if (input) {
          const inputPath = saveInputToFile(input);
          return execCommand(
            currentlyOpenTabfilePath,
            inputPath,
            extension,
            executable
          );
        }
      }
    } catch (err) {}
  }
  return null;
}
