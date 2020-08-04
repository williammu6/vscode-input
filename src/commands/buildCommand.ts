import { window, workspace, OutputChannel, TextEditor } from "vscode";
import * as cp from "child_process";

import CodeFile from "./CodeFile";
import { Python, C } from "../ProgrammingLanguages";

export default async function buildCommand(
  outputChannel: OutputChannel
): Promise<cp.ChildProcess | undefined> {
  const getCompileCommand = (codeFile: CodeFile): string => {
    let cmd = workspace
      .getConfiguration()
      .get(`vscode-input.compile-command.${codeFile.extension}`);
    if (cmd) return cmd as string;
    throw new Error("Command not found");
  };

  const getExecCommand = (codeFile: CodeFile): string => {
    let cmd = workspace
      .getConfiguration()
      .get(`vscode-input.run-command.${codeFile.extension}`);
    if (cmd) return cmd as string;
    throw new Error("Command not found");
  };

  const getProgrammingLanguage = (codeFile: CodeFile): C | Python => {
    switch (codeFile.extension) {
      case "py":
        return new Python();
      case "c":
      case "cpp":
        return new C();
    }
    throw new Error("Problem");
  };

  const compileCode = async (codeFile: CodeFile): Promise<boolean> => {
    let compileCmd = getCompileCommand(codeFile);

    if (compileCmd.includes("$path"))
      compileCmd = compileCmd.replace("$path", codeFile.path);
    if (compileCmd.includes("$output"))
      compileCmd = compileCmd.replace("$output", codeFile.output);

    return new Promise((resolve, _) => {
      cp.exec(compileCmd, err => {
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

  const execute = (codeFile: CodeFile) => {
    let runCmd = getExecCommand(codeFile);
    if (!runCmd) {
      const message = `No run command especified for ${codeFile.extension}.`;
      outputChannel.show();
      outputChannel.append(message);
      throw new Error(message);
    }

    if (runCmd.includes("$path"))
      runCmd = runCmd.replace("$path", codeFile.path);
    if (runCmd.includes("$output"))
      runCmd = runCmd.replace("$output", codeFile.output);

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
    proc.stdin?.write(codeFile.getInput());
    proc.stdin?.end();
    return proc;
  };

  const run = async (codeFile: CodeFile) => {
    const plConf = getProgrammingLanguage(codeFile);
    if (plConf.isCompiled) {
      const compiledOK = await compileCode(codeFile);
      if (compiledOK) return;
      throw new Error("Compilation error");
    }
    return execute(codeFile);
  };

  const saveFile = async (textEditor: TextEditor) => {
    if (textEditor && textEditor.document.isDirty) {
      return textEditor.document.save();
    }
  };

  const getCurrentTextEditor = (): TextEditor | undefined => {
    let fileTextEditor;

    const activeWindow = window.activeTextEditor;

    if (activeWindow) {
      if (activeWindow.document.uri.scheme === "file") {
        fileTextEditor = activeWindow;
      }

      if (activeWindow.document.uri.scheme === "output") {
        fileTextEditor = window.visibleTextEditors.find(
          v => v.document.uri.scheme === "file"
        );
      }
    }

    if (fileTextEditor) return fileTextEditor;

    throw new Error("File text editor not found");
  };

  let textEditor: TextEditor | undefined = getCurrentTextEditor();

  if (textEditor) {
    await saveFile(textEditor);

    const codeFile = new CodeFile(textEditor);

    if (codeFile.extension) {
      return await run(codeFile);
    } else {
      outputChannel.clear();
      outputChannel.append(
        `This command is not allowed for ${codeFile.extension} files.`
      );
    }
  } else {
    outputChannel.clear();
    outputChannel.append("Open a program and rerun the command.");
  }
  return undefined;
}
