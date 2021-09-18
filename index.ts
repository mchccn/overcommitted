import { execSync } from "child_process";

let i = 0;

for (;;) {
  execSync(`git commit --allow-empty -m "."`);

  console.log(`commit ${i++}`);
}
