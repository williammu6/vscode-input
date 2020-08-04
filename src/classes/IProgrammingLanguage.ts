import * as cp from "child_process";

export interface IProgrammingLanguage {
  regex: RegExp;
  execute(command: string, input: string): cp.ChildProcess;
  compile?(command: string): Promise<boolean>;
}
