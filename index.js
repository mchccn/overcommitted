"use strict";
exports.__esModule = true;
var child_process_1 = require("child_process");
var path_1 = require("path");
var threads = Number(process.argv[2]) || 10;
var commits = Number(process.argv[3]) || 10;
var forever = Boolean(process.argv[4]);
if (__filename.split("/").reverse()[1] === "master") {
    if ((0, path_1.join)(process.cwd(), "index.js") !== __filename) {
        console.log("You must be inside the master repository.");
        process.exit();
    }
    console.log("Spawning ".concat(threads, " slave").concat(threads !== 1 ? "s" : "", "..."));
    var cleaned_1 = false;
    var exit = function () {
        if (!cleaned_1) {
            console.log("Cleaning up... please wait.");
            for (var i = 0; i < threads; i++)
                (0, child_process_1.execSync)("./merge.sh ".concat(i, " || echo \"Unable to merge 'slave-").concat(i, "'\""));
            (0, child_process_1.execSync)("rm -rf ../slave-*");
        }
        cleaned_1 = true;
        process.exit();
    };
    process.on("SIGINT", exit).on("exit", exit);
    var _loop_1 = function (i) {
        (0, child_process_1.execSync)("git clone ../master ../slave-".concat(i));
        var slave = (0, child_process_1.fork)("../slave-".concat(i, "/index.js"), [threads, commits, i].map(String), { cwd: (0, path_1.join)(process.cwd(), "..", "slave-".concat(i)) });
        slave.on("exit", function () {
            return (0, child_process_1.execSync)("./merge.sh ".concat(i, " || echo \"Unable to merge 'slave-").concat(i, "'\""));
        });
    };
    for (var i = 0; i < threads; i++) {
        _loop_1(i);
    }
}
else {
    var id = process.argv[4];
    (0, child_process_1.execSync)("git checkout -b slave-".concat(id));
    (0, child_process_1.execSync)("./commit.sh ".concat(id, " ").concat(commits, " ").concat(forever));
}
