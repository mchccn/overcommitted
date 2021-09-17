import { execSync } from "child_process";

for (;;) {
    execSync(`git commit --allow-empty -m "."`);

    console.log("committed");
}
