import { execSync, fork } from "child_process";
import { join } from "path";

const threads = Number(process.argv[2]) || 10;
const commits = Number(process.argv[3]) || 10;
const forever = Boolean(process.argv[4]);

if (__filename.split("/").reverse()[1] === "master") {
  if (join(process.cwd(), "index.js") !== __filename) {
    console.log(`You must be inside the master repository.`);

    process.exit();
  }

  console.log(`Spawning ${threads} slave${threads !== 1 ? "s" : ""}...`);

  let cleaned = false;

  const exit = () => {
    if (!cleaned) {
      console.log(`Cleaning up... please wait.`);

      for (let i = 0; i < threads; i++)
        execSync(`./merge.sh ${i} || echo \"Unable to merge 'slave-${i}'\"`);

      execSync(`rm -rf ../slave-*`);
    }

    cleaned = true;

    process.exit();
  };

  process.on("SIGINT", exit).on("exit", exit);

  for (let i = 0; i < threads; i++) {
    execSync(`git clone ../master ../slave-${i}`);

    const slave = fork(
      `../slave-${i}/index.js`,
      [threads, commits, i].map(String),
      { cwd: join(process.cwd(), "..", `slave-${i}`) }
    );

    slave.on("exit", () =>
      execSync(`./merge.sh ${i} || echo \"Unable to merge 'slave-${i}'\"`)
    );
  }
} else {
  const id = process.argv[4];

  execSync(`git checkout -b slave-${id}`);

  execSync(`./commit.sh ${id} ${commits} ${forever}`);
}
