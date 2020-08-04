import { window, workspace, OutputChannel, TextEditor } from "vscode";
import * as cp from "child_process";

import CodeFile from "../classes/CodeFile";
import { Python, C } from "../classes/ProgrammingLanguages";
import { CompiledPL, PL } from "../classes/PLTypes";

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
    const message = `No run command especified for ${codeFile.extension}.`;
    outputChannel.show();
    outputChannel.append(message);
    throw new Error(message);
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

  const adjustCommand = (codeFile: CodeFile, command: string): string => {
    if (command.includes("$path"))
      command = command.replace("$path", codeFile.path);
    if (command.includes("$output"))
      command = command.replace("$output", codeFile.output);
    return command;
  };

  const compileCode = async (codeFile: CodeFile, plConf: CompiledPL) => {
    let compileCmd = getCompileCommand(codeFile);
    compileCmd = adjustCommand(codeFile, compileCmd);

    const compiledOK = await plConf.compile(compileCmd);
    if (!compiledOK) throw new Error("Compilation error");
  };

  const execute = (codeFile: CodeFile, plConf: PL): cp.ChildProcess => {
    let execCmd = getExecCommand(codeFile);

    execCmd = adjustCommand(codeFile, execCmd);

    const input = codeFile.getInput();

    return plConf.execute(execCmd, input);
  };

  const compileAndRun = async (codeFile: CodeFile) => {
    const plConf = getProgrammingLanguage(codeFile);
    if (plConf instanceof CompiledPL) {
      try {
        compileCode(codeFile, plConf);
      } catch (err) {
        throw err;
      }
    }
    return execute(codeFile, plConf);
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
      return await compileAndRun(codeFile);
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
