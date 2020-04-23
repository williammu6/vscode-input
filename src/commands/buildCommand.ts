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
  const extractInputFromFile = (path: string, regexExp: RegExp): string => {
    const content = fs.readFileSync(path, "utf8");
    const input = content.match(regexExp);
    if (input) {
      return input[0];
    }
    return "";
  };

  const languageConfig = (extension: string): LanguageConfig | null => {
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
    if (configs[extension]) {
      return configs[extension];
    }
    return null;
  };

  const getCommand = (
    path: string,
    input: string,
    languageConfig: LanguageConfig
  ): string => {
    switch (languageConfig.extension) {
      case "cpp":
        return `${languageConfig.executable} -lm ${path} -o bin && echo "${input}" | ./bin`;
      case "py":
        return `echo "${input}" | ${languageConfig.executable} ${path}`;
      default:
        return "";
    }
  };

  const execCommand = (
    path: string,
    input: string,
    languageConfig: LanguageConfig
  ): cp.ChildProcess | null => {
    const command = getCommand(path, input, languageConfig);
    if (!command) return null;
    const proc: cp.ChildProcess = cp.exec(command, (err, stdout, stderr) => {
      outputChannel.clear();
      outputChannel.show(true);
      if (stdout) {
        outputChannel.append(stdout);
      }
      if (err) {
        outputChannel.append(err.message);
      }
    });

    return proc;
  };

  const getConfigByFileExt = (path: string): LanguageConfig | null => {
    let split: string[] = path.split(".");
    let extension = split[split.length - 1];
    return languageConfig(extension);
  };

  const currentlyOpenTabfilePath: string =
    vscode.window.activeTextEditor?.document.uri.fsPath || "";

  if (currentlyOpenTabfilePath) {
    try {
      const languageConfig: LanguageConfig | null = getConfigByFileExt(
        currentlyOpenTabfilePath
      );
      if (languageConfig) {
        const input = extractInputFromFile(
          currentlyOpenTabfilePath,
          languageConfig.regex
        );
        return execCommand(currentlyOpenTabfilePath, input, languageConfig);
      }
    } catch (err) {
      console.log(err);
    }
  }
  return null;
}
