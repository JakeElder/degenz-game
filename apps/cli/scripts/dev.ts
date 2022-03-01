import { watcher } from "lib";
import cp from "recursive-copy";
import path from "path";

watcher.watch(path.resolve(__dirname, ".."), {
  onBuild() {
    cp(
      path.resolve(process.cwd(), "src/images"),
      path.resolve(process.cwd(), "dist/images"),
      { overwrite: true }
    );
  },
});
