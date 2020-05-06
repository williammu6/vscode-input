import { window, workspace, OutputChannel, TextDocument, TextEditor } from "vscode";
import * as fs from "fs";
import * as cp from "child_process";

export default async function buildCommand(
  outputChannel: OutputChannel
): Promise<cp.ChildProcess | undefined> {
  const languageRegex = (fileExtension: string): RegExp => {
    const rx: { [ext: string]: RegExp } = {
      cpp: /(?<=\*input\n)(.*\n)*(?=\*)/,
      py: /(?<="""input\n)(.*\n)*(?=")/,
    };
    return rx[fileExtension] as RegExp;
  };

  const getInput = (path: string, fileExtension: string): string => {
    const content = fs.readFileSync(path, "utf8");
    const input = content.match(languageRegex(fileExtension));
    if (input) {
      return input[0];
    }
    return "";
  };

  const getCompileCommand = (fileExtension: string): string | undefined => {
    return workspace
      .getConfiguration()
      .get(`vscode-input.compile-command.${fileExtension}`);
  };

  const getRunCommand = (fileExtension: string): string | undefined => {
    return workspace
      .getConfiguration()
      .get(`vscode-input.run-command.${fileExtension}`);
  };

  const compileCode = async (
    path: string,
    output: string,
    compileCmd: string
  ): Promise<boolean> => {
    if (compileCmd.includes("$path"))
      compileCmd = compileCmd.replace("$path", path);
    if (compileCmd.includes("$output"))
      compileCmd = compileCmd.replace("$output", output);

    return new Promise((resolve, _) => {
      cp.exec(compileCmd, (err, stdout, stderr) => {
        if (err) {
          outputChannel.append(err.message);
          outputChannel.show();
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  };

  const execute = (
    path: string,
    input: string,
    output: string,
    fileExtension: string
  ) => {
    let runCmd = getRunCommand(fileExtension);

    if (!runCmd) {
      outputChannel.show();
      outputChannel.append(`No run command especified for ${fileExtension}.`);
      return;
    }

    if (runCmd.includes("$path")) runCmd = runCmd.replace("$path", path);
    if (runCmd.includes("$output")) runCmd = runCmd.replace("$output", output);

    const proc: cp.ChildProcess = cp.exec(runCmd, (err, stdout, stderr) => {
      outputChannel.show(true);
      if (!err?.killed) {
        outputChannel.clear();
        if (stdout) {
          outputChannel.append(stdout);
        }
        if (stderr) {
          outputChannel.append(stderr);
        }
        if (err) {
          outputChannel.append(err.message);
        }
      }
    });
    proc.stdin?.write(input);
    proc.stdin?.end();
    return proc;
  };

  const runCommands = async (
    path: string,
    input: string,
    output: string,
    fileExtension: string
  ) => {
    const compileCmd = getCompileCommand(fileExtension);
    if (compileCmd) {
      const compile = await compileCode(path, output, compileCmd);
      if (!compile) {
        return;
      }
    }
    return execute(path, input, output, fileExtension);
  };

  const saveFile = async (textEditor: TextEditor) => {
    if (textEditor && textEditor.document.isDirty) {
      return textEditor.document.save();
    }
  }

  const getCurrentTextEditor = (): TextEditor | undefined => {
    const activeTextEditor = window.activeTextEditor;
    if (activeTextEditor) {
      if (activeTextEditor.document.uri.scheme === 'file') {
        return activeTextEditor; 
      }
      if (activeTextEditor.document.uri.scheme === 'output') {
        return window.visibleTextEditors.find(v => v.document.uri.scheme === 'file');
      }
    }
  }

  const isValidFileExtension = (fileExtension: string): boolean => {
    const allowedExtensions = ['cpp', 'c', 'py'];
    return !!allowedExtensions.includes(fileExtension);
  }

  let textEditor: TextEditor | undefined = getCurrentTextEditor();

  if (textEditor) {

    await saveFile(textEditor);

    const path = textEditor.document.uri.fsPath;

    const fileExtension: string | undefined = path.split(".").pop();

    const output: string = path.split(".")[0];

    if (fileExtension) {
      if (isValidFileExtension(fileExtension)) {
        const input = getInput(path, fileExtension);
        return await runCommands(path, input, output, fileExtension);
      } else {
        outputChannel.clear();
        outputChannel.append(`This command is not allowed for ${fileExtension} files.`);
      }
    }
  } else {
    outputChannel.clear();
    outputChannel.append('Open a program and rerun the command.');
  }
  return undefined;
}
