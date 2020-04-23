import * as vscode from "vscode";

export function errorMessage(message: string): void {
  vscode.window.showErrorMessage(message);
}

export function infoMessage(message: string): void {
  vscode.window.showInformationMessage(message);
}
