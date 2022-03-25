import ts from "typescript";
import chalk from "chalk";
import rimraf from "rimraf";
import path from "path";

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (path) => path,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine,
};

export default { watch };

async function watch(
  dir: string,
  opts: {
    onBuild?: () => void;
    onError?: (diagnostic: ts.Diagnostic) => void;
  } = {}
) {
  const { onBuild, onError } = {
    onBuild: () => {},
    onError: () => {},
    ...opts,
  };

  const configPath = ts.findConfigFile(dir, ts.sys.fileExists, "tsconfig.json");
  if (!configPath) {
    throw new Error("Could not find a valid 'tsconfig.json'.");
  }

  // TypeScript can use several different program creation "strategies":
  //  * ts.createEmitAndSemanticDiagnosticsBuilderProgram,
  //  * ts.createSemanticDiagnosticsBuilderProgram
  //  * ts.createAbstractBuilder
  // The first two produce "builder programs". These use an incremental strategy
  // to only re-check and emit files whose contents may have changed, or whose
  // dependencies may have changes which may impact change the result of prior
  // type-check and emit.
  // The last uses an ordinary program which does a full type check after every
  // change.
  // Between `createEmitAndSemanticDiagnosticsBuilderProgram` and
  // `createSemanticDiagnosticsBuilderProgram`, the only difference is emit.
  // For pure type-checking scenarios, or when another tool/process handles emit,
  // using `createSemanticDiagnosticsBuilderProgram` may be more desirable.
  const createProgram = ts.createSemanticDiagnosticsBuilderProgram;

  // Note that there is another overload for `createWatchCompilerHost` that takes
  // a set of root files.
  const host = ts.createWatchCompilerHost(
    configPath,
    {},
    ts.sys,
    createProgram,
    (diagnostic) => {
      onError(diagnostic);
      reportDiagnostic(dir, diagnostic);
    },
    reportWatchStatusChanged
  );

  const origPostProgramCreate = host.afterProgramCreate;

  host.afterProgramCreate = (program) => {
    console.log(chalk.green("[built]"));
    onBuild();
    origPostProgramCreate!(program);
  };

  // `createWatchProgram` creates an initial program, watches files, and updates
  // the program over time.
  const dist = path.resolve(dir, "dist");
  rimraf(dist, {}, () => {
    console.log(chalk.yellow("[info] cleaned dist dir"));
    ts.createWatchProgram(host);
  });
}

function reportDiagnostic(dir: string, diagnostic: ts.Diagnostic) {
  if (diagnostic.file) {
    let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
      diagnostic.start!
    );
    const file = diagnostic.file.fileName.replace(`${dir}/`, "");
    console.log(
      `${chalk.red("[error]")} ${chalk.blue(file)}:${chalk.yellow(
        line
      )}:${chalk.yellow(character)} ${chalk.gray("\u21db")} ${JSON.stringify(
        diagnostic.messageText,
        null,
        2
      )}`
    );
    // console.log(line, character);
    // console.log("file");
    // console.log(
    //   `  Error ${diagnostic.file.fileName} (${line + 1},${character + 1})`
    // );
  }
  // console.error(
  //   "Error",
  //   diagnostic.code,
  //   ":",
  //   ts.flattenDiagnosticMessageText(
  //     diagnostic.messageText,
  //     formatHost.getNewLine()
  //   )
  // );
}

/**
 * Prints a diagnostic every time the watch status changes.
 * This is mainly for messages like "Starting compilation" or "Compilation completed".
 */
function reportWatchStatusChanged(diagnostic: ts.Diagnostic) {
  // console.log(diagnostic);
  // console.info(ts.formatDiagnostic(diagnostic, formatHost));
}
