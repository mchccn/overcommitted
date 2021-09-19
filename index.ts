import { execSync, fork } from "child_process";
import { rmSync } from "fs";

if (__filename.split("/").reverse()[1] === "master") {
    const threads = Number(process.argv[2]) || 10;

    console.log(`Spawning ${threads} slaves...`);

    for (let i = 0; i < threads; i++) {
        execSync(`git clone ../master ../slave-${i}`);

        execSync(`tsc ../slave-${i}/index.ts`);

        const slave = fork(`../slave-${i}/index.js`);

        slave.on("message", (msg) => {
            console.log(msg.toString());
        });

        slave.kill();
    }

    // ! TEMP

    setTimeout(() => {
        for (let i = 0; i < threads; i++) {
            rmSync(`../slave-${i}`, { recursive: true, force: true });
        }
    }, 1000);
} else {
    process.send!("HELLO");
}
