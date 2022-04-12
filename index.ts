import { execSync, fork } from "child_process";
import { join } from "path";

const threads = Number(process.argv[2]) || 10;
const commits = Number(process.argv[3]) || 10;

if (__filename.split("/").reverse()[1] === "master") {
    if (join(process.cwd(), "index.js") !== __filename) {
        console.log(`You must be inside the master repository.`);

        process.exit();
    }

    console.log(`Spawning ${threads} slave${threads !== 1 ? "s" : ""}...`);

    const exit = () => {
        console.log(`Cleaning up... please wait.`);

        for (let i = 0; i < created; i++) execSync(`./merge.sh ${i} || echo \"Unable to merge 'slave-${i}'\"`);

        execSync(`rm -rf ../slave-*`);

        process.exit();
    };

    process.on("SIGINT", exit).on("SIGKILL", exit).on("SIGTERM", exit).on("SIGQUIT", exit).on("SIGSTOP", exit);

    let created = 0;

    for (let i = 0; i < threads; i++) {
        execSync(`git clone ../master ../slave-${i}`);

        const slave = fork(`../slave-${i}/index.js`, [threads, commits, i].map(String), { cwd: join(process.cwd(), "..", `slave-${i}`) });

        created++;

        slave.on("exit", () => execSync(`./merge.sh ${i} || echo \"Unable to merge 'slave-${i}'\"`));
    }
} else {
    const id = process.argv[4];

    execSync(`git checkout -b slave-${id}`);

    execSync(`./commit.sh ${id} ${commits}`);
}
