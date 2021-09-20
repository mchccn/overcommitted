import { execSync, fork } from "child_process";
import { rmSync } from "fs";
import { join } from "path";

const threads = Number(process.argv[2]) || 10;
const commits = Number(process.argv[3]) || 10;

if (__filename.split("/").reverse()[1] === "master") {
    console.log(`Spawning ${threads} slave${threads !== 1 ? "s" : ""}...`);

    for (let i = 0; i < threads; i++) {
        execSync(`git clone ../master ../slave-${i}`);

        execSync(`tsc ../slave-${i}/index.ts`);

        const slave = fork(`../slave-${i}/index.js`, [...process.argv.slice(2), i.toString()], { cwd: join(process.cwd(), "..", `slave-${i}`) });

        slave.on("message", (msg) => {
            if (msg === "EXIT") {
                execSync(`git remote remove local`);
                execSync(`git remote add local ../slave-${i}`);
                execSync(`git fetch local`);
                execSync(`git merge local/slave-${i}`);

                rmSync(`../slave-${i}`, { recursive: true, force: true });

                return slave.kill();
            }

            return console.log(`[slave-${i}]: ${msg.toString()}`);
        });
    }
} else {
    const id = process.argv[4];

    execSync(`git checkout -b slave-${id}`);

    for (let i = 1; i < commits * 1000; i++) {
        execSync(`git commit --allow-empty -m "[slave-${id}]: ${i}"`);

        process.send!(`commit ${i}`);
    }

    process.send!("EXIT");
}
