import { execSync, fork } from "child_process";
import { rmSync } from "fs";

const threads = Number(process.argv[2]) || 10;
const commits = Number(process.argv[3]) || 10;

if (__filename.split("/").reverse()[1] === "master") {
    console.log(`Spawning ${threads} slaves...`);

    for (let i = 0; i < threads; i++) {
        execSync(`git clone ../master ../slave-${i}`);

        execSync(`tsc ../slave-${i}/index.ts`);

        const slave = fork(`../slave-${i}/index.js`, process.argv.slice(2));

        slave.on("spawn", () => {
            slave.on("message", (msg) => {
                if (msg === "EXIT") {
                    rmSync(`../slave-${i}`, { recursive: true, force: true });

                    return slave.kill();
                }

                return console.log(`[slave-${i}]: ${msg.toString()}`);
            });
        });
    }
} else {
    // for (let i = 0; i < commits; i++) {}

    console.log(commits);

    process.send!("EXIT");
}
