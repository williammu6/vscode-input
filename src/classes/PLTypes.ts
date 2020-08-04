import * as cp from "child_process";

export class PL {
  execute(command: string, input: string): cp.ChildProcess {
    const proc: cp.ChildProcess = cp.exec(executeCmd, (err, stdout, stderr) => {
      /*
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
        */
    });
    proc.stdin?.write(input);
    proc.stdin?.end();
    return proc;
  }
}

export class InterpretedPL extends PL {
  constructor() {
    super();
  }
}

export class CompiledPL extends PL {
  async compile(command: string): Promise<boolean> {
    console.log(command);
    return true;
  }

  constructor() {
    super();
  }
}
