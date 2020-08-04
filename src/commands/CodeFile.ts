import { TextEditor } from "vscode";
import * as fs from "fs";

export default class File {
  languageRegex = (fileExtension: string): RegExp => {
    const r: { [ext: string]: RegExp } = {
      cpp: /(?<=\*input\n)(.*\n)*(?=\*)/,
      py: /(?<="""input\n)(.*\n)*(?=")/
    };
    return r[fileExtension] as RegExp;
  };

  path: string;

  textEditor: TextEditor;

  output: string;

  extension: string;

  getFileExtension(): string {
    const splitted = this.path.split(".");
    if (splitted) {
      return splitted.pop() as string;
    }
    throw new Error("Invalid path");
  }

  getInput() {
    const content = fs.readFileSync(this.path, "utf8");
    const input = content.match(this.languageRegex(this.extension));
    if (input) {
      return input[0];
    }
    throw new Error("No input found");
  }

  getOutputFilename(): string {
    return this.path.split(".")[0];
  }

  isValid(): boolean {
    const allowedFileExtensions = Object.keys(mapExtensionConfig);
    return !!allowedFileExtensions.includes(this.extension);
  }

  constructor(textEditor: TextEditor) {
    this.textEditor = textEditor;
    this.path = this.textEditor.document.uri.fsPath;
    this.extension = this.getFileExtension();
    this.output = this.getOutputFilename();
  }
}
