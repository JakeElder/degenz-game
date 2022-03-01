const { watcher } = require("lib");
const path = require("path");
watcher.watch(path.resolve(__dirname, ".."));
