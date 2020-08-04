import { IProgrammingLanguage } from "./IProgrammingLanguage";
import { InterpretedPL, CompiledPL } from "./PLTypes";

export class C extends CompiledPL implements IProgrammingLanguage {
  regex = /(?<=\*input\n)(.*\n)*(?=\*)/;

  constructor() {
    super();
  }
}

export class Python extends InterpretedPL implements IProgrammingLanguage {
  regex = /(?<="""input\n)(.*\n)*(?=")/;

  constructor() {
    super();
  }
}
