import { execSync } from "child_process";

const times = 282941;

for (let i = times; i < 69_000_000 + 1; i++) {
  console.log(`Commit ${i} (${new Date().toLocaleTimeString()}):`);

  const now = Date.now();

  execSync(`git commit --allow-empty -m "${i}"`);

  console.log(`Done in ${Date.now() - now}ms`);
}

console.log(`Finished commiting ${times.toLocaleString()} times!`);
