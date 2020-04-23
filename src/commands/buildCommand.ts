import * as vscode from "vscode";
import * as fs from "fs";
import * as cp from "child_process";

export interface LanguageConfig {
  regex: RegExp;
  executable: string;
  extension: string;
}

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

  const languageConfig = (extension: string): LanguageConfig => {
    const configs: any = {
      cpp: {
        regex: /(?<=\*\*input\n)(.*\n)*(?=\*)/,
        executable: "g++",
        extension,
      },
      py: {
        regex: /(?<="""input\n)(.*\n)*(?=")/,
        executable: "python3",
        extension,
      },
    };

    return configs[extension];
  };

  const saveInputToFile = (input: string): string => {
    const path = "/tmp/file";
    fs.writeFileSync(path, input, "utf8");
    return path;
  };

  const execCommand = (
    path: string,
    inputPath: string,
    languageConfig: LanguageConfig
  ): cp.ChildProcess | null => {
    const command = getCommand(path, inputPath, languageConfig);
    if (!command) return null;
    const proc: cp.ChildProcess = cp.exec(command, (err, stdout, stderr) => {
      outputChannel.clear();
      if (stdout) {
        outputChannel.append(stdout);
        outputChannel.show(true);
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
    languageConfig: LanguageConfig
  ): string => {
    switch (languageConfig.extension) {
      case "cpp":
        return `${languageConfig.executable} -lm ${path} -o bin && ./bin < ${inputPath}`;
      case "py":
        return `${languageConfig.executable} ${path} < ${inputPath}`;
      default:
        return "";
    }
  };

  const getConfigByFileExt = (path: string): LanguageConfig => {
    let split: string[] = path.split(".");
    let extension = split[split.length - 1];
    return languageConfig(extension);
  };

  const currentlyOpenTabfilePath: string =
    vscode.window.activeTextEditor?.document.uri.fsPath || "";

  if (currentlyOpenTabfilePath) {
    try {
      const languageConfig: LanguageConfig = getConfigByFileExt(
        currentlyOpenTabfilePath
      );
      const input = extractInputFromFile(
        currentlyOpenTabfilePath,
        languageConfig.regex
      );
      if (input) {
        const inputPath = saveInputToFile(input);
        return execCommand(currentlyOpenTabfilePath, inputPath, languageConfig);
      }
    } catch (err) {
      console.log(err);
    }
  }
  return null;
}
