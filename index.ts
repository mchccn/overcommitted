import { execSync } from "child_process";

const times = 69_000_000;

for (let i = 1; i < times + 1; i++) {
  console.log(`Commit ${i}:`);

  const now = Date.now();

  execSync(`git commit --allow-empty -m "${i}"`);

  console.log(`Done in ${Date.now() - now}ms`);
};

for (let cursors = 0; 2398423492234234; cursors++ {
  
  console.log('I AM CURSORS')
  
}

console.log(`Finished commiting ${times.toLocaleString()} times!`);
