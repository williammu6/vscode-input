interface IProgrammingLanguage {
  isCompiled: boolean;
  regex: RegExp;
}

export class C implements IProgrammingLanguage {
  isCompiled = true;

  regex = /(?<=\*input\n)(.*\n)*(?=\*)/;
}

export class Python implements IProgrammingLanguage {
  isCompiled = false;

  regex = /(?<="""input\n)(.*\n)*(?=")/;
}
